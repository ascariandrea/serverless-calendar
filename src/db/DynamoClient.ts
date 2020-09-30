import * as AWS from "aws-sdk"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as R from "fp-ts/lib/Record"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/pipeable"
import * as t from "io-ts"
import { optionFromNullable } from "io-ts-types"
import { PathReporter } from "io-ts/lib/PathReporter"
import { APIError } from "../models/APIError"
import { DBClient, Filters } from "./types/DBClient"

const toAPIError = (e: unknown): APIError => {
  if (t.object.is(e)) {
    if (e instanceof Error) {
      return {
        statusCode: 500,
        message: e.message,
      }
    }
  }

  return {
    statusCode: 500,
    message: "Unexpected error",
  }
}

const validationErrorToAPIError = (errors: t.Errors): APIError => {
  return {
    statusCode: 500,
    message: "Cannot validate object",
    details: PathReporter.report(E.left(errors)),
  }
}

const decode = <AttributesMap, A>(
  c: t.Decoder<AttributesMap, A>,
  attributes: AttributesMap
): E.Either<APIError, A> =>
  pipe(c.decode(attributes), E.mapLeft(validationErrorToAPIError))

const makeExpressionAttributeValues = (
  item: Record<string, any>
): Record<string, any> =>
  Object.keys(item)
    .filter((k) => !t.undefined.is(item[k]))
    .reduce(
      (acc, k) => ({
        ...acc,
        [`:${k}`]: item[k],
      }),
      {}
    )

const makeUpdateExpression = (item: Record<string, any>): string =>
  `SET ${Object.keys(item)
    .filter((k) => !t.undefined.is(item[k]))
    .map((k) => `${k} = :${k}`)}`

export const DynamoClient = (client: AWS.DynamoDB.DocumentClient): DBClient => {
  const put = (
    params: AWS.DynamoDB.DocumentClient.PutItemInput
  ): TE.TaskEither<APIError, AWS.DynamoDB.DocumentClient.PutItemOutput> =>
    TE.tryCatch(async () => await client.put(params).promise(), toAPIError)

  const scan = (
    params: AWS.DynamoDB.DocumentClient.ScanInput
  ): TE.TaskEither<APIError, AWS.DynamoDB.DocumentClient.ScanOutput> =>
    TE.tryCatch(async () => await client.scan(params).promise(), toAPIError)

  const get = (
    params: AWS.DynamoDB.DocumentClient.GetItemInput
  ): TE.TaskEither<APIError, AWS.DynamoDB.DocumentClient.GetItemOutput> =>
    TE.tryCatch(async () => await client.get(params).promise(), toAPIError)

  const edit = (
    params: AWS.DynamoDB.DocumentClient.UpdateItemInput
  ): TE.TaskEither<APIError, AWS.DynamoDB.DocumentClient.UpdateItemOutput> =>
    TE.tryCatch(async () => await client.update(params).promise(), toAPIError)

  const remove = (
    params: AWS.DynamoDB.DocumentClient.DeleteItemInput
  ): TE.TaskEither<APIError, AWS.DynamoDB.DocumentClient.DeleteItemOutput> =>
    TE.tryCatch(async () => await client.delete(params).promise(), toAPIError)

  return {
    insert: (table, item, codec) => {
      return pipe(
        put({
          TableName: table,
          Item: item,
        }),
        TE.chain(() =>
          get({
            TableName: table,
            Key: {
              id: item.id,
            },
          })
        ),
        TE.chainEitherK((o) => decode(codec.asDecoder(), o.Item))
      )
    },
    get: (table, item, codec) => {
      return pipe(
        get({ TableName: table, Key: { id: item.id } }),
        TE.chainEitherK((result) =>
          decode(optionFromNullable(codec).asDecoder(), result.Item)
        )
      )
    },
    select: (table, filters, codec) => {
      const buildFilterValues = (
        key: string,
        filter: Filters
      ): Record<string, any> => {
        switch (filter._type) {
          case "Date": {
            return {
              [`:${key}MinDate`]: filter.min.toISOString(),
              [`:${key}MaxDate`]: filter.max.toISOString(),
            }
          }
          case "String": {
            return { [`:${key}`]: key }
          }
        }
      }

      const buildFilterExpression = (key: string, filter: Filters): string => {
        switch (filter._type) {
          case "Date": {
            return `(${key} BETWEEN :${key}MinDate AND :${key}MaxDate)`
          }
          case "String": {
            return `${key} = :${key}`
          }
        }
      }

      const makeExpressionAttributeValuesV2 = (
        filters: Array<Record<string, Filters>>
      ): Record<string, any> => {
        return pipe(
          filters,
          A.map((filter) => {
            return pipe(
              filter,
              R.mapWithIndex(buildFilterValues),
              R.reduce({}, (acc, r) => ({
                ...acc,
                ...r,
              }))
            )
          }),
          A.reduce({}, (acc, r) => ({ ...acc, ...r }))
        )
      }

      const makeFilterExpression = (
        filters: Array<Record<string, Filters>>
      ): string => {
        return filters
          .map((rec) => {
            return pipe(
              rec,
              R.mapWithIndex(buildFilterExpression),
              R.toArray,
              (filtersInAnd) =>
                filtersInAnd.map(([_, filter]) => filter).join(" AND ")
            )
          })
          .join(" OR ")
      }

      const ExpressionAttributeValues = A.isEmpty(filters)
        ? undefined
        : makeExpressionAttributeValuesV2(filters)

      const FilterExpression = A.isEmpty(filters)
        ? undefined
        : makeFilterExpression(filters)

      return pipe(
        scan({
          TableName: table,
          ExpressionAttributeValues,
          FilterExpression,
        }),
        TE.chainEitherK((result) =>
          decode(t.array(codec).asDecoder(), result.Items)
        )
      )
    },
    edit: (table, { id, ...item }, codec) => {
      const ExpressionAttributeValues = makeExpressionAttributeValues(item)
      const UpdateExpression = makeUpdateExpression(item)
      
      return pipe(
        edit({
          TableName: table,
          Key: { id: id },
          ExpressionAttributeValues,
          UpdateExpression,
        }),
        TE.chain(() => get({ TableName: table, Key: { id } })),
        TE.chainEitherK((result) => decode(codec, result.Item))
      )
    },
    remove: (table, item) => {
      return pipe(
        remove({ TableName: table, Key: { id: item.id } }),
        TE.map(() => true)
      )
    },
  }
}

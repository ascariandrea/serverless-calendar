import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { task } from "fp-ts/lib/Task"
import { TaskEither } from "fp-ts/lib/TaskEither"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/pipeable"
import * as t from "io-ts"
import { APIError, BadRequestError } from "../models/APIError"
import { Endpoint } from "./Endpoint"

interface APIResponse<T> {
  statusCode: 200 | 201
  body: T
}

interface DecodedData<E extends Endpoint<any, any, any, any, any>> {
  QueryParams: t.TypeOf<E["Inputs"]["QueryParams"]>
  PathParams: t.TypeOf<E["Inputs"]["PathParams"]>
  Headers: t.TypeOf<E["Inputs"]["Headers"]>
  Body: t.TypeOf<E["Inputs"]["Body"]>
}

export type APIHandler = <T>(
  f: (
    event: APIGatewayProxyEvent,
    context: Context
  ) => TaskEither<Error, APIResponse<T>>
) => APIGatewayProxyHandler

export const APIHandler = <
  E extends Endpoint<
    t.Type<any>,
    t.Type<any>,
    t.Type<any>,
    t.Type<any>,
    t.Type<any>
  >
>(
  endpoint: E,
  handler: (
    data: DecodedData<E>
  ) => TaskEither<APIError, APIResponse<t.TypeOf<E["Output"]>>>
): APIGatewayProxyHandler => {

  return async (e, _context) =>
    await pipe(
      sequenceS(TE.taskEither)({
        QueryParams: TE.fromEither(
          endpoint.Inputs.QueryParams.decode(e.queryStringParameters)
        ),
        PathParams: TE.fromEither(
          endpoint.Inputs.PathParams.decode(e.pathParameters)
        ),
        Headers: TE.fromEither(endpoint.Inputs.Headers.decode(e.headers)),
        Body: pipe(
          e.body !== null
            ? E.parseJSON(e.body, (e) => [
                t.getValidationError(e, t.getDefaultContext(t.object)),
              ])
            : E.right(e.body),
          E.chain(endpoint.Inputs.Body.decode),
          TE.fromEither
        ),
      }),
      TE.mapLeft((errs) => BadRequestError(errs)),
      TE.chain(handler),
      TE.fold(
        (error) => {
          return task.of<APIGatewayProxyResult>({
            statusCode: error.statusCode,
            body: JSON.stringify({
              message: error.message,
              details: error.details,
            }),
          })
        },
        (response) =>
          task.of<APIGatewayProxyResult>({
            statusCode: response.statusCode,
            body: JSON.stringify(response.body),
          })
      )
    )()
}

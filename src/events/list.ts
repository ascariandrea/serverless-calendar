import { APIGatewayProxyHandler } from "aws-lambda"
import * as O from "fp-ts/lib/Option"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/pipeable"
import { dbClient } from "../db"
import { APIHandler } from "../helpers/APIHandler"
import { ListEventEndpoint } from "../models/Event"
import { EventService } from "../services/EventService"

export const list: APIGatewayProxyHandler = APIHandler(
  ListEventEndpoint,
  ({ QueryParams }) => {
    const year = pipe(
      O.fromNullable(QueryParams?.year),
      O.chain(y => y)
    )

    const week = pipe(
      O.fromNullable(QueryParams?.week),
      O.chain(w => w)
    )

    return pipe(
      EventService(dbClient).list({ year, week }),
      TE.map((events) => ({ statusCode: 200, body: events }))
    )
  }
)

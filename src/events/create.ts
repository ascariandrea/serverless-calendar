import { APIGatewayProxyHandler } from "aws-lambda"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function"
import { dbClient } from "../db"
import { APIHandler } from "../helpers/APIHandler"
import { CreateEventEndpoint } from "../models/Event"
import { EventService } from "../services/EventService"

export const create: APIGatewayProxyHandler = APIHandler(
  CreateEventEndpoint,
  ({ Body }) =>
    pipe(
      EventService(dbClient).add(Body),
      TE.map((event) => ({
        statusCode: 201,
        body: event,
      }))
    )
)

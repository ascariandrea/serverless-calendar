import { APIGatewayProxyHandler } from "aws-lambda"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function"
import { dbClient } from "../db"
import { APIHandler } from "../helpers/APIHandler"
import { GetEventEndpoint } from "../models/Event"
import { EventService } from "../services/EventService"

export const get: APIGatewayProxyHandler = APIHandler(
  GetEventEndpoint,
  ({ PathParams }) =>
    pipe(
      EventService(dbClient).get(PathParams.id),
      TE.map((event) => ({
        statusCode: 201,
        body: event,
      }))
    )
)

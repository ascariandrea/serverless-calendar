import { APIGatewayProxyHandler } from "aws-lambda"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function"
import { dbClient } from "../db"
import { APIHandler } from "../helpers/APIHandler"
import { RemoveEventEndpoint } from "../models/Event"
import { EventService } from "../services/EventService"

export const remove: APIGatewayProxyHandler = APIHandler(
  RemoveEventEndpoint,
  ({ PathParams }) =>
    pipe(
      EventService(dbClient).remove(PathParams.id),
      TE.map((event) => ({
        statusCode: 201,
        body: event,
      }))
    )
)

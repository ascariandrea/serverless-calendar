import { APIGatewayProxyHandler } from "aws-lambda"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function"
import { dbClient } from "../db"
import { APIHandler } from "../helpers/APIHandler"
import { EditEventEndpoint } from "../models/Event"
import { EventService } from "../services/EventService"

export const edit: APIGatewayProxyHandler = APIHandler(
  EditEventEndpoint,
  ({ PathParams, Body }) =>
    pipe(
      EventService(dbClient).edit(PathParams.id, Body),
      TE.map((event) => ({
        statusCode: 200,
        body: event,
      }))
    )
)

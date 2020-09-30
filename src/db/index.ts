import * as AWS from "aws-sdk"
import { DynamoClient } from "./DynamoClient"

const options: AWS.DynamoDB.DocumentClient.DocumentClientOptions &
  AWS.DynamoDB.Types.ClientConfiguration = {
  ...(process.env.IS_OFFLINE === "true"
    ? {
        region: "localhost",
        endpoint: "http://localhost:8008",
      }
    : {}),
}

const client = new AWS.DynamoDB.DocumentClient(options)

export const dbClient = DynamoClient(client)

import * as E from "fp-ts/lib/Either"
import * as t from "io-ts"
import { PathReporter } from "io-ts/lib/PathReporter"

export interface APIError {
  statusCode: number
  message: string
  details?: string[]
}

export const BadRequestError = (errs: t.Errors): APIError => ({
  statusCode: 400,
  message: "Bad Request",
  details: PathReporter.report(E.left(errs)),
})

export const NotFound = (key: string): APIError => ({
  statusCode: 400,
  message: "Not Found",
  details: [
    `Can't find the resource by the given '${key}'`
  ]
})

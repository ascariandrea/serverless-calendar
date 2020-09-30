import type { Option } from "fp-ts/lib/Option"
import * as TE from "fp-ts/lib/TaskEither"
import * as t from "io-ts"
import { APIError } from "../../models/APIError"
import { Model } from "../../models/Model"

interface DateFilter {
  _type: 'Date',
  min: Date,
  max: Date
}

interface StringFilter {
  _type: 'String'
  value: string
}

export type Filters = StringFilter | DateFilter

export interface DBClient {
  select: <R>(
    table: string,
    filters: Array<Record<string, Filters>>,
    codec: t.Type<R, unknown>
  ) => TE.TaskEither<APIError, R[]>
  get: <R, T extends Model = Model>(
    table: string,
    item: T,
    codec: t.Type<R, unknown>
  ) => TE.TaskEither<APIError, Option<R>>
  insert: <R, T extends Model = Model>(
    table: string,
    item: T,
    codec: t.Type<R, unknown>
  ) => TE.TaskEither<APIError, R>
  edit: <R, T extends Model = Model>(
    table: string,
    item: T,
    codec: t.Type<R, unknown>
  ) => TE.TaskEither<APIError, R>
  remove: <T extends Model = Model>(
    table: string,
    item: T
  ) => TE.TaskEither<APIError, boolean>
}

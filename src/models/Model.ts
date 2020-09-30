import * as t from "io-ts"
import { Id } from "./Id"

export const Model = t.intersection([Id, t.record(t.string, t.any)], "Model")

export type Model = t.TypeOf<typeof Model>

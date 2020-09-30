import * as t from "io-ts"
import {
  optionFromNullable,
  DateFromISOString,
  NumberFromString,
} from "io-ts-types"
import { Endpoint } from "../helpers/Endpoint"
import { Id } from "./Id"

export const CreateEventData = t.strict(
  {
    title: t.string,
    description: t.string,
    startDate: DateFromISOString,
    endDate: DateFromISOString,
    address: t.string,
  },
  "CreateEventData"
)

export type CreateEventData = t.TypeOf<typeof CreateEventData>

export const EditEventData = t.strict(
  {
    title: t.union([t.undefined, t.string]),
    description: t.union([t.undefined, t.string]),
    startDate: t.union([t.undefined, DateFromISOString]),
    endDate: t.union([t.undefined, DateFromISOString]),
  },
  "EditEventData"
)

export type EditEventData = t.TypeOf<typeof EditEventData>

export const Event = t.strict(
  {
    ...Id.props,
    ...CreateEventData.type.props,
    startDate: t.string,
    endDate: t.string,
    createdAt: t.string,
    updatedAt: t.string,
  },
  "Event"
)

export type Event = t.TypeOf<typeof Event>

const ListEventQueryParams = t.union(
  [
    t.null,
    t.strict({
      year: optionFromNullable(NumberFromString),
      week: optionFromNullable(NumberFromString),
    }),
  ],
  "ListEventQueryParams"
)

type ListEventQueryParams = t.TypeOf<typeof ListEventQueryParams>

export const ListEventEndpoint = Endpoint({
  Inputs: {
    QueryParams: ListEventQueryParams,
    PathParams: t.unknown,
    Headers: t.unknown,
    Body: t.unknown,
  },
  Output: t.array(Event),
})

export const GetEventEndpoint = Endpoint({
  Inputs: {
    QueryParams: t.unknown,
    PathParams: Id,
    Headers: t.unknown,
    Body: t.unknown,
  },
  Output: Event,
})

export const CreateEventEndpoint = Endpoint({
  Inputs: {
    QueryParams: t.unknown,
    PathParams: t.unknown,
    Headers: t.unknown,
    Body: CreateEventData,
  },
  Output: Event,
})

export const EditEventEndpoint = Endpoint({
  Inputs: {
    QueryParams: t.unknown,
    PathParams: Id,
    Headers: t.unknown,
    Body: EditEventData,
  },
  Output: Event,
})

export const RemoveEventEndpoint = Endpoint({
  Inputs: {
    QueryParams: t.unknown,
    PathParams: Id,
    Headers: t.unknown,
    Body: t.unknown,
  },
  Output: t.boolean,
})

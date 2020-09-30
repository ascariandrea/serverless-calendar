import { addWeeks } from "date-fns/fp"
import * as A from "fp-ts/lib/Array"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/pipeable"
import { DBClient, Filters } from "../db/types/DBClient"
import uuid from "../helpers/UUID"
import { APIError, NotFound } from "../models/APIError"
import { Event, EditEventData, CreateEventData } from "../models/Event"


export interface EventService {
  list: (filters: {
    year: O.Option<number>
    week: O.Option<number>
  }) => TE.TaskEither<APIError, Event[]>
  get: (id: string) => TE.TaskEither<APIError, Event>
  add: (data: CreateEventData) => TE.TaskEither<APIError, Event>
  edit: (id: string, data: EditEventData) => TE.TaskEither<APIError, Event>
  remove: (id: string) => TE.TaskEither<APIError, boolean>
}

const EVENTS_TABLE = process.env.DYNAMODB_TABLE

const getDateFilter = (
  year: O.Option<number>,
  week: O.Option<number>
): Array<Record<string, Filters>> => {
  if (O.isSome(year)) {
    const minWeek = O.getOrElse(() => 0)(week)
    const maxWeek = O.getOrElse(() => 51)(week)

    const startOfYheYear = new Date(year.value, 0, 1)
    const minDate = addWeeks(minWeek)(startOfYheYear)
    const maxDate = addWeeks(maxWeek + 1)(startOfYheYear)

    return [
      {
        startDate: {
          _type: "Date",
          min: minDate,
          max: maxDate,
        },
      },
      {
        endDate: {
          _type: "Date",
          min: minDate,
          max: maxDate,
        },
      },
    ]
  }

  if (O.isSome(week)) {
    const startOfYheYear = new Date(new Date().getFullYear(), 0, 1)
    const minDate = addWeeks(week.value)(startOfYheYear)
    const maxDate = addWeeks(week.value + 1)(startOfYheYear)

    return [
      {
        startDate: {
          _type: "Date",
          min: minDate,
          max: maxDate,
        },
      },
      {
        endDate: {
          _type: "Date",
          min: minDate,
          max: maxDate,
        },
      },
    ]
  }

  return []
}

export const EventService = (client: DBClient): EventService => {
  return {
    list: ({ year, week }) => {
      const dateFilter = getDateFilter(year, week)

      return pipe(
        client.select<Event>(EVENTS_TABLE, [...dateFilter], Event),
        TE.map(
          A.sort(
            Ord.ord.contramap(Ord.ordDate, (e: Event) => new Date(e.startDate))
          )
        )
      )
    },
    get: (id) =>
      pipe(
        client.get<Event>(EVENTS_TABLE, { id }, Event),
        TE.chain(TE.fromOption(() => NotFound("id")))
      ),
    add: (data) =>
      pipe(
        client.insert<Event, Event>(
          EVENTS_TABLE,
          {
            ...data,
            id: uuid(),
            startDate: data.startDate.toISOString(),
            endDate: data.endDate.toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          Event
        )
      ),
    edit: (id, data) =>
      pipe(
        client.edit(
          EVENTS_TABLE,
          {
            ...data,
            id,
            startDate: data.startDate?.toISOString(),
            endDate: data.endDate?.toISOString(),
            updatedAt: new Date().toISOString()
          },
          Event
        )
      ),
    remove: (id) => pipe(client.remove(EVENTS_TABLE, { id })),
  }
}

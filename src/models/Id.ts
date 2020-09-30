import * as t from 'io-ts'

export const Id = t.type({
  id: t.string
}, 'Id')

export type Id = t.TypeOf<typeof Id>
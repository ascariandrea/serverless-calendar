import * as t from "io-ts"

export interface Endpoint<
  Q extends t.Type<any>,
  P extends t.Type<any>,
  H extends t.Type<any>,
  B extends t.Type<any>,
  O extends t.Type<any>
> {
  Inputs: {
    QueryParams: Q
    PathParams: P
    Headers: H
    Body: B
  }
  Output: O

}

export const Endpoint = <
  Q extends t.Type<any>,
  P extends t.Type<any>,
  H extends t.Type<any>,
  B extends t.Type<any>,
  O extends t.Type<any>
>(
  endpoint: Endpoint<Q, P, H, B, O>
): Endpoint<Q, P, H, B, O> => endpoint

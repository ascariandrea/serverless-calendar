# Serverless Calendar

> A simple agenda REST API implementation with [serverless](https://www.serverless.com/) framework and AWS provider.

The service is deployed [here](https://elz163a380.execute-api.eu-central-1.amazonaws.com/dev/events)

## Architecture

This is a sample REST API that perform CRUD operations on `event` resource.
Data is stored in *DynamoDB* and the service is deployed on *AWS*.

Source code is written in TypeScript and it uses a functional approach with [`fp-ts`](https://github.com/gcanti/fp-ts) and [`io-ts`](https://github.com/gcanti/io-ts).

## API

API endpoints are defined as a structure of `io-ts` types and used to validate request payload and response outputs.

### Events

#### List

List all events filtered by given query params

**[Endpoint](./src/models/Event.ts#L62):** GET /events

**[QueryParams](./src/models/Event.ts#L64):** [ListEventQueryParams](./src/models/Event.ts#L49)

- year: the selected year (optional)
- week: the selected week (optional)

**[Output](./src/models/Event.ts#L69):** [Event](./src/models/Event.ts#L35)[]

#### Get

Get event details

**[Endpoint](./src/models/Event.ts#L72):** GET /events/{id}

**[PathParams](./src/models/Event.ts#L75):** [Id](./src/models/Id.ts)

- id: the event id to retrieve

**[Output](./src/models/Event.ts#L79):** [Event](./src/models/Event.ts#L35)

#### Create

Create an event

**[Endpoint](./src/models/Event.ts#L82):** POST /events

**[Body](./src/models/Event.ts#L87):** [CreateEventData](./src/models/Event.ts#L10)

- title: event title
- description: event description
- address: event address
- startDate: event start date
- endDate: event end date

**[Output](./src/models/Event.ts#89):** [Event](./src/models/Event.ts#L35)

#### Edit

Modify the event

**[Endpoint](./src/models/Event.ts#L92):** PUT /events/{id}

**[PathParams](./src/models/Event.ts#L95):** [Id](./src/models/Id.ts)

- id: event id

**[Body](./src/models/Event.ts#L97):** [EditEventData](./src/models/Event.ts#L23)

- title: event title (optional)
- description: event description (optional)
- address: event address (optional)
- startDate: event start date (optional)
- endDate: event end date (optional)

**[Output](./src/models/Event.ts#L99):** [Event](./src/models/Event.ts#L35)

#### Remove

Remove an event by id

**[Endpoint](./src/models/Event.ts#L102):** DELETE /events/{id}

**[PathParams](./src/models/Event.ts#L105):**

- id: event id

**[Output](./src/models/Event.ts#109):** boolean

## Development

### Requirements

- `node`

### Install dependencies

```sh
npm i
```

### Run locally

It will start an http server listening on `http://localhost:3000/local`

```sh
npm run dev
```

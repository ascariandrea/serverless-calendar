declare namespace NodeJS {
  interface ProcessEnv {
    IS_OFFLINE: "true" | undefined
    DYNAMODB_TABLE: string
  }
}

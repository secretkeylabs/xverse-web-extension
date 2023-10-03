export enum ImportLedgerSteps {
  START = 0,
  SELECT_ASSET = 1,
  BEFORE_START = 2,
  IMPORTANT_WARNING = 3,
  CONNECT_LEDGER = 4,
  ADD_MULTIPLE_ACCOUNTS = 4.5,
  ADD_ADDRESS = 5,
  ADD_ORDINALS_ADDRESS = 5.5,
  ADDRESS_ADDED = 6,
  ADD_ACCOUNT_NAME = 7,
  IMPORT_END = 8,
}

export enum LedgerLiveOptions {
  USING = 'using',
  NOT_USING = 'not using',
}

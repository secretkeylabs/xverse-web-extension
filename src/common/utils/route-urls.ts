enum RequestsRoutes {
  Home = '/',
  TransactionRequest = '/transaction-request',
  StxSignTransactions = '/stx-sign-transactions',
  AuthenticationRequest = '/authentication-request',
  SignatureRequest = '/signature-request',
  SignMessageRequest = '/sign-message-request',
  SignRuneDelistingMessage = '/sign-rune-delisting-message',
  AddressRequest = '/btc-select-address-request',
  StxAddressRequest = '/stx-select-address-request',
  StxAccountRequest = '/stx-select-account-request',
  SignBtcTx = '/psbt-signing-request',
  SignBatchBtcTx = '/batch-psbt-signing-request',
  RuneListingBatchSigning = '/rune-listing-batch-signing',
  SendBtcTx = '/btc-send-request',
  CreateInscription = '/create-inscription',
  CreateRepeatInscriptions = '/create-repeat-inscriptions',
  ConnectionRequest = '/connection-request',
  MintRune = '/mint-rune',
  EtchRune = '/etch-rune',
  ChangeNetworkRequest = '/change-network-request',
}

export default RequestsRoutes;

enum RequestsRoutes {
  Home = '/',
  TransactionRequest = '/transaction-request',
  AuthenticationRequest = '/authentication-request',
  SignatureRequest = '/signature-request',
  SignMessageRequest = '/sign-message-request',
  SignMessageRequestInApp = '/sign-message-request-in-app',
  AddressRequest = '/btc-select-address-request',
  StxAddressRequest = '/stx-select-address-request',
  StxAccountRequest = '/stx-select-account-request',
  SignBtcTx = '/psbt-signing-request',
  SignBatchBtcTx = '/batch-psbt-signing-request',
  SendBtcTx = '/btc-send-request',
  CreateInscription = '/create-inscription',
  CreateRepeatInscriptions = '/create-repeat-inscriptions',
  ConnectionRequest = '/connection-request',
  MintRune = '/mint-rune',
  EtchRune = '/etch-rune',
}

export default RequestsRoutes;

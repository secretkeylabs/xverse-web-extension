enum RequestsRoutes {
  Home = '/',
  TransactionRequest = '/transaction-request',
  AuthenticationRequest = '/authentication-request',
  SignatureRequest = '/signature-request',
  AddressRequest = '/btc-select-address-request',
  SignBtcTx = '/psbt-signing-request',
  SendBtcTx = '/btc-send-request',
  CreateTextInscription = '/create-text-inscription',
  CreateFileInscription = '/create-file-inscription',
}

export default RequestsRoutes;

enum RequestsRoutes {
  Home = '/',
  TransactionRequest = '/transaction-request',
  AuthenticationRequest = '/authentication-request',
  SignatureRequest = '/signature-request',
  AddressRequest = '/btc-select-address-request',
  SignBtcTx = '/psbt-signing-request',
  SendBtcTx = '/btc-send-request',
}

export default RequestsRoutes;

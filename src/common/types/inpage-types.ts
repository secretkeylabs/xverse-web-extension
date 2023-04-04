/**
 * Inpage Script (Stacks Provider) <-> Content Script
 */
export enum DomEventName {
  authenticationRequest = 'stacksAuthenticationRequest',
  signatureRequest = 'signatureRequest',
  structuredDataSignatureRequest = 'structuredDataSignatureRequest',
  transactionRequest = 'stacksTransactionRequest',
  getAddressRequest = 'SatsAddressRequest',
  signPsbtRequest = 'SatsPsbtRequest',
}

export interface AuthenticationRequestEventDetails {
  authenticationRequest: string;
}

export type AuthenticationRequestEvent = CustomEvent<AuthenticationRequestEventDetails>;

export interface SignatureRequestEventDetails {
  signatureRequest: string;
}

export type SignatureRequestEvent = CustomEvent<SignatureRequestEventDetails>;

export interface TransactionRequestEventDetails {
  transactionRequest: string;
}

export type TransactionRequestEvent = CustomEvent<TransactionRequestEventDetails>;

export interface GetAddressRequestEventDetails {
  btcAddressRequest: string;
}

export type GetAddressRequestEvent = CustomEvent<GetAddressRequestEventDetails>;

export interface SignPsbtRequestEventDetails {
  signPsbtRequest: string;
}

export type SignPsbtRequestEvent = CustomEvent<SignPsbtRequestEventDetails>;

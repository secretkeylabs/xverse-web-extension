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
  signBatchPsbtRequest = 'SatsBatchPsbtRequest',
  signMessageRequest = 'SatsSignMessage',
  sendBtcRequest = 'SatsSendBtcRequest',
  createInscriptionRequest = 'SatsCreateInscriptionRequest',
  createRepeatInscriptionsRequest = 'SatsCreateRepeatInscriptionsRequest',
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

export interface SignBatchPsbtRequestEventDetails {
  signBatchPsbtRequest: string;
}

export type SignBatchPsbtRequestEvent = CustomEvent<SignBatchPsbtRequestEventDetails>;

export interface SignMessageRequestEventDetails {
  signMessageRequest: string;
}

export type SignMessageRequestEvent = CustomEvent<SignMessageRequestEventDetails>;

export interface SendBtcRequestEventDetails {
  sendBtcRequest: string;
}

export type SendBtcRequestEvent = CustomEvent<SendBtcRequestEventDetails>;

export interface CreateInscriptionEventDetails {
  createInscriptionRequest: string;
}

export type CreateInscriptionEvent = CustomEvent<CreateInscriptionEventDetails>;

export interface CreateRepeatInscriptionsEventDetails {
  createRepeatInscriptionsRequest: string;
}

export type CreateRepeatInscriptionsEvent = CustomEvent<CreateRepeatInscriptionsEventDetails>;

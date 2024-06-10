import { RpcBase } from 'sats-connect';

/**
 * Inpage Script (Stacks Provider / BitcoinProvider) <-> Content Script
 */
export enum DomEventName {
  addStakedBitcoinRequest = 'xverse_staked_add_staked_bitcoin_request',
  getStakedBitcoinRequest = 'xverse_staked_get_staked_bitcoin_request',
  authenticationRequest = 'xverse_stx_authentication_request',
  signatureRequest = 'xverse_stx_signature_request',
  structuredDataSignatureRequest = 'xverse_stx_structured_data_signature_request',
  transactionRequest = 'xverse_stx_transaction_request',
  getAddressRequest = 'xverse_btc_address_request',
  signPsbtRequest = 'xverse_btc_sats_psbt_request',
  signBatchPsbtRequest = 'xverse_btc_batch_psbt_request',
  signMessageRequest = 'xverse_btc_sign_message_request',
  sendBtcRequest = 'xverse_btc_send_request',
  createInscriptionRequest = 'xverse_btc_create_inscription_Request',
  createRepeatInscriptionsRequest = 'xverse_btc_create_repeat_inscriptions_request',
  rpcRequest = 'xverse_rpc_request',
}
export interface AddStakedBitcoinEventDetails {
  addStakedBitcoinRequest: string;
}
export type AddStakedBitcoinEvent = CustomEvent<AddStakedBitcoinEventDetails>;

export interface GetStakedBitcoinEventDetails {
  getStakedBitcoinRequest: string;
}
export type GetStakedBitcoinEvent = CustomEvent<GetStakedBitcoinEventDetails>;

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

export interface RpcRequest<T extends string, U> extends RpcBase {
  method: T;
  params: U;
}

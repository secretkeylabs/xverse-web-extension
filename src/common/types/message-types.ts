import {
  CreateInscriptionResponse,
  CreateRepeatInscriptionsResponse,
  GetAddressResponse,
  RpcId,
  SignMultipleTransactionsResponse,
  SignTransactionResponse,
  type Params,
  type Requests,
} from '@sats-connect/core';
import { FinishedTxPayload, SignatureData, SponsoredFinishedTxPayload } from '@stacks/connect';

export const MESSAGE_SOURCE = 'xverse-wallet';

export const CONTENT_SCRIPT_PORT = 'xverse-content-script';

/**
 * Stacks External Callable Methods
 * @enum {string}
 */
export enum StacksLegacyMethods {
  transactionRequest = 'transactionRequest',
  transactionResponse = 'transactionResponse',
  authenticationRequest = 'authenticationRequest',
  authenticationResponse = 'authenticationResponse',
  signatureRequest = 'signatureRequest',
  signatureResponse = 'signatureResponse',
  structuredDataSignatureRequest = 'structuredDataSignatureRequest',
  structuredDataSignatureResponse = 'structuredDataSignatureResponse',
}

enum RpcMethods {
  request = 'request',
}

export enum InternalMethods {
  OriginatingTabClosed = 'OriginatingTabClosed',
}

export type ExtensionMethods =
  | StacksLegacyMethods
  | SatsConnectMethods
  | InternalMethods
  | RpcMethods;

interface BaseMessage {
  source: typeof MESSAGE_SOURCE;
  method: ExtensionMethods;
}

/**
 * Content Script <-> Background Script
 */
export interface Message<Methods extends ExtensionMethods, Payload = undefined>
  extends BaseMessage {
  method: Methods;
  payload: Payload;
}

type AuthenticationRequestMessage = Message<StacksLegacyMethods.authenticationRequest, string>;

export type AuthenticationResponseMessage = Message<
  StacksLegacyMethods.authenticationResponse,
  {
    authenticationRequest: string;
    authenticationResponse: string;
  }
>;

type SignatureRequestMessage = Message<StacksLegacyMethods.signatureRequest, string>;

export type SignatureResponseMessage = Message<
  StacksLegacyMethods.signatureResponse,
  {
    signatureRequest: string;
    signatureResponse: SignatureData | string;
  }
>;

type StructuredDataSignatureRequestMessage = Message<
  StacksLegacyMethods.structuredDataSignatureRequest,
  string
>;

type TransactionRequestMessage = Message<StacksLegacyMethods.transactionRequest, string>;

export type TxResult = SponsoredFinishedTxPayload | FinishedTxPayload;

export type TransactionResponseMessage = Message<
  StacksLegacyMethods.transactionResponse,
  {
    transactionRequest: string;
    transactionResponse: TxResult | string;
  }
>;

export type LegacyMessageFromContentScript =
  | AuthenticationRequestMessage
  | TransactionRequestMessage
  | SignatureRequestMessage
  | StructuredDataSignatureRequestMessage;

export type LegacyMessageToContentScript =
  | AuthenticationResponseMessage
  | TransactionResponseMessage
  | SignatureResponseMessage;

/**
 * Sats External Callable Methods
 * @enum {string}
 */
export enum SatsConnectMethods {
  getAddressRequest = 'getAddressRequest',
  getAddressResponse = 'getAddressResponse',
  signPsbtRequest = 'signPsbtRequest',
  signBatchPsbtRequest = 'signBatchPsbtRequest',
  signPsbtResponse = 'signPsbtResponse',
  signBatchPsbtResponse = 'signBatchPsbtResponse',
  signMessageRequest = 'signMessageRequest',
  signMessageResponse = 'signMessageResponse',
  sendBtcRequest = 'sendBtcRequest',
  sendBtcResponse = 'sendBtcResponse',
  createInscriptionRequest = 'createInscriptionRequest',
  createInscriptionResponse = 'createInscriptionResponse',
  createRepeatInscriptionsRequest = 'createRepeatInscriptionsRequest',
  createRepeatInscriptionsResponse = 'createRepeatInscriptionsResponse',
  request = 'request',
}

type GetAddressRequestMessage = Message<SatsConnectMethods.getAddressRequest, string>;

export type GetAddressResponseMessage = Message<
  SatsConnectMethods.getAddressResponse,
  {
    addressRequest: string;
    addressResponse: GetAddressResponse | string;
  }
>;

type SignPsbtRequestMessage = Message<SatsConnectMethods.signPsbtRequest, string>;

type SignBatchPsbtRequestMessage = Message<SatsConnectMethods.signBatchPsbtRequest, string>;

export type SignPsbtResponseMessage = Message<
  SatsConnectMethods.signPsbtResponse,
  {
    signPsbtRequest: string;
    signPsbtResponse: SignTransactionResponse | string;
  }
>;

export type SignBatchPsbtResponseMessage = Message<
  SatsConnectMethods.signBatchPsbtResponse,
  {
    signBatchPsbtRequest: string;
    signBatchPsbtResponse: SignMultipleTransactionsResponse | string;
  }
>;

type SignMessageRequestMessage = Message<SatsConnectMethods.signMessageRequest, string>;

export type SignMessageResponseMessage = Message<
  SatsConnectMethods.signMessageResponse,
  {
    signMessageRequest: string;
    signMessageResponse: string;
  }
>;

type SendBtcRequestMessage = Message<SatsConnectMethods.sendBtcRequest, string>;

export type SendBtcResponseMessage = Message<
  SatsConnectMethods.sendBtcResponse,
  {
    sendBtcRequest: string;
    sendBtcResponse: string;
  }
>;

type CreateInscriptionRequestMessage = Message<SatsConnectMethods.createInscriptionRequest, string>;

export type CreateInscriptionResponseMessage = Message<
  SatsConnectMethods.createInscriptionResponse,
  {
    createInscriptionRequest: string;
    createInscriptionResponse: CreateInscriptionResponse | string;
  }
>;

type CreateRepeatInscriptionsRequestMessage = Message<
  SatsConnectMethods.createRepeatInscriptionsRequest,
  string
>;

export type CreateRepeatInscriptionsResponseMessage = Message<
  SatsConnectMethods.createRepeatInscriptionsResponse,
  {
    createRepeatInscriptionsRequest: string;
    createRepeatInscriptionsResponse: CreateRepeatInscriptionsResponse | string;
  }
>;

type BaseWebBtcMessage = {
  id: RpcId;
  method: string;
};
export type WebBtcMessage<Method extends keyof Requests> = BaseWebBtcMessage & {
  params: Params<Method>;
};

export type SatsConnectMessageFromContentScript =
  | GetAddressRequestMessage
  | SignPsbtRequestMessage
  | SignBatchPsbtRequestMessage
  | SignMessageRequestMessage
  | SendBtcRequestMessage
  | CreateInscriptionRequestMessage
  | CreateRepeatInscriptionsRequestMessage;

export type SatsConnectMessageToContentScript =
  | GetAddressResponseMessage
  | SignPsbtResponseMessage
  | SignBatchPsbtResponseMessage
  | SignMessageResponseMessage
  | SendBtcResponseMessage
  | CreateInscriptionResponseMessage
  | CreateRepeatInscriptionsResponseMessage;

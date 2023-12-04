import { FinishedTxPayload, SignatureData, SponsoredFinishedTxPayload } from '@stacks/connect';
import {
  CreateInscriptionResponse,
  CreateRepeatInscriptionsResponse,
  GetAddressResponse,
  SignMultipleTransactionsResponse,
  SignTransactionResponse,
} from 'sats-connect';

export const MESSAGE_SOURCE = 'xverse-wallet' as const;

export const CONTENT_SCRIPT_PORT = 'xverse-content-script' as const;

/**
 * Stacks External Callable Methods
 * @enum {string}
 */
export enum ExternalMethods {
  transactionRequest = 'transactionRequest',
  transactionResponse = 'transactionResponse',
  authenticationRequest = 'authenticationRequest',
  authenticationResponse = 'authenticationResponse',
  signatureRequest = 'signatureRequest',
  signatureResponse = 'signatureResponse',
  structuredDataSignatureRequest = 'structuredDataSignatureRequest',
  structuredDataSignatureResponse = 'structuredDataSignatureResponse',
}

export enum InternalMethods {
  RequestDerivedStxAccounts = 'RequestDerivedStxAccounts',
  ShareInMemoryKeyToBackground = 'ShareInMemoryKeyToBackground',
  RequestInMemoryKeys = 'RequestInMemoryKeys',
  RemoveInMemoryKeys = 'RemoveInMemoryKeys',
  OriginatingTabClosed = 'OriginatingTabClosed',
}

export type ExtensionMethods = ExternalMethods | ExternalSatsMethods | InternalMethods;

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

type AuthenticationRequestMessage = Message<ExternalMethods.authenticationRequest, string>;

export type AuthenticationResponseMessage = Message<
  ExternalMethods.authenticationResponse,
  {
    authenticationRequest: string;
    authenticationResponse: string;
  }
>;

type SignatureRequestMessage = Message<ExternalMethods.signatureRequest, string>;

export type SignatureResponseMessage = Message<
  ExternalMethods.signatureResponse,
  {
    signatureRequest: string;
    signatureResponse: SignatureData | string;
  }
>;

type StructuredDataSignatureRequestMessage = Message<
  ExternalMethods.structuredDataSignatureRequest,
  string
>;

type TransactionRequestMessage = Message<ExternalMethods.transactionRequest, string>;

export type TxResult = SponsoredFinishedTxPayload | FinishedTxPayload;

export type TransactionResponseMessage = Message<
  ExternalMethods.transactionResponse,
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
export enum ExternalSatsMethods {
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
}

type GetAddressRequestMessage = Message<ExternalSatsMethods.getAddressRequest, string>;

export type GetAddressResponseMessage = Message<
  ExternalSatsMethods.getAddressResponse,
  {
    addressRequest: string;
    addressResponse: GetAddressResponse | string;
  }
>;

type SignPsbtRequestMessage = Message<ExternalSatsMethods.signPsbtRequest, string>;

type SignBatchPsbtRequestMessage = Message<ExternalSatsMethods.signBatchPsbtRequest, string>;

export type SignPsbtResponseMessage = Message<
  ExternalSatsMethods.signPsbtResponse,
  {
    signPsbtRequest: string;
    signPsbtResponse: SignTransactionResponse | string;
  }
>;

export type SignBatchPsbtResponseMessage = Message<
  ExternalSatsMethods.signBatchPsbtResponse,
  {
    signBatchPsbtRequest: string;
    signBatchPsbtResponse: SignMultipleTransactionsResponse | string;
  }
>;

type SignMessageRequestMessage = Message<ExternalSatsMethods.signMessageRequest, string>;

export type SignMessageResponseMessage = Message<
  ExternalSatsMethods.signMessageResponse,
  {
    signMessageRequest: string;
    signMessageResponse: string;
  }
>;

type SendBtcRequestMessage = Message<ExternalSatsMethods.sendBtcRequest, string>;

export type SendBtcResponseMessage = Message<
  ExternalSatsMethods.sendBtcResponse,
  {
    sendBtcRequest: string;
    sendBtcResponse: string;
  }
>;

type CreateInscriptionRequestMessage = Message<
  ExternalSatsMethods.createInscriptionRequest,
  string
>;

export type CreateInscriptionResponseMessage = Message<
  ExternalSatsMethods.createInscriptionResponse,
  {
    createInscriptionRequest: string;
    createInscriptionResponse: CreateInscriptionResponse | string;
  }
>;

type CreateRepeatInscriptionsRequestMessage = Message<
  ExternalSatsMethods.createRepeatInscriptionsRequest,
  string
>;

export type CreateRepeatInscriptionsResponseMessage = Message<
  ExternalSatsMethods.createRepeatInscriptionsResponse,
  {
    createRepeatInscriptionsRequest: string;
    createRepeatInscriptionsResponse: CreateRepeatInscriptionsResponse | string;
  }
>;

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

import { FinishedTxPayload, SignatureData, SponsoredFinishedTxPayload } from '@stacks/connect';
import { CreateInscriptionResponse, GetAddressResponse, SignPsbtResponse } from 'sats-connect';

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
  signPsbtResponse = 'signPsbtResponse',
  signMessageRequest = 'signMessageRequest',
  signMessageResponse = 'signMessageResponse',
  sendBtcRequest = 'sendBtcRequest',
  sendBtcResponse = 'sendBtcResponse',
  createInscriptionRequest = 'createInscriptionRequest',
  createInscriptionResponse = 'createInscriptionResponse',
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

export type SignPsbtResponseMessage = Message<
  ExternalSatsMethods.signPsbtResponse,
  {
    signPsbtRequest: string;
    signPsbtResponse: SignPsbtResponse | string;
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

export type SatsConnectMessageFromContentScript =
  | GetAddressRequestMessage
  | SignPsbtRequestMessage
  | SignMessageRequestMessage
  | SendBtcRequestMessage
  | CreateInscriptionRequestMessage;

export type SatsConnectMessageToContentScript =
  | GetAddressResponseMessage
  | SignPsbtResponseMessage
  | SignMessageResponseMessage
  | SendBtcResponseMessage
  | CreateInscriptionResponseMessage;

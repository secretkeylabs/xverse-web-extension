import { FinishedTxPayload, SignatureData, SponsoredFinishedTxPayload } from '@stacks/connect';
import { BitcoinNetwork, Purpose, GetAddressResponse } from 'sats-connect';

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

type AuthenticationRequestMessage = Message<ExternalMethods.authenticationRequest | ExternalSatsMethods.authenticationRequest, string>;

export type AuthenticationResponseMessage = Message<
ExternalMethods.authenticationResponse | ExternalSatsMethods.authenticationResponse,
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
  authenticationRequest = 'satsAuthenticationRequest',
  authenticationResponse = 'satsAuthenticationResponse',
}

type GetAddressRequestMessage = Message<ExternalSatsMethods.getAddressRequest, string>;

export type GetAddressResponseMessage = Message<
ExternalSatsMethods.getAddressResponse,
{
  addressRequest: {
    purpose: Purpose;
    message: string;
    network: BitcoinNetwork;
  };
  addressResponse: GetAddressResponse;
}
>;

export type SatsConnectMessageFromContentScript = GetAddressRequestMessage | AuthenticationRequestMessage;

export type SatsConnectMessageToContentScript = GetAddressResponseMessage | AuthenticationResponseMessage;

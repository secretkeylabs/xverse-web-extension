/**
 * Allowlist for extension → content-script → page forwards (M-01).
 *
 * Kept free of `@sats-connect/core` so unit tests can import this module from
 * the discovery harness without installing the extension package tree.
 */

/** Must match `MESSAGE_SOURCE` in message-types.ts */
export const PAGE_MESSAGE_SOURCE = 'xverse-wallet';

// Keep in sync with extensionToContentScript/schemas.ts
const WALLET_EVENT_TYPE = 'wallet-event';
const RPC_RESPONSE_TYPE = 'rpc-response';

/**
 * Response methods that the page/inpage legitimately listens for via
 * `window.postMessage` (legacy sats-connect + Stacks connect flows).
 *
 * Request methods are never forwarded to the page from the extension.
 * Keep in sync with SatsConnectMethods / StacksLegacyMethods *Response values
 * plus legacy stx_* method-name responses.
 */
const LEGACY_PAGE_RESPONSE_METHODS = new Set<string>([
  'getAddressResponse',
  'signPsbtResponse',
  'signBatchPsbtResponse',
  'signMessageResponse',
  'sendBtcResponse',
  'createInscriptionResponse',
  'createRepeatInscriptionsResponse',
  'transactionResponse',
  'authenticationResponse',
  'signatureResponse',
  // Legacy Stacks address/account responses use RPC method names as `method`.
  'stx_getAddresses',
  'stx_getAccounts',
]);

export type PageMessageDecision =
  | { action: 'wallet-event'; data: unknown }
  | { action: 'postMessage'; message: unknown }
  | { action: 'drop'; reason: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isWalletEventMessage(
  message: unknown,
): message is { type: typeof WALLET_EVENT_TYPE; data: unknown } {
  return (
    isRecord(message) &&
    message.type === WALLET_EVENT_TYPE &&
    isRecord(message.data) &&
    typeof message.data.type === 'string'
  );
}

function isTypedRpcResponseMessage(
  message: unknown,
): message is { type: typeof RPC_RESPONSE_TYPE; data: unknown } {
  return isRecord(message) && message.type === RPC_RESPONSE_TYPE && isRecord(message.data);
}

/** Matches sendRpcResponse / inpage `rpcResponseMessageSchema` shape (+ optional source). */
function isRpcResponseMessage(message: unknown): boolean {
  if (!isRecord(message)) return false;
  if (message.jsonrpc !== '2.0') return false;
  if (!('id' in message)) return false;
  const hasResult = 'result' in message;
  const hasError = 'error' in message;
  if (hasResult === hasError) return false;
  if ('source' in message && message.source !== PAGE_MESSAGE_SOURCE) return false;
  return true;
}

function isLegacyPageMessage(
  message: unknown,
): message is { source: typeof PAGE_MESSAGE_SOURCE; method: string; payload: unknown } {
  return (
    isRecord(message) &&
    message.source === PAGE_MESSAGE_SOURCE &&
    typeof message.method === 'string' &&
    'payload' in message
  );
}

/**
 * Classify a message received by the content script from the extension.
 *
 * Fail-closed: unrecognized shapes are dropped (M-01). Previously the CS
 * `postMessage`'d arbitrary objects to the page.
 */
export function classifyExtensionToPageMessage(message: unknown): PageMessageDecision {
  if (isWalletEventMessage(message)) {
    return { action: 'wallet-event', data: message.data };
  }

  // Typed RPC wrapper used by sendMessageContentScriptTab — forward the RPC
  // body the inpage listener already understands.
  if (isTypedRpcResponseMessage(message)) {
    return { action: 'postMessage', message: message.data };
  }

  // Modern RPC responses from sendRpcResponse (jsonrpc + optional source).
  if (isRpcResponseMessage(message)) {
    return { action: 'postMessage', message };
  }

  // Legacy sats-connect / Stacks response envelopes.
  if (isLegacyPageMessage(message)) {
    if (!LEGACY_PAGE_RESPONSE_METHODS.has(message.method)) {
      return {
        action: 'drop',
        reason: `Legacy method not allowlisted for page forward: ${message.method}`,
      };
    }
    if (message.payload === undefined || message.payload === null) {
      return { action: 'drop', reason: 'Legacy page message missing payload' };
    }
    return { action: 'postMessage', message };
  }

  return { action: 'drop', reason: 'Unrecognized extension→page message shape' };
}

/** Test helper — expose allowlisted method names. */
export const __legacyPageResponseMethodsForTests = () => new Set(LEGACY_PAGE_RESPONSE_METHODS);

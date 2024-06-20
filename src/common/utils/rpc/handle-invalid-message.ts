import { RpcRequestMessage } from '@sats-connect/core';
import { sendInvalidParametersResponseMessage } from './rpcResponseMessages';

// eslint-disable-next-line import/prefer-default-export
export function handleInvalidMessage(
  message: RpcRequestMessage,
  tabId: chrome.tabs.Tab['id'],
  error: unknown,
) {
  if (!tabId) {
    // eslint-disable-next-line no-console
    console.warn('No tab ID provided, unable to send RPC response.');
    return;
  }

  const messageId = message.id;
  if (!messageId) {
    // eslint-disable-next-line no-console
    console.warn('No RPC message ID provided, unable to send RPC response.');
    return;
  }

  if (typeof messageId !== 'string') {
    // eslint-disable-next-line no-console
    console.error('RPC message requests expect string message IDs, received:', typeof messageId);
    return;
  }

  // TODO: is this the best response available for invalid messages?
  sendInvalidParametersResponseMessage({
    tabId,
    messageId,
    error,
  });
}

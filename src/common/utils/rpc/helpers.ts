import { MESSAGE_SOURCE } from '@common/types/message-types';
import {
  Requests,
  Return,
  RpcError,
  RpcErrorCode,
  RpcErrorResponse,
  RpcId,
  RpcSuccessResponse,
} from '@sats-connect/core';

export const makeRPCError = (id: RpcId, error: RpcError): RpcErrorResponse => ({
  jsonrpc: '2.0',
  id,
  error,
});

export const makeRpcSuccessResponse = <Method extends keyof Requests>(
  id: RpcId,
  result: Return<Method>,
): RpcSuccessResponse<Method> => ({
  id,
  result,
  jsonrpc: '2.0',
});

export function sendRpcResponse<Method extends keyof Requests>(
  tabId: number,
  response: RpcSuccessResponse<Method> | RpcErrorResponse,
) {
  chrome.tabs.sendMessage(+tabId, {
    ...response,
    source: MESSAGE_SOURCE,
  });
}

// TODO: this would probably be better off in another file
export function makeSendPopupClosedUserRejectionMessage({
  tabId,
  messageId,
}: {
  tabId: number;
  messageId: RpcId;
}) {
  const message = makeRPCError(messageId, {
    code: RpcErrorCode.USER_REJECTION,
    message: 'User closed the wallet popup.',
  });
  return () => {
    chrome.tabs.sendMessage(tabId, message);
  };
}

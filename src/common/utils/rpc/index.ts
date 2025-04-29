import { RpcErrorCode, type RpcRequestMessage } from '@sats-connect/core';
import { safePromise } from '@secretkeylabs/xverse-core';
import { getTabIdFromPort } from '..';
import { router } from './handlerRouter';
import { makeRPCError, sendRpcResponse, updateClientLastUsedTime } from './helpers';

async function handleRPCRequest(message: RpcRequestMessage, port: chrome.runtime.Port) {
  const handler = router[message.method];
  if (!handler)
    return sendRpcResponse(
      getTabIdFromPort(port),
      makeRPCError(message.id as string, {
        code: RpcErrorCode.METHOD_NOT_FOUND,
        message: `"${message.method}" is not supported.`,
      }),
    );

  const [updateLastUsedTimeError] = await updateClientLastUsedTime(port);
  if (updateLastUsedTimeError) {
    sendRpcResponse(
      getTabIdFromPort(port),
      makeRPCError(message.id as string, {
        code: RpcErrorCode.INTERNAL_ERROR,
        message: 'Error updating client last used time.',
      }),
    );
    return;
  }

  const [handlerError] = await safePromise(handler(message, port));
  if (handlerError) {
    console.error(handlerError);
    return sendRpcResponse(
      getTabIdFromPort(port),
      makeRPCError(message.id as string, {
        code: RpcErrorCode.INTERNAL_ERROR,
        message: 'RPC handler error',
        data: handlerError.data,
      }),
    );
  }
}

export default handleRPCRequest;

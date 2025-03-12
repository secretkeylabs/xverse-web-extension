import { MESSAGE_SOURCE } from '@common/types/message-types';
import {
  BitcoinNetworkType,
  RpcErrorCode,
  type Requests,
  type Return,
  type RpcError,
  type RpcErrorResponse,
  type RpcId,
  type RpcSuccessResponse,
} from '@sats-connect/core';
import {
  error,
  permissions,
  success,
  type NetworkType,
  type Result,
} from '@secretkeylabs/xverse-core';
import { getOriginFromPort } from '..';
import { initPermissionsStore, saveStore } from '../permissionsStore';

export const makeRPCError = (id: RpcId, e: RpcError): RpcErrorResponse => ({
  jsonrpc: '2.0',
  id,
  error: e,
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

/**
 * Update the last used time for the client. Must be run within the permissions store mutex.
 */
export async function updateClientLastUsedTime(port: chrome.runtime.Port): Promise<Result<void>> {
  const [storeError, store] = await initPermissionsStore();
  if (storeError)
    return error({
      name: 'LoadStoreError',
      message: 'Error loading permissions store.',
    });

  const origin = getOriginFromPort(port);
  const [clientIdError, clientId] = permissions.utils.store.makeClientId({ origin });
  if (clientIdError)
    return error({
      name: 'ClientIdError',
      message: 'Failed to create client ID during permissions check.',
    });

  const nextStore = permissions.utils.store.setClientMetadata(store, {
    clientId,
    lastUsed: new Date().getTime(),
  });
  saveStore(nextStore);

  return success(undefined);
}

export const getBitcoinNetworkType = (networkType: NetworkType): BitcoinNetworkType => {
  const networkTypeMap: Record<NetworkType, BitcoinNetworkType> = {
    Mainnet: BitcoinNetworkType.Mainnet,
    Testnet: BitcoinNetworkType.Testnet,
    Testnet4: BitcoinNetworkType.Testnet4,
    Regtest: BitcoinNetworkType.Regtest,
    Signet: BitcoinNetworkType.Signet,
  };

  return networkTypeMap[networkType] ?? BitcoinNetworkType.Mainnet;
};

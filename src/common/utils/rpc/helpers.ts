import { MESSAGE_SOURCE } from '@common/types/message-types';
import { makeAccountResourceId } from '@components/permissionsManager/resources';
import * as utils from '@components/permissionsManager/utils';
import {
  Requests,
  Return,
  RpcError,
  RpcErrorCode,
  RpcErrorResponse,
  RpcId,
  RpcSuccessResponse,
} from '@sats-connect/core';
import rootStore from '@stores/index';
import getSelectedAccount from '../getSelectedAccount';

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

export async function hasPermissions(origin: string): Promise<boolean> {
  const [error, store] = await utils.loadPermissionsStore();
  if (error) {
    return false;
  }

  if (!store) {
    return false;
  }

  const {
    selectedAccountIndex,
    selectedAccountType,
    accountsList: softwareAccountsList,
    ledgerAccountsList,
    network,
  } = rootStore.store.getState().walletState;

  const existingAccount = getSelectedAccount({
    selectedAccountIndex,
    selectedAccountType,
    softwareAccountsList,
    ledgerAccountsList,
  });

  if (!existingAccount) {
    return false;
  }

  const permission = utils.getClientPermission(
    store.permissions,
    origin,
    makeAccountResourceId({
      accountId: selectedAccountIndex,
      networkType: network.type,
      masterPubKey: existingAccount.masterPubKey,
    }),
  );
  if (!permission) {
    return false;
  }

  if (!permission.actions.has('read')) {
    return false;
  }

  return true;
}

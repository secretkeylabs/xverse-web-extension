/* eslint-disable import/prefer-default-export */
import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount from '@common/utils/getSelectedAccount';
import { makeContext } from '@common/utils/popup';
import { makeAccountResourceId } from '@components/permissionsManager/resources';
import * as utils from '@components/permissionsManager/utils';
import { getWalletTypeRequestMessageSchema, type RpcRequestMessage } from '@sats-connect/core';
import rootStore from '@stores/index';
import * as v from 'valibot';
import { handleInvalidMessage } from '../handle-invalid-message';
import {
  sendAccessDeniedResponseMessage,
  sendInternalErrorMessage,
} from '../responseMessages/errors';
import { sendGetWalletTypeSuccessResponseMessage } from '../responseMessages/wallet';

export const handleGetWalletType = async (
  message: RpcRequestMessage,
  port: chrome.runtime.Port,
) => {
  const parseResult = v.safeParse(getWalletTypeRequestMessageSchema, message);

  if (!parseResult.success) {
    handleInvalidMessage(message, getTabIdFromPort(port), parseResult.issues);
    return;
  }

  const { origin, tabId } = makeContext(port);
  const [error, store] = await utils.loadPermissionsStore();

  if (error) {
    sendInternalErrorMessage({ tabId, messageId: parseResult.output.id });
    return;
  }

  if (!store) {
    sendAccessDeniedResponseMessage({ tabId, messageId: parseResult.output.id });
    return;
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
    sendInternalErrorMessage({ tabId, messageId: parseResult.output.id });
    return;
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
    sendAccessDeniedResponseMessage({ tabId, messageId: parseResult.output.id });
    return;
  }

  if (!permission.actions.has('read')) {
    sendAccessDeniedResponseMessage({ tabId, messageId: parseResult.output.id });
  }

  sendGetWalletTypeSuccessResponseMessage({
    tabId,
    messageId: parseResult.output.id,
    result: existingAccount.accountType ?? 'software',
  });
};

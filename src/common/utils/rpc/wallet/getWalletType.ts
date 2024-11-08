/* eslint-disable import/prefer-default-export */
import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount from '@common/utils/getSelectedAccount';
import { makeContext } from '@common/utils/popup';
import * as utils from '@components/permissionsManager/utils';
import { getWalletTypeRequestMessageSchema, type RpcRequestMessage } from '@sats-connect/core';
import rootStore from '@stores/index';
import * as v from 'valibot';
import { handleInvalidMessage } from '../handle-invalid-message';
import { hasAccountReadPermissions } from '../helpers';
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

  const [error, store] = await utils.getPermissionsStore();
  if (error) {
    sendInternalErrorMessage({
      tabId,
      messageId: parseResult.output.id,
      message: 'Error loading permissions store.',
    });
    return;
  }

  if (!hasAccountReadPermissions(origin, store)) {
    sendAccessDeniedResponseMessage({ tabId, messageId: parseResult.output.id });
    return;
  }

  await utils.permissionsStoreMutex.runExclusive(async () => {
    // Update the last used time for the client
    utils.updateClientMetadata(store, origin, { lastUsed: new Date().getTime() });
    await utils.savePermissionsStore(store);
  });

  const {
    selectedAccountIndex,
    selectedAccountType,
    accountsList: softwareAccountsList,
    ledgerAccountsList,
    keystoneAccountsList,
  } = rootStore.store.getState().walletState;

  const account = getSelectedAccount({
    selectedAccountIndex,
    selectedAccountType,
    softwareAccountsList,
    ledgerAccountsList,
    keystoneAccountsList,
  });

  if (!account) {
    sendInternalErrorMessage({ tabId, messageId: parseResult.output.id });
    return;
  }

  sendGetWalletTypeSuccessResponseMessage({
    tabId,
    messageId: parseResult.output.id,
    result: account.accountType ?? 'software',
  });
};

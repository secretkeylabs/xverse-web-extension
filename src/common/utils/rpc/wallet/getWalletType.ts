/* eslint-disable import/prefer-default-export */
import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount from '@common/utils/getSelectedAccount';
import { type GetWalletTypeRequestMessage } from '@sats-connect/core';
import rootStore from '@stores/index';
import { sendInternalErrorMessage } from '../responseMessages/errors';
import { sendGetWalletTypeSuccessResponseMessage } from '../responseMessages/wallet';

export async function handleGetWalletType(
  message: GetWalletTypeRequestMessage,
  port: chrome.runtime.Port,
) {
  const tabId = getTabIdFromPort(port);

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
    sendInternalErrorMessage({ tabId, messageId: message.id });
    return;
  }

  sendGetWalletTypeSuccessResponseMessage({
    tabId,
    messageId: message.id,
    result: account.accountType ?? 'software',
  });
}

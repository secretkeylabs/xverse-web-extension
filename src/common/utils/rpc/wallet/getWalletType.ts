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
    selectedWalletId,
    softwareWallets,
    ledgerAccountsList,
    keystoneAccountsList,
    network,
  } = rootStore.store.getState().walletState;

  const account = getSelectedAccount({
    selectedAccountIndex,
    selectedAccountType,
    selectedWalletId,
    softwareWallets,
    ledgerAccountsList,
    keystoneAccountsList,
    network: network.type,
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

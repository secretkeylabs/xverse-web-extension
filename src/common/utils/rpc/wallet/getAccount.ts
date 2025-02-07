/* eslint-disable import/prefer-default-export */
import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount, { embellishAccountWithDetails } from '@common/utils/getSelectedAccount';
import { type GetAccountRequestMessage, type GetAccountResult } from '@sats-connect/core';
import { permissions } from '@secretkeylabs/xverse-core';
import rootStore from '@stores/index';
import { accountPurposeAddresses } from '../btc/getAddresses/utils';
import { sendInternalErrorMessage } from '../responseMessages/errors';
import { sendGetAccountSuccessResponseMessage } from '../responseMessages/wallet';

export async function handleGetAccount(
  message: GetAccountRequestMessage,
  port: chrome.runtime.Port,
) {
  const {
    selectedAccountIndex,
    selectedAccountType,
    accountsList: softwareAccountsList,
    ledgerAccountsList,
    keystoneAccountsList,
    network,
    btcPaymentAddressType,
  } = rootStore.store.getState().walletState;

  const account = getSelectedAccount({
    selectedAccountIndex,
    selectedAccountType,
    softwareAccountsList,
    ledgerAccountsList,
    keystoneAccountsList,
  });

  if (!account) {
    sendInternalErrorMessage({
      tabId: getTabIdFromPort(port),
      messageId: message.id,
      message: 'Failed to get selected account.',
    });
    return;
  }

  const accountId = permissions.utils.account.makeAccountId({
    accountId: account.id,
    masterPubKey: account.masterPubKey,
    networkType: network.type,
  });

  const embellishedAccount = embellishAccountWithDetails(account, btcPaymentAddressType);
  const addresses = accountPurposeAddresses(embellishedAccount, { type: 'all' });
  const result: GetAccountResult = {
    id: accountId,
    walletType: account.accountType ?? 'software',
    addresses,
  };
  sendGetAccountSuccessResponseMessage({
    tabId: getTabIdFromPort(port),
    messageId: message.id,
    result,
  });
}

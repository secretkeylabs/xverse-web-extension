/* eslint-disable import/prefer-default-export */
import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount, { embellishAccountWithDetails } from '@common/utils/getSelectedAccount';
import { safePromise, type Result } from '@common/utils/safe';
import type { GetBalanceRequestMessage } from '@sats-connect/core';
import { BitcoinEsploraApiProvider, type SettingsNetwork } from '@secretkeylabs/xverse-core';
import rootStore from '@stores/index';
import { sendGetBalanceSuccessResponseMessage } from '../responseMessages/bitcoin';
import { sendInternalErrorMessage } from '../responseMessages/errors';

async function getBalance(
  address: string,
  network: SettingsNetwork,
): Promise<
  Result<{
    confirmed: number;
    unconfirmed: number;
    total: number;
  }>
> {
  const api = new BitcoinEsploraApiProvider({
    network: network.type,
    url: network.btcApiUrl,
    fallbackUrl: network.fallbackBtcApiUrl,
  });

  const [error, data] = await safePromise(api.getBalance(address));
  if (error) {
    return [error, null];
  }

  const confirmedBalance = data.finalBalance;
  const { unconfirmedBalance } = data;

  return [
    null,
    {
      confirmed: confirmedBalance,
      unconfirmed: unconfirmedBalance,
      total: confirmedBalance + unconfirmedBalance,
    },
  ];
}

export async function handleGetBalance(
  message: GetBalanceRequestMessage,
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
    btcPaymentAddressType,
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

  const detailedAccount = embellishAccountWithDetails(account, btcPaymentAddressType);

  const address = detailedAccount.btcAddress;
  const [getBalanceError, balances] = await getBalance(address, network);
  if (getBalanceError) {
    sendInternalErrorMessage({
      tabId,
      messageId: message.id,
      message: 'Error retrieving balance.',
    });
    return;
  }

  sendGetBalanceSuccessResponseMessage({
    tabId,
    messageId: message.id,
    result: {
      confirmed: balances.confirmed.toString(),
      unconfirmed: balances.unconfirmed.toString(),
      total: balances.total.toString(),
    },
  });
}

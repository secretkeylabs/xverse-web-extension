import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount from '@common/utils/getSelectedAccount';
import { makeContext } from '@common/utils/popup';
import { makeAccountResourceId } from '@components/permissionsManager/resources';
import * as utils from '@components/permissionsManager/utils';
import { RpcRequestMessage, getBalanceRequestMessageSchema } from '@sats-connect/core';
import { BtcAddressBalanceResponse } from '@secretkeylabs/xverse-core';
import rootStore from '@stores/index';
import * as v from 'valibot';
import { handleInvalidMessage } from '../handle-invalid-message';
import { sendGetBalanceSuccessResponseMessage } from '../responseMessages/bitcoin';
import {
  sendAccessDeniedResponseMessage,
  sendInternalErrorMessage,
} from '../responseMessages/errors';

async function getBalance(address: string): Promise<{
  confirmed: number;
  unconfirmed: number;
  total: number;
}> {
  const url = `https://btc-1.xverse.app/address/${address}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch address data for ${address}`);
  }

  const data = (await res.json()) as BtcAddressBalanceResponse;

  const confirmedBalance = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
  const unconfirmedBalance = data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum;

  return {
    confirmed: confirmedBalance,
    unconfirmed: unconfirmedBalance,
    total: confirmedBalance + unconfirmedBalance,
  };
}

const handleGetBalance = async (message: RpcRequestMessage, port: chrome.runtime.Port) => {
  const parseResult = v.safeParse(getBalanceRequestMessageSchema, message);

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

  const permission = utils.getClientPermission(
    store.permissions,
    origin,
    makeAccountResourceId({ accountId: selectedAccountIndex, networkType: network.type }),
  );
  if (!permission) {
    sendAccessDeniedResponseMessage({ tabId, messageId: parseResult.output.id });
    return;
  }

  if (!permission.actions.has('read')) {
    sendAccessDeniedResponseMessage({ tabId, messageId: parseResult.output.id });
    return;
  }

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

  const address = existingAccount.btcAddress;
  const balances = await getBalance(address);

  sendGetBalanceSuccessResponseMessage({
    tabId,
    messageId: parseResult.output.id,
    result: {
      confirmed: balances.confirmed.toString(),
      unconfirmed: balances.unconfirmed.toString(),
      total: balances.total.toString(),
    },
  });
};

export default handleGetBalance;

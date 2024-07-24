import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount from '@common/utils/getSelectedAccount';
import { makeContext } from '@common/utils/popup';
import { safePromise, type Result } from '@common/utils/safe';
import { makeAccountResourceId } from '@components/permissionsManager/resources';
import * as utils from '@components/permissionsManager/utils';
import { getBalanceRequestMessageSchema, type RpcRequestMessage } from '@sats-connect/core';
import { BitcoinEsploraApiProvider, type NetworkType } from '@secretkeylabs/xverse-core';
import rootStore from '@stores/index';
import * as v from 'valibot';
import { handleInvalidMessage } from '../handle-invalid-message';
import { sendGetBalanceSuccessResponseMessage } from '../responseMessages/bitcoin';
import {
  sendAccessDeniedResponseMessage,
  sendInternalErrorMessage,
} from '../responseMessages/errors';

async function getBalance(
  address: string,
  networkType: NetworkType,
): Promise<
  Result<{
    confirmed: number;
    unconfirmed: number;
    total: number;
  }>
> {
  const api = new BitcoinEsploraApiProvider({ network: networkType });

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
    return;
  }

  const address = existingAccount.btcAddress;
  const [getBalanceError, balances] = await getBalance(address, network.type);
  if (getBalanceError) {
    sendInternalErrorMessage({ tabId, messageId: parseResult.output.id });
    return;
  }

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

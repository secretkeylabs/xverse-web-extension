import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount from '@common/utils/getSelectedAccount';
import { makeContext } from '@common/utils/popup';
import { safePromise, type Result } from '@common/utils/safe';
import * as utils from '@components/permissionsManager/utils';
import { getBalanceRequestMessageSchema, type RpcRequestMessage } from '@sats-connect/core';
import { BitcoinEsploraApiProvider, type NetworkType } from '@secretkeylabs/xverse-core';
import rootStore from '@stores/index';
import * as v from 'valibot';
import { handleInvalidMessage } from '../handle-invalid-message';
import { hasAccountReadPermissions } from '../helpers';
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
    network,
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

  const address = account.btcAddress;
  const [getBalanceError, balances] = await getBalance(address, network.type);
  if (getBalanceError) {
    sendInternalErrorMessage({
      tabId,
      messageId: parseResult.output.id,
      message: 'Error retrieving balance.',
    });
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

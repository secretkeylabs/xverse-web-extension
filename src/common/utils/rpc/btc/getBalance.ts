import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount from '@common/utils/getSelectedAccount';
import { makeContext } from '@common/utils/popup';
import * as utils from '@components/permissionsManager/utils';
import { RpcRequestMessage, getBalanceSchema } from '@sats-connect/core';
import { UTXO } from '@secretkeylabs/xverse-core';
import rootStore from '@stores/index';
import * as v from 'valibot';
import { handleInvalidMessage } from '../handle-invalid-message';
import { sendGetBalanceSuccessResponseMessage } from '../responseMessages/bitcoin';
import {
  sendAccessDeniedResponseMessage,
  sendInternalErrorMessage,
  sendUnsupportedNetworkResponseMessage,
} from '../responseMessages/errors';

async function getBtcAddressUtxos(address: string): Promise<Array<UTXO>> {
  const url = `https://btc-1.xverse.app/address/${address}/utxo`;
  const res = await fetch(url);
  const data = (await res.json()) as Array<UTXO>;

  if (data.length === 0) {
    // eslint-disable-next-line no-console
    console.warn(
      'The API returned no UTXOs. The address may have more UTXOs than the API can handle.',
    );
  }
  return data;
}

async function getBalance(address: string): Promise<{
  confirmedBalance: bigint;
  unconfirmedUtxosBalance: bigint;
}> {
  const utxos = await getBtcAddressUtxos(address);
  const confirmedBalance = utxos
    .filter((utxo) => utxo.status.confirmed)
    .reduce((acc, utxo) => acc + BigInt(utxo.value), 0n);
  const unconfirmedUtxosBalance = utxos
    .filter((utxo) => !utxo.status.confirmed)
    .reduce((acc, utxo) => acc + BigInt(utxo.value), 0n);

  return {
    confirmedBalance,
    unconfirmedUtxosBalance,
  };
}

const handleGetBalance = async (message: RpcRequestMessage, port: chrome.runtime.Port) => {
  const parseResult = v.safeParse(getBalanceSchema, message);

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
    // TODO accounts depend on the network, so should perms. For now, only support mainnet.
    network,
  } = rootStore.store.getState().walletState;

  if (network.type !== 'Mainnet') {
    sendUnsupportedNetworkResponseMessage({ tabId, messageId: parseResult.output.id });
    return;
  }

  const permission = utils.getClientPermission(
    store.permissions,
    origin,
    `account-${selectedAccountIndex}`,
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
    result: balances,
  });
};

export default handleGetBalance;

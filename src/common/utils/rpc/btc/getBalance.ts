import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount from '@common/utils/getSelectedAccount';
import { makeContext } from '@common/utils/popup';
import { makeAccountResourceId } from '@components/permissionsManager/resources';
import * as utils from '@components/permissionsManager/utils';
import { RpcRequestMessage, getBalanceRequestMessageSchema } from '@sats-connect/core';
import { UTXO } from '@secretkeylabs/xverse-core';
import rootStore from '@stores/index';
import * as v from 'valibot';
import { handleInvalidMessage } from '../handle-invalid-message';
import { sendGetBalanceSuccessResponseMessage } from '../responseMessages/bitcoin';
import {
  sendAccessDeniedResponseMessage,
  sendInternalErrorMessage,
} from '../responseMessages/errors';

async function getBtcAddressUtxos(address: string): Promise<Array<UTXO>> {
  const url = `https://btc-1.xverse.app/address/${address}/utxo`;
  const res = await fetch(url);
  const data = (await res.json()) as Array<UTXO>;

  // Need to check for having no UTXOs due to
  // https://linear.app/xverseapp/issue/ENG-4372
  if (data.length === 0) {
    // eslint-disable-next-line no-console
    console.warn(
      'The API returned no UTXOs. The address may have more UTXOs than the API can handle.',
    );
  }
  return data;
}

async function getBalance(address: string): Promise<{
  confirmed: bigint;
  unconfirmed: bigint;
  total: bigint;
}> {
  const utxos = await getBtcAddressUtxos(address);
  const confirmedBalance = utxos
    .filter((utxo) => utxo.status.confirmed)
    .reduce((acc, utxo) => acc + BigInt(utxo.value), 0n);
  const unconfirmedBalance = utxos
    .filter((utxo) => !utxo.status.confirmed)
    .reduce((acc, utxo) => acc + BigInt(utxo.value), 0n);

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

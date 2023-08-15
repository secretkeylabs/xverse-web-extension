import {
  Account,
  NetworkType,
  getMasterFingerPrint,
  signSimpleBip322Message,
} from '@secretkeylabs/xverse-core';
import { Transport } from '@secretkeylabs/xverse-core/ledger/types';

export const findLedgerAccountId = async ({
  transport,
  id,
  ledgerAccountsList,
}: {
  transport: Transport;
  id?: number;
  ledgerAccountsList: Account[];
}): Promise<number> => {
  if (id === undefined) {
    return -1;
  }

  const masterFingerPrint = await getMasterFingerPrint(transport);

  const deviceAccounts = ledgerAccountsList.filter(
    (account) => account.masterPubKey === masterFingerPrint,
  );
  const accountId = deviceAccounts.findIndex((account) => account.id === id);

  return accountId;
};

export const handleBip322LedgerMessageSigning = async ({
  transport,
  id,
  networkType,
  ledgerAccountsList,
  message,
}: {
  transport: Transport;
  id: number;
  networkType: NetworkType;
  message: string;
  ledgerAccountsList: Account[];
}) => {
  const accountId = await findLedgerAccountId({
    transport,
    id,
    ledgerAccountsList,
  });

  if (accountId === -1) {
    throw new Error('Account not found');
  }

  const signature = await signSimpleBip322Message({
    transport,
    networkType,
    addressIndex: accountId,
    message,
  });

  return signature;
};

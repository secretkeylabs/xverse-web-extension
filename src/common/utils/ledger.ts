import { Account } from '@secretkeylabs/xverse-core';

export const ledgerDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const getDeviceAccountIndex = (
  ledgerAccountsList: Account[],
  id: number,
  masterKey?: string,
) => {
  const ledgerAccountsFilteredList = ledgerAccountsList.filter(
    (account) => masterKey === account.masterPubKey,
  );

  const accountIndex = ledgerAccountsFilteredList.findIndex((account) => account.id === id);

  if (accountIndex === -1) {
    return ledgerAccountsFilteredList.length;
  }

  return accountIndex;
};

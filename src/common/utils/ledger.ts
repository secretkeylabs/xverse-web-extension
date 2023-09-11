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

export const getNewAccountId = (ledgerAccountsList: Account[]) => {
  if (ledgerAccountsList.length === 0) {
    return 0;
  }

  return ledgerAccountsList[ledgerAccountsList.length - 1].id + 1;
};

export const getDeviceNewAccountIndex = (ledgerAccountsList: Account[], masterKey?: string) => {
  const ledgerAccountsIndexList = ledgerAccountsList
    .filter((account) => masterKey === account.masterPubKey)
    .map((account, key) =>
      account.deviceAccountIndex !== undefined ? account.deviceAccountIndex : key,
    )
    .sort((a, b) => a - b);

  for (let i = 0; i < ledgerAccountsIndexList.length; i += 1) {
    if (ledgerAccountsIndexList[i] !== i) {
      return i;
    }
  }

  // If no missing number is found, return the length of the array
  return ledgerAccountsIndexList.length;
};

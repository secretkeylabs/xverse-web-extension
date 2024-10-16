import type { Account, NetworkType } from '@secretkeylabs/xverse-core';

export const delay = (ms: number) =>
  new Promise((res) => {
    setTimeout(res, ms);
  });

export const filterLedgerAccountsByNetwork = (accounts: Account[], network: NetworkType) =>
  accounts.filter((account) =>
    account.btcAddresses.taproot.address.startsWith(network === 'Mainnet' ? 'bc1' : 'tb1'),
  );

// this is used for migrating the old ledger accounts to the new format
// it returns the index of the account in the list, which now maps to the deviceAccountIndex
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

export const getDeviceNewAccountIndex = (
  ledgerAccountsList: Account[],
  network: NetworkType,
  masterKey?: string,
) => {
  const networkLedgerAccounts = filterLedgerAccountsByNetwork(ledgerAccountsList, network);

  const ledgerAccountsIndexList = networkLedgerAccounts
    .filter((account) => masterKey === account.masterPubKey)
    .map((account, key) =>
      // ledger accounts initially didn't have deviceAccountIndex, so we map to their list index as as the initial behaviour
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

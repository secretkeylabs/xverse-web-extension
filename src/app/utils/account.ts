import type { Account, NetworkType } from '@secretkeylabs/xverse-core';

export const getNewAccountId = (ledgerAccountsList: Account[]) => {
  if (ledgerAccountsList.length === 0) {
    return 0;
  }

  return ledgerAccountsList[ledgerAccountsList.length - 1].id + 1;
};

export const filterKeystoneAccounts = (accounts: Account[], network: NetworkType) =>
  accounts.filter((account) =>
    account.ordinalsAddress?.startsWith(network === 'Mainnet' ? 'bc1' : 'tb1'),
  );

export const getDeviceNewAccountIndex = (
  keystoneAccountsList: Account[],
  network: NetworkType,
  masterKey?: string,
) => {
  const networkKeystoneAccounts = filterKeystoneAccounts(keystoneAccountsList, network);

  const keystoneAccountsIndexList = networkKeystoneAccounts
    .filter((account) => masterKey === account.masterPubKey)
    .map((account, key) =>
      // ledger accounts initially didn't have deviceAccountIndex, so we map to their list index as as the initial behaviour
      account.deviceAccountIndex !== undefined ? account.deviceAccountIndex : key,
    )
    .sort((a, b) => a - b);

  for (let i = 0; i < keystoneAccountsIndexList.length; i += 1) {
    if (keystoneAccountsIndexList[i] !== i) {
      return i;
    }
  }

  // If no missing number is found, return the length of the array
  return keystoneAccountsIndexList.length;
};

import type { Account, NetworkType } from '@secretkeylabs/xverse-core';

export const delay = (ms: number) =>
  new Promise((res) => {
    setTimeout(res, ms);
  });

export const getNewAccountId = (keystoneAccountsList: Account[]) => {
  if (keystoneAccountsList.length === 0) {
    return 0;
  }

  return keystoneAccountsList[keystoneAccountsList.length - 1].id + 1;
};

export const filterKeystoneAccounts = (accounts: Account[], network: NetworkType) =>
  accounts.filter((account) =>
    account.ordinalsAddress?.startsWith(network === 'Mainnet' ? 'bc1' : 'tb1'),
  );

export const getKeystoneDeviceNewAccountIndex = (
  keystoneAccountsList: Account[],
  network: NetworkType,
  masterKey?: string,
) => {
  const networkKeystoneAccounts = filterKeystoneAccounts(keystoneAccountsList, network);

  const keystoneAccountsIndexList = networkKeystoneAccounts
    .filter((account) => masterKey === account.masterPubKey)
    .map((account, key) =>
      account.deviceAccountIndex !== undefined ? account.deviceAccountIndex : key,
    )
    .sort((a, b) => a - b);

  for (let i = 0; i < keystoneAccountsIndexList.length; i += 1) {
    if (keystoneAccountsIndexList[i] !== i) {
      return i;
    }
  }

  return keystoneAccountsIndexList.length;
};

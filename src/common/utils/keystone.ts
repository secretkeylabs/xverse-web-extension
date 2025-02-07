import type { Account, NetworkType } from '@secretkeylabs/xverse-core';

export const getNewAccountId = (keystoneAccountsList: Account[]) => {
  if (keystoneAccountsList.length === 0) {
    return 0;
  }

  return keystoneAccountsList[keystoneAccountsList.length - 1].id + 1;
};

export const filterKeystoneAccountsByNetwork = (accounts: Account[], network: NetworkType) =>
  accounts.filter((account) =>
    account.btcAddresses.taproot.address.startsWith(network === 'Mainnet' ? 'bc1' : 'tb1'),
  );

export const getKeystoneDeviceNewAccountIndex = (
  keystoneAccountsList: Account[],
  network: NetworkType,
  masterKey?: string,
) => {
  const networkKeystoneAccounts = filterKeystoneAccountsByNetwork(keystoneAccountsList, network);

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

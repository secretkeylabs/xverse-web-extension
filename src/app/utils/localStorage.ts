import { SettingsNetwork } from 'app/core/constants/constants';
import { Account } from 'app/core/types/accounts';
import { Network } from 'app/core/types/networks';

const userPrefBackupRemindKey = 'UserPref:BackupRemind';
const stxAddressKey = 'StxAddress';
const btcAddressKey = 'BtcAddress';
const masterPubKeyKey = 'MasterPubKey';
const stxPublicKeyKey = 'PublicKey';
const btcPublicKeyKey = 'BtcPublicKey';
const networkSettingKey = 'NetworkSetting';
const walletDataVersionKey = 'WalletDataVersion';
const bnsNameKey = 'BnsNameKey';
const selectedNetworkKey = 'selectedNetwork';
const accountsListKey = 'AccountsList';
const selectedAccountKey = 'SelectedAccount';
const isTermsAccepted = 'isTermsAccepted';
const hasFinishedOnboardingKey='hasFinishedOnboarding';

function saveMultiple(items: { [x: string]: string }) {
  const itemKeys = Object.keys(items);
  itemKeys.forEach((key) => {
    localStorage.setItem(key, items[key]);
  });
}

export function saveHasFinishedOnboarding(finished: boolean) {
  return localStorage.setItem(hasFinishedOnboardingKey, finished.toString());
}

export function getHasFinishedOnboarding(): boolean {
  const accepted = localStorage.getItem(hasFinishedOnboardingKey);
  if (accepted !== null) {
    return true;
  }
  return false;
}

export function saveIsTermsAccepted(termsDisplayed: boolean) {
  return localStorage.setItem(isTermsAccepted, termsDisplayed.toString());
}

export function getIsTermsAccepted(): boolean {
  const accepted = localStorage.getItem(isTermsAccepted);
  if (accepted !== null) {
    return true;
  }
  return false;
}

export function saveUserPrefBackupRemind(nextBackupRemind: string) {
  return localStorage.setItem(userPrefBackupRemindKey, nextBackupRemind);
}

export function getUserPrefBackupRemind(): string | null {
  return localStorage.getItem(userPrefBackupRemindKey);
}

export async function saveWalletData({
  stxAddress,
  btcAddress,
  masterPubKey,
  stxPublicKey,
  btcPublicKey,
  network,
  version,
  bnsName,
}: {
  stxAddress: string;
  btcAddress: string;
  masterPubKey: string;
  stxPublicKey: string;
  btcPublicKey: string;
  network: Network;
  version: number;
  bnsName: string | undefined;
}) {
  saveMultiple({
    [stxAddressKey]: stxAddress,
    [btcAddressKey]: btcAddress,
    [masterPubKeyKey]: masterPubKey,
    [stxPublicKeyKey]: stxPublicKey,
    [btcPublicKeyKey]: btcPublicKey,
    [networkSettingKey]: network,
    [walletDataVersionKey]: version.toString(),
    [bnsNameKey]: bnsName || '',
  });
}

export function saveSelectedNetwork(network: SettingsNetwork) {
  return localStorage.setItem(selectedNetworkKey, JSON.stringify(network));
}

export function getSelectedNetwork(): SettingsNetwork {
  const mainnetNetwork: SettingsNetwork = {
    name: 'Mainnet',
    address: 'https://stacks-node-api.mainnet.stacks.co',
  };
  const network = localStorage.getItem(selectedNetworkKey);
  if (!network) {
    return mainnetNetwork;
  }
  const selected: SettingsNetwork = JSON.parse(network);
  return selected;
}

export function saveAccountsList(accounts: Account[]) {
  return localStorage.setItem(accountsListKey, JSON.stringify(accounts));
}

export function saveSelectedAccount(account: Account) {
  const jsonAccount = JSON.stringify(account);
  return localStorage.setItem(selectedAccountKey, jsonAccount);
}

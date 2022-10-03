import { SettingsNetwork } from 'app/core/constants/constants';
import { Account } from 'app/core/types/accounts';

const userPrefBackupRemindKey = 'UserPref:BackupRemind';
const selectedNetworkKey = 'selectedNetwork';
const accountsListKey = 'AccountsList';
const selectedAccountKey = 'SelectedAccount';
const isTermsAccepted = 'isTermsAccepted';
const hasFinishedOnboardingKey = 'hasFinishedOnboarding';
const saltKey = 'salt';
const encryptedSeedKey = 'encSeed';

export function saveMultiple(items: { [x: string]: string }) {
  const itemKeys = Object.keys(items);
  itemKeys.forEach((key) => {
    localStorage.setItem(key, items[key]);
  });
}

export function saveHasFinishedOnboarding(finished: boolean) {
  localStorage.setItem(hasFinishedOnboardingKey, finished.toString());
}

export function getHasFinishedOnboarding(): boolean {
  const accepted = localStorage.getItem(hasFinishedOnboardingKey);
  if (accepted !== null) {
    return true;
  }
  return false;
}

export function saveIsTermsAccepted(termsDisplayed: boolean) {
  localStorage.setItem(isTermsAccepted, termsDisplayed.toString());
}

export function getIsTermsAccepted(): boolean {
  const accepted = localStorage.getItem(isTermsAccepted);
  if (accepted !== null) {
    return true;
  }
  return false;
}

export function saveUserPrefBackupRemind(nextBackupRemind: string) {
  localStorage.setItem(userPrefBackupRemindKey, nextBackupRemind);
}

export function getUserPrefBackupRemind(): string | null {
  return localStorage.getItem(userPrefBackupRemindKey);
}

export function saveSelectedNetwork(network: SettingsNetwork) {
  localStorage.setItem(selectedNetworkKey, JSON.stringify(network));
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
  localStorage.setItem(accountsListKey, JSON.stringify(accounts));
}

export function saveSelectedAccount(account: Account) {
  const jsonAccount = JSON.stringify(account);
  return localStorage.setItem(selectedAccountKey, jsonAccount);
}

export function saveSalt(salt: string) {
  localStorage.setItem(saltKey, salt);
}

export function getSalt() {
  return localStorage.getItem(saltKey);
}

export function storeEncryptedSeed(seed: string) {
  localStorage.setItem(encryptedSeedKey, seed);
}

export function getEncryptedSeed() {
  return localStorage.getItem(encryptedSeedKey);
}

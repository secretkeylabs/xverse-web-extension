import { SettingsNetwork } from "@secretkeylabs/xverse-core";
import { Account } from "@stores/wallet/actions/types";

const userPrefBackupRemindKey = 'UserPref:BackupRemind';
const isTermsAccepted = 'isTermsAccepted';
const hasFinishedOnboardingKey = 'hasFinishedOnboarding';
const saltKey = 'salt';
const accountsListKey = 'AccountsList';
const selectedAccountKey = 'SelectedAccount';

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

export function saveAccountsList(accounts: Account[]) {
  localStorage.setItem(accountsListKey, JSON.stringify(accounts));
}

export async function getAccountsList(): Promise<Account[]> {
  try {
    const list =  localStorage.getItem(accountsListKey);
    if (list !== null) {
      const accountsList: Account[] = JSON.parse(list);
      return Promise.resolve(accountsList);
    } else return Promise.resolve([]);
  } catch (e) {
    return Promise.reject([]);
  }
}

export function saveSelectedAccount(account: Account) {
  const jsonAccount = JSON.stringify(account);
  return localStorage.setItem(selectedAccountKey, jsonAccount);
}

export async function getSelectedAccount(): Promise<Account | null> {
  const jsonAccount: string | null = localStorage.getItem(
    selectedAccountKey,
  );
  if (jsonAccount) {
    const account: Account = JSON.parse(jsonAccount);
    return account;
  }
  return null;
}

export function saveSalt(salt: string) {
  localStorage.setItem(saltKey, salt);
}

export function getSalt() {
  return localStorage.getItem(saltKey);
}



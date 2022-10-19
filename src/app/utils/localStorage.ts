import { BtcTransactionData } from '@secretkeylabs/xverse-core/types';

const userPrefBackupRemindKey = 'UserPref:BackupRemind';
const isTermsAccepted = 'isTermsAccepted';
const hasFinishedOnboardingKey = 'hasFinishedOnboarding';
const saltKey = 'salt';
const listOfBtcTransactionsKey = 'listOfBtcTransactions';

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

export function saveSalt(salt: string) {
  localStorage.setItem(saltKey, salt);
}

export function getSalt() {
  return localStorage.getItem(saltKey);
}

export function saveListOfBtcTransaction(transactions: BtcTransactionData[]) {
  localStorage.setItem(listOfBtcTransactionsKey, JSON.stringify(transactions));
}

export function getListOfBtcTransaction() {
  return localStorage.getItem(listOfBtcTransactionsKey);
}

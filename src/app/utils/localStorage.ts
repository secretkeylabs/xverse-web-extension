const userPrefBackupRemindKey = 'UserPref:BackupRemind';
const isTermsAccepted = 'isTermsAccepted';
const hasFinishedOnboardingKey = 'hasFinishedOnboarding';
const saltKey = 'salt';
const nonOrdinalTransferTime = 'nonOrdinalTransferTime';

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

export async function saveTimeForNonOrdinalTransferTransaction(ordinalAddress: string) {
  const currentTime = new Date().getTime().toString();
  return localStorage.setItem(nonOrdinalTransferTime + ordinalAddress, currentTime);
}

export async function getTimeForNonOrdinalTransferTransaction(ordinalAddress: string) {
  return localStorage.getItem(nonOrdinalTransferTime + ordinalAddress);
}

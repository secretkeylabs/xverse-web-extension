const isTermsAccepted = 'isTermsAccepted';
const nonOrdinalTransferTime = 'nonOrdinalTransferTime';

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

export async function saveTimeForNonOrdinalTransferTransaction(ordinalAddress: string) {
  const currentTime = new Date().getTime().toString();
  return localStorage.setItem(nonOrdinalTransferTime + ordinalAddress, currentTime);
}

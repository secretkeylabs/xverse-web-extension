export const chromeLocalStorageKeys = {
  isPriorityWallet: 'isPriorityWallet',
};

export function getIsPriorityWallet(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get(chromeLocalStorageKeys.isPriorityWallet, (result) => {
      resolve(result[chromeLocalStorageKeys.isPriorityWallet]);
    });
  });
}

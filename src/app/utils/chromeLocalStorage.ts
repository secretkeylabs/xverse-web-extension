export const chromeLocalStorageKeys = {
  isPriorityWallet: 'isPriorityWallet',
};

export function getIsPriorityWallet(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get(chromeLocalStorageKeys.isPriorityWallet, (result) => {
        resolve(result[chromeLocalStorageKeys.isPriorityWallet]);
      });
    } catch (e) {
      resolve(false);
    }
  });
}

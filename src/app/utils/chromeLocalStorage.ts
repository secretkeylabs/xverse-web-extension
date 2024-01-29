import { chromeLocalStorage } from './chromeStorage';

export const chromeLocalStorageKeys = {
  isPriorityWallet: 'isPriorityWallet',
};

export async function getIsPriorityWallet(): Promise<boolean> {
  const isPriorityWallet = await chromeLocalStorage.getItem<boolean>(
    chromeLocalStorageKeys.isPriorityWallet,
  );

  return isPriorityWallet ?? true;
}

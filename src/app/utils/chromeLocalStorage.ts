import chromeStorage from '@utils/chromeStorage';

export const chromeLocalStorageKeys = {
  isPriorityWallet: 'isPriorityWallet',
};

export async function getIsPriorityWallet(): Promise<boolean> {
  const isPriorityWallet = await chromeStorage.local.getItem<boolean>(
    chromeLocalStorageKeys.isPriorityWallet,
  );

  return isPriorityWallet ?? true;
}

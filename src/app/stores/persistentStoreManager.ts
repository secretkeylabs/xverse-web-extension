import { PersistentStoreManager, type ExtendedStorageAdapter } from '@secretkeylabs/xverse-core';
import chromeStorage from '@utils/chromeStorage';

const localStorageAdapter: ExtendedStorageAdapter = {
  get: async (key: string) => chromeStorage.local.getItem<string, null>(key, null),
  getMany: async <T extends string>(...keys: T[]) => chromeStorage.local.getItems<T>(...keys),
  set: async (key: string, value: string) => chromeStorage.local.setItem(key, value),
  remove: async (key: string) => chromeStorage.local.removeItem(key),
  addListener: (callback) => chromeStorage.local.addListener(callback),
  getAllKeys: async () => chromeStorage.local.getAllKeys(),
};

export const globalStoreManager = new PersistentStoreManager(localStorageAdapter);

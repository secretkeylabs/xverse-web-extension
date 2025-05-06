import {
  MasterVault,
  generateRandomKey,
  type CryptoUtilsAdapter,
  type StorageAdapter,
} from '@secretkeylabs/xverse-core';
import chromeStorage from '@utils/chromeStorage';
import { decryptionHandler, encryptionHandler, generateKeyArgon2id } from '@utils/encryptionUtils';

const cryptoUtilsAdapter: CryptoUtilsAdapter = {
  encrypt: encryptionHandler,
  decrypt: decryptionHandler,
  generateRandomBytes: generateRandomKey,
  hash: generateKeyArgon2id,
};

const sessionStorageAdapter: StorageAdapter = {
  get: async (key: string) => chromeStorage.session.getItem<string, null>(key, null),
  getMany: async <T extends string>(...keys: T[]) => chromeStorage.session.getItems<T>(...keys),
  set: async (key: string, value: string) => chromeStorage.session.setItem(key, value),
  remove: async (key: string) => chromeStorage.session.removeItem(key),
};

const localStorageAdapter: StorageAdapter = {
  get: async (key: string) => chromeStorage.local.getItem<string, null>(key, null),
  getMany: async <T extends string>(...keys: T[]) => chromeStorage.local.getItems<T>(...keys),
  set: async (key: string, value: string) => chromeStorage.local.setItem(key, value),
  remove: async (key: string) => chromeStorage.local.removeItem(key),
};

const masterVault = new MasterVault({
  cryptoUtilsAdapter,
  sessionStorageAdapter,
  encryptedDataStorageAdapter: localStorageAdapter,
  commonStorageAdapter: localStorageAdapter,
});

const useVault = () => masterVault;

export default useVault;

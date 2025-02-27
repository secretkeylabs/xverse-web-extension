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

const secureStorageAdapter: StorageAdapter = {
  get: async (key: string) => chromeStorage.session.getItem<string, null>(key, null),
  set: async (key: string, value: string) => chromeStorage.session.setItem(key, value),
  remove: async (key: string) => chromeStorage.session.removeItem(key),
};

const commonStorageAdapter: StorageAdapter = {
  get: async (key: string) => chromeStorage.local.getItem<string, null>(key, null),
  set: async (key: string, value: string) => chromeStorage.local.setItem(key, value),
  remove: async (key: string) => chromeStorage.local.removeItem(key),
};

const masterVault = new MasterVault({
  cryptoUtilsAdapter,
  secureStorageAdapter,
  commonStorageAdapter,
});

const useVault = () => masterVault;

export default useVault;

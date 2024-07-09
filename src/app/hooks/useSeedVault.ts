import {
  CryptoUtilsAdapter,
  SeedVaultInstance as SeedVault,
  StorageAdapter,
  generateRandomKey,
} from '@secretkeylabs/xverse-core';
import chromeStorage from '@utils/chromeStorage';
import {
  decryptSeedPhraseHandler,
  encryptSeedPhraseHandler,
  generateKeyArgon2id,
} from '@utils/encryptionUtils';
import { useMemo } from 'react';

const cryptoUtilsAdapter: CryptoUtilsAdapter = {
  encrypt: encryptSeedPhraseHandler,
  decrypt: decryptSeedPhraseHandler,
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

const useSeedVault = () => {
  const vault = useMemo(
    () =>
      SeedVault({
        cryptoUtilsAdapter,
        secureStorageAdapter,
        commonStorageAdapter,
      }),
    [],
  );

  return vault;
};
export default useSeedVault;

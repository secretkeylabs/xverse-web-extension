import { useMemo } from 'react';
import SeedVault, {
  CryptoUtilsAdapter,
  StorageAdapter,
} from '@secretkeylabs/xverse-core/seedVault';
import { generateRandomKey } from '@secretkeylabs/xverse-core/encryption';
import { chromeSessionStorage, chromeLocalStorage } from '@utils/chromeStorage';
import {
  decryptSeedPhraseHandler,
  encryptSeedPhraseHandler,
  generateKeyArgon2id,
} from '@utils/encryptionUtils';

const cryptoUtilsAdapter: CryptoUtilsAdapter = {
  encrypt: encryptSeedPhraseHandler,
  decrypt: decryptSeedPhraseHandler,
  generateRandomBytes: generateRandomKey,
  hash: generateKeyArgon2id,
};

const secureStorageAdapter: StorageAdapter = {
  get: async (key: string) => chromeSessionStorage.getItem<string>(key),
  set: async (key: string, value: string) => chromeSessionStorage.setItem(key, value),
  remove: async (key: string) => chromeSessionStorage.removeItem(key),
};

const commonStorageAdapter: StorageAdapter = {
  get: async (key: string) => chromeLocalStorage.getItem<string>(key),
  set: async (key: string, value: string) => chromeLocalStorage.setItem(key, value),
  remove: async (key: string) => chromeLocalStorage.removeItem(key),
};

const useSeedVault = () => {
  const vault = useMemo(
    () =>
      new SeedVault({
        cryptoUtilsAdapter,
        secureStorageAdapter,
        commonStorageAdapter,
      }),
    [],
  );

  return vault;
};
export default useSeedVault;

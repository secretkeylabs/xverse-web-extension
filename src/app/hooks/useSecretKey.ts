import { useMemo } from 'react';
import SeedVault, {
  CryptoUtilsAdapter,
  StorageAdapter,
} from '@secretkeylabs/xverse-core/seedVault';
import { generateRandomKey } from '@secretkeylabs/xverse-core/encryption';
import { getSessionItem, setSessionItem } from '@utils/sessionStorageUtils';
import * as cryptoUtils from '@utils/encryptionUtils';
import ChromeStorage from '@utils/storage';

const cryptoUtilsAdapter: CryptoUtilsAdapter = {
  encrypt: cryptoUtils.encryptSeedPhraseHandler,
  decrypt: cryptoUtils.decryptSeedPhraseHandler,
  generateRandomBytes: generateRandomKey,
  hash: cryptoUtils.generateKeyArgon2id,
};

const secureStorageAdapter: StorageAdapter = {
  get: getSessionItem,
  set: setSessionItem,
};

const commonStorageAdapter: StorageAdapter = {
  get: async (key: string) => ChromeStorage.getItem(key),
  set: async (key: string, value: string) => ChromeStorage.setItem(key, value),
};

const useSecretKey = () => {
  const vault = useMemo(
    () =>
      new SeedVault({
        cryptoUtilsAdapter,
        secureStorageAdapter,
        commonStorageAdapter,
      }),
    [],
  );
  return {
    getSeed: vault.getSeed,
    initSeedVault: vault.init,
    storeSeed: vault.storeSeed,
    lockVault: vault.lockVault,
    changePassword: vault.changePassword,
    hasSeed: vault.hasSeed,
    unlockVault: vault.unlockVault,
  };
};
export default useSecretKey;

import { useMemo } from 'react';
import SeedVault, {
  CommonStorageAdapter,
  CryptoUtilsAdapter,
  SecureStorageAdapter,
} from '@secretkeylabs/xverse-core/seedVault';
import * as cryptoUtils from '@utils/encryptionUtils';
import ChromeStorage from '@utils/storage';
import { getFromSessionStorage, setFromSessionStorage } from '@utils/sessionStorageUtils';

const cryptoUtilsAdapter: CryptoUtilsAdapter = {
  encrypt: cryptoUtils.encryptSeedPhrase,
  decrypt: cryptoUtils.decryptSeedPhrase,
  generateRandomBytes: cryptoUtils.generateRandomKey,
  hash: cryptoUtils.generateKeyArgon2,
};

const secureStorageAdapter: SecureStorageAdapter = {
  get: getFromSessionStorage,
  set: setFromSessionStorage,
};

const commonStorageAdapter: CommonStorageAdapter = {
  get: async (key: string) => ChromeStorage.getItem(key),
  set: async (key: string, value: string) => ChromeStorage.setItem(key, value),
};

const useSecretKey = () => {
  const vault = useMemo(
    () =>  new SeedVault({
        cryptoUtilsAdapter,
        storageAdapter: secureStorageAdapter,
        commonStorageAdapter,
      }),
    [],
  );
  return {
    getSeed: vault.getSeed,
    initSeedVault: vault.init,
    storeSeed: vault.storeSeed,
    lockVault: vault.lockVault,
  };
};
export default useSecretKey;

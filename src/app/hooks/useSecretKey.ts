import { useMemo } from 'react';
import SeedVault, {
  CryptoUtilsAdapter,
  SeedVaultStorageKeys,
  StorageAdapter,
} from '@secretkeylabs/xverse-core/seedVault';
import { generateRandomKey } from '@secretkeylabs/xverse-core/encryption';
import { getSessionItem, removeSessionItem, setSessionItem } from '@utils/sessionStorageUtils';
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

  const clearVaultStorage = async () => {
    await ChromeStorage.removeItem(SeedVaultStorageKeys.ENCRYPTED_KEY);
    await ChromeStorage.removeItem(SeedVaultStorageKeys.PASSWORD_SALT);
    await removeSessionItem(SeedVaultStorageKeys.PASSWORD_HASH);
  };

  return {
    ...vault,
    initSeedVault: vault.init,
    clearVaultStorage,
  };
};
export default useSecretKey;

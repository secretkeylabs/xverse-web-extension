import { SeedVaultStorageKeys } from '@secretkeylabs/xverse-core';
import ChromeStorage from '@utils/chromeStorage';
import { useDispatch } from 'react-redux';
import useSeedVault from './useSeedVault';
import useSelectedAccount from './useSelectedAccount';
import useWalletReducer from './useWalletReducer';
import useWalletSelector from './useWalletSelector';

const useSeedVaultMigration = () => {
  const SeedVault = useSeedVault();
  const { accountsList } = useWalletSelector();
  const { switchAccount } = useWalletReducer();
  const selectedAccount = useSelectedAccount();
  const dispatch = useDispatch();

  const isVaultUpdated = async () => {
    const currentVaultVersion = await ChromeStorage.local.getItem<string>(
      SeedVaultStorageKeys.SEED_VAULT_VERSION,
    );
    return currentVaultVersion === SeedVault.VERSION.toString();
  };

  const createMigrationBackup = (backup: {
    [SeedVaultStorageKeys.ENCRYPTED_KEY]: string;
    [SeedVaultStorageKeys.PASSWORD_SALT]: string;
  }) => {
    const hasBackup = localStorage.getItem('SEED_VAULT_MIGRATION_BACKUP');
    if (!hasBackup) {
      localStorage.setItem('SEED_VAULT_MIGRATION_BACKUP', JSON.stringify(backup));
    }
  };

  const updateSeedVault = async (encryptedKey: string, passwordSalt: string) => {
    await chrome.storage.local.clear();
    await SeedVault.restoreVault(encryptedKey, passwordSalt);
    localStorage.removeItem('SEED_VAULT_MIGRATION_BACKUP');
    /**
     * The migration clears the redux store cache, so if the user quits the extension without going to the home screen the cache would be empty for the next session,
     * this is a workaround to trigger flushing the redux-store state to cache,
     */
    switchAccount(selectedAccount!);
  };

  const migrateCachedStorage = async () => {
    const backup = localStorage.getItem('SEED_VAULT_MIGRATION_BACKUP');
    if (!backup) {
      const passwordSalt = await ChromeStorage.local.getItem<string>(
        SeedVaultStorageKeys.PASSWORD_SALT,
      );
      const encryptedKey = await ChromeStorage.local.getItem<string>(
        SeedVaultStorageKeys.ENCRYPTED_KEY,
      );
      if (!passwordSalt || !encryptedKey) return;
      createMigrationBackup({
        [SeedVaultStorageKeys.ENCRYPTED_KEY]: encryptedKey,
        [SeedVaultStorageKeys.PASSWORD_SALT]: passwordSalt,
      });
      await updateSeedVault(encryptedKey, passwordSalt);
      return;
    }
    const {
      [SeedVaultStorageKeys.ENCRYPTED_KEY]: encryptedKey,
      [SeedVaultStorageKeys.PASSWORD_SALT]: passwordSalt,
    } = JSON.parse(backup);
    await updateSeedVault(encryptedKey, passwordSalt);
  };
  return {
    isVaultUpdated,
    migrateCachedStorage,
  };
};

export default useSeedVaultMigration;

import { SeedVaultStorageKeys } from '@secretkeylabs/xverse-core';
import { fetchAccountAction } from '@stores/wallet/actions/actionCreators';
import ChromeStorage from '@utils/chromeStorage';
import { useDispatch } from 'react-redux';
import useSeedVault from './useSeedVault';
import useWalletSelector from './useWalletSelector';

const useSeedVaultMigration = () => {
  const SeedVault = useSeedVault();
  const { selectedAccount, accountsList } = useWalletSelector();
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
    // triggers refreshing of the cached data
    dispatch(fetchAccountAction(selectedAccount!, accountsList));
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

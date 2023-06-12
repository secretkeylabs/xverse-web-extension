import useWalletReducer from './useWalletReducer';

const useCacheMigration = () => {
  const { unlockWallet } = useWalletReducer();

  const migrateCachedStorage = async (password: string) => {
    await unlockWallet(password);
    chrome.storage.local.clear();
    localStorage.setItem('migrated', 'true');
  };
  return {
    migrateCachedStorage,
  };
};

export default useCacheMigration;

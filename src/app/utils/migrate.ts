import { storage } from '@stores/index';

const storageKey = 'persist:walletState';

const migrateCachedStorage = async () => {
  const hasMigrated = localStorage.getItem('migrated');
  if (!hasMigrated) {
    const existingStorage = await storage.getItem(storageKey);
    const parsed = JSON.parse(existingStorage as string);
    parsed.accountsList = [];
    const newValue = JSON.stringify(parsed);
    await chrome.storage.local.clear();
    await storage.setItem(storageKey, newValue);
    localStorage.setItem('migrated', 'true');
  }
};

export default migrateCachedStorage;

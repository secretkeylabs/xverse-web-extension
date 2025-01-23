import { saveStore } from '@common/utils/permissionsStore';
import { type Permissions } from '@secretkeylabs/xverse-core';

let storeGlobal: Permissions.Store.PermissionsStore | null = null;

export function setStoreGlobal(newStore: Permissions.Store.PermissionsStore) {
  storeGlobal = newStore;
}

export function saveStoreGlobal(newStore: Permissions.Store.PermissionsStore) {
  storeGlobal = newStore;
  saveStore(newStore);
}

export function getStoreGlobal(): Permissions.Store.PermissionsStore {
  if (!storeGlobal) {
    throw new Error('Store has not been initialized');
  }

  return storeGlobal;
}

import { error, safePromise, success, type Result, type SafeError } from '@common/utils/safe';
import { permissions, type Permissions } from '@secretkeylabs/xverse-core';
import storage from '@utils/chromeStorage';
import { Mutex } from 'async-mutex';
import { parse, stringify } from 'superjson';
import * as v from 'valibot';
import { permissionsPersistantStoreKeyName } from './constants';

export async function getPermissionsStore(): Promise<
  Result<
    Permissions.Store.PermissionsStore,
    SafeError<'StorageRetrievalError' | 'StoreNotFoundError' | 'ParseError'>
  >
> {
  const [getItemError, persistedData] = await safePromise(
    storage.local.getItem(permissionsPersistantStoreKeyName),
  );

  if (getItemError) {
    return error({
      name: 'StorageRetrievalError',
      message: 'Failed to retrieve permissions store from storage.',
      data: getItemError,
    });
  }

  if (!persistedData) {
    return error({
      name: 'StoreNotFoundError',
      message: 'Permissions store not found in storage.',
    });
  }

  const hydrated = parse(persistedData);
  const parseResult = v.safeParse(permissions.store.permissionsStore, hydrated);
  if (!parseResult.success) {
    return error({
      name: 'ParseError',
      message: 'Failed to parse permissions store.',
      data: parseResult.issues,
    });
  }

  return success(parseResult.output);
}

export function savePermissionsStore(permissionsStore: Permissions.Store.PermissionsStore) {
  return chrome.storage.local.set({
    [permissionsPersistantStoreKeyName]: stringify(permissionsStore),
  });
}

/**
 * Initializes a permissions store if none exists, or migrates it to the latest
 * version if necessary. This function should be called once before any other
 * store-related methods are called (e.g., on app start).
 */
export async function initPermissionsStore(): Promise<Result<Permissions.Store.PermissionsStore>> {
  const [getStoreError, store] = await getPermissionsStore();

  if (getStoreError) {
    if (getStoreError.name === 'ParseError') {
      // The store is outdated and needs to be migrated. For now, the store is
      // migrated by creating a new store using the current schema and
      // overwriting the previous one. As the store becomes more complex, a more
      // comprehensive migration may be required.
      const newStore = permissions.utils.store.makePermissionsStore();
      await savePermissionsStore(newStore);
      return success(newStore);
    }

    if (getStoreError.name === 'StoreNotFoundError') {
      // The store doesn't exist yet, so we create a new one.
      const newStore = permissions.utils.store.makePermissionsStore();
      await savePermissionsStore(newStore);
      return success(newStore);
    }

    return error({
      name: 'InitError',
      message: 'Failed to initialize permissions store.',
      data: getStoreError,
    });
  }

  return success(store);
}

/**
 * This mutex is intended to be used when mutating the permissions store.
 */
export const permissionsStoreMutex = new Mutex();

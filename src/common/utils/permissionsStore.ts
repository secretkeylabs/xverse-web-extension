import {
  error,
  permissions,
  safeCall,
  safePromise,
  success,
  type Permissions,
  type Result,
  type SafeError,
} from '@secretkeylabs/xverse-core';
import * as v from 'valibot';

const permissionsPersistantStoreKeyName = 'client-permissions';

/**
 * Returns the new store value if the store storage has changed, otherwise returns false.
 */
export function hasStoreChanges(changes: {
  [key: string]: chrome.storage.StorageChange;
}): false | Permissions.Store.PermissionsStore {
  const stringifiedStore = changes[permissionsPersistantStoreKeyName]?.newValue;

  if (!stringifiedStore) {
    return false;
  }

  return JSON.parse(stringifiedStore);
}

export function saveStore(store: Permissions.Store.PermissionsStore) {
  chrome.storage.local.set({ [permissionsPersistantStoreKeyName]: JSON.stringify(store) });
}

async function loadPermissionsStore(): Promise<
  Result<
    Permissions.Store.PermissionsStore,
    SafeError<'ItemGetError' | 'StoreNotFoundError' | 'JsonParseError' | 'SchemaParseError'>
  >
> {
  const [itemGetError, item] = await safePromise(
    // storage.local.getItem(permissionsPersistantStoreKeyName),
    chrome.storage.local.get(permissionsPersistantStoreKeyName),
  );
  if (itemGetError) {
    return error({
      name: 'ItemGetError',
      message: 'Failed to get item from storage.',
      data: itemGetError,
    });
  }

  if (!item[permissionsPersistantStoreKeyName]) {
    return error({
      name: 'StoreNotFoundError',
      message: 'Permissions store not found.',
    });
  }

  const [jsonParseError, hydrated] = safeCall(() =>
    JSON.parse(item[permissionsPersistantStoreKeyName]),
  );
  if (jsonParseError) {
    return error({
      name: 'JsonParseError',
      message: 'Failed to parse JSON.',
      data: jsonParseError,
    });
  }

  const parseResult = v.safeParse(permissions.store.permissionsStore, hydrated);
  if (!parseResult.success) {
    return error({
      name: 'SchemaParseError',
      message: 'Failed to parse permissions store.',
      data: parseResult.issues,
    });
  }

  return success(parseResult.output);
}

/**
 * Initializes a permissions store if none exists, and migrates it to the latest
 * version if necessary. If already initialized, returns the existing store. May
 * safely be called multiple times.
 */
export async function initPermissionsStore(): Promise<Result<Permissions.Store.PermissionsStore>> {
  const [storeGetError, loadedStore] = await loadPermissionsStore();

  if (storeGetError) {
    if (storeGetError.name === 'SchemaParseError') {
      // The store is outdated and needs to be migrated. For now, the store is
      // migrated by creating a new store using the current schema and
      // overwriting the previous one. As the store becomes more complex, a more
      // comprehensive migration may be required.
      const newStore = permissions.utils.store.makePermissionsStore();
      saveStore(newStore);
      return success(newStore);
    }

    if (storeGetError.name === 'StoreNotFoundError') {
      // The store doesn't exist yet, so we create a new one.
      const newStore = permissions.utils.store.makePermissionsStore();
      saveStore(newStore);
      return success(newStore);
    }

    return error({
      name: 'InitError',
      message: 'Failed to initialize permissions store.',
      data: storeGetError,
    });
  }

  return success(loadedStore);
}

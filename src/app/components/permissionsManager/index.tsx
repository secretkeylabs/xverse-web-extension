import { permissions, type Permissions } from '@secretkeylabs/xverse-core';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { parse } from 'superjson';
import * as v from 'valibot';
import { permissionsPersistantStoreKeyName } from './constants';
import type { TPermissionsStoreContext, TPermissionsUtilsContext } from './types';
import * as utils from './utils';

const PermissionsStoreContext = createContext<TPermissionsStoreContext>({
  isLoading: true,
  error: undefined,
  store: undefined,
});
function PermissionsStoreProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<TPermissionsStoreContext>({
    isLoading: true,
    error: undefined,
    store: undefined,
  });

  useEffect(() => {
    utils.permissionsStoreMutex.runExclusive(async () => {
      const [e, store] = await utils.initPermissionsStore();

      if (e) {
        setValue({
          isLoading: false,
          error: e,
          store: undefined,
        });
        // eslint-disable-next-line no-console
        console.error('Failed to load permissions store', e);
        return;
      }

      setValue({
        isLoading: false,
        error: undefined,
        store,
      });
    });
  }, []);

  const callback = useCallback((changes: { [key: string]: chrome.storage.StorageChange }) => {
    const permissionsStoreChanges = changes[permissionsPersistantStoreKeyName];
    if (permissionsStoreChanges) {
      const { newValue } = permissionsStoreChanges;
      const hydrated = parse(newValue);
      const parseResult = v.safeParse(permissions.store.permissionsStore, hydrated);
      if (!parseResult.success) {
        setValue({
          isLoading: false,
          error: parseResult.issues,
          store: undefined,
        });
        return;
      }

      setValue({
        isLoading: false,
        error: undefined,
        store: parseResult.output,
      });
    }
  }, []);

  useEffect(() => {
    chrome.storage.onChanged.addListener(callback);

    return () => {
      chrome.storage.onChanged.removeListener(callback);
    };
  }, [callback]);

  return (
    <PermissionsStoreContext.Provider value={value}>{children}</PermissionsStoreContext.Provider>
  );
}
const usePermissionsStore = () => useContext(PermissionsStoreContext);

type EnsureStoreLoadedProps = {
  renderChildren: (store: Permissions.Store.PermissionsStore) => React.ReactNode;
};
export function EnsureStoreLoaded({ renderChildren }: EnsureStoreLoadedProps): React.ReactElement {
  const { isLoading, store, error } = usePermissionsStore();

  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return <>Error loading permissions store.</>;
  }

  if (isLoading) {
    return <>Loading...</>;
  }

  if (!store) {
    return <>Failed to load permissions store</>;
  }

  return <>{renderChildren(store)}</>;
}

const PermissionsUtilsContext = createContext<TPermissionsUtilsContext | undefined>(undefined);
function PermissionsUtilsProvider({ children }: { children: React.ReactNode }) {
  const { store } = usePermissionsStore();

  // Queries

  const getClientPermissions = useCallback(
    (clientId: Permissions.Store.Client['id']) => {
      if (!store) {
        // eslint-disable-next-line no-console
        console.warn('[PermissionsUtilsProvider.getClientPermissions]: Store is not loaded yet.');
        return [];
      }

      return permissions.utils.store.getClientPermissions(store.permissions, clientId);
    },
    [store],
  );

  const getClientMetadata = useCallback(
    (clientId: Permissions.Store.Client['id']) => {
      if (!store) {
        // eslint-disable-next-line no-console
        console.warn('[PermissionsUtilsProvider.getClientMetadata]: Store is not loaded yet.');
        return undefined;
      }

      return permissions.utils.store.getClientMetadata(store, clientId);
    },
    [store],
  );
  const getClientPermission = useCallback(
    async (
      type: Permissions.Store.Permission['type'],
      clientId: Permissions.Store.Client['id'],
      resourceId: Permissions.Store.Resource['id'],
    ) => {
      if (!store) {
        // eslint-disable-next-line no-console
        console.warn('[PermissionsUtilsProvider.getClientPermission]: Store is not loaded yet.');
        return undefined;
      }

      return permissions.utils.store.getClientPermission(
        store.permissions,
        type,
        clientId,
        resourceId,
      );
    },
    [store],
  );
  const getResource = useCallback(
    (resourceId: Permissions.Store.Resource['id']) => {
      if (!store) {
        // eslint-disable-next-line no-console
        console.warn('[PermissionsUtilsProvider.getResource]: Store is not loaded yet.');
        return undefined;
      }

      return permissions.utils.store.getResource(store.resources, resourceId);
    },
    [store],
  );

  // Mutations

  const addClient = useCallback(
    async (client: Permissions.Store.Client) => {
      await utils.permissionsStoreMutex.runExclusive(async () => {
        if (!store) {
          // eslint-disable-next-line no-console
          console.warn('[PermissionsUtilsProvider.addClient]: Store is not loaded yet.');
          return;
        }

        permissions.utils.store.addClient(store.clients, client);
        await utils.savePermissionsStore(store);
      });
    },
    [store],
  );
  const addResource = useCallback(
    async (resource: Permissions.Store.Resource) => {
      await utils.permissionsStoreMutex.runExclusive(async () => {
        if (!store) {
          // eslint-disable-next-line no-console
          console.warn('[PermissionsUtilsProvider.addResource]: Store is not loaded yet.');
          return;
        }

        permissions.utils.store.addResource(store.resources, resource);
        await utils.savePermissionsStore(store);
      });
    },
    [store],
  );
  const removeResource = useCallback(
    async (resourceId: Permissions.Store.Resource['id']) => {
      await utils.permissionsStoreMutex.runExclusive(async () => {
        if (!store) {
          // eslint-disable-next-line no-console
          console.warn('[PermissionsUtilsProvider.removeResource]: Store is not loaded yet.');
          return;
        }

        permissions.utils.store.removeResource(store.resources, resourceId);
        await utils.savePermissionsStore(store);
      });
    },
    [store],
  );
  const setPermission = useCallback(
    async (permission: Permissions.Store.Permission) => {
      await utils.permissionsStoreMutex.runExclusive(async () => {
        if (!store) {
          // eslint-disable-next-line no-console
          console.warn('[PermissionsUtilsProvider.setPermission]: Store is not loaded yet.');
          return;
        }

        permissions.utils.store.setPermission(
          store.clients,
          store.resources,
          store.permissions,
          permission,
        );
        await utils.savePermissionsStore(store);
      });
    },
    [store],
  );
  const removePermission = useCallback(
    async (
      type: Permissions.Store.Permission['type'],
      clientId: Permissions.Store.Client['id'],
      resourceId: Permissions.Store.Resource['id'],
    ) => {
      await utils.permissionsStoreMutex.runExclusive(async () => {
        if (!store) {
          // eslint-disable-next-line no-console
          console.warn('[PermissionsUtilsProvider.removePermission]: Store is not loaded yet.');
          return;
        }

        permissions.utils.store.removePermission(store.permissions, type, clientId, resourceId);
        await utils.savePermissionsStore(store);
      });
    },
    [store],
  );
  const removeAllClientPermissions = useCallback(
    async (clientId: Permissions.Store.Client['id']) => {
      await utils.permissionsStoreMutex.runExclusive(async () => {
        if (!store) {
          // eslint-disable-next-line no-console
          console.warn(
            '[PermissionsUtilsProvider.removeAllClientPermissions]: Store is not loaded yet.',
          );
          return;
        }

        permissions.utils.store.removeAllClientPermissions(store.permissions, clientId);
        await utils.savePermissionsStore(store);
      });
    },
    [store],
  );
  const removeClient = useCallback(
    async (clientId: Permissions.Store.Client['id']) => {
      await utils.permissionsStoreMutex.runExclusive(async () => {
        if (!store) {
          // eslint-disable-next-line no-console
          console.warn('[PermissionsUtilsProvider.removeClient]: Store is not loaded yet.');
          return;
        }

        permissions.utils.store.removeClient(store, clientId);
        await utils.savePermissionsStore(store);
      });
    },
    [store],
  );

  const removeAllClients = useCallback(async () => {
    await utils.permissionsStoreMutex.runExclusive(async () => {
      if (!store) {
        // eslint-disable-next-line no-console
        console.warn('[PermissionsUtilsProvider.removeAllClients]: Store is not loaded yet.');
        return;
      }

      permissions.utils.store.removeAllClients(store);
      await utils.savePermissionsStore(store);
    });
  }, [store]);

  const contextValue = useMemo(
    () => ({
      addClient,
      addResource,
      removeResource,
      setPermission,
      removePermission,
      removeAllClientPermissions,
      getClientPermissions,
      getClientMetadata,
      getClientPermission,
      removeClient,
      removeAllClients,
      getResource,
    }),
    [
      addClient,
      addResource,
      removeResource,
      setPermission,
      removePermission,
      removeAllClientPermissions,
      removeAllClients,
      getClientPermissions,
      getClientMetadata,
      getClientPermission,
      removeClient,
      getResource,
    ],
  );

  return (
    <PermissionsUtilsContext.Provider value={contextValue}>
      {children}
    </PermissionsUtilsContext.Provider>
  );
}

export const usePermissionsUtils = () => {
  const context = useContext(PermissionsUtilsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  return (
    <PermissionsStoreProvider>
      <PermissionsUtilsProvider>{children}</PermissionsUtilsProvider>
    </PermissionsStoreProvider>
  );
}

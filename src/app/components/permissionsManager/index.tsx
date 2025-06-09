import { hasStoreChanges, initPermissionsStore } from '@common/utils/permissionsStore';
import { useRender } from '@screens/stxSignTransactions/components/getPopupPayload/components/loader/components/signingFlow/components/review/hooks';
import { type Permissions, permissions, safeCall } from '@secretkeylabs/xverse-core';
import { useMutation } from '@tanstack/react-query';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect } from 'react';
import { getStoreGlobal, saveStoreGlobal, setStoreGlobal } from './globalStore';
import type { TPermissionsUtilsContext } from './types';

const PermissionsUtilsContext = createContext<TPermissionsUtilsContext | undefined>(undefined);

export function PermissionsProvider({ children }: PropsWithChildren) {
  const {
    mutate,
    isPending,
    data: isStoreInitializationComplete,
  } = useMutation({
    async mutationFn() {
      const [, storeGlobal] = safeCall(() => getStoreGlobal());
      if (storeGlobal) return;

      const [initError, newStore] = await initPermissionsStore();
      if (initError) {
        // eslint-disable-next-line no-console
        console.error(initError);
        throw new Error('Failed to initialize the permissions store', { cause: initError });
      }

      setStoreGlobal(newStore);

      return true;
    },
  });
  useEffect(() => {
    // Only run the mutation once.
    if (isStoreInitializationComplete) return;

    // If it's already running, don't run it again.
    if (isPending) return;

    mutate();
  }, [isPending, isStoreInitializationComplete, mutate]);

  const render = useRender();
  const renderCallback = useCallback(
    (changes: { [key: string]: chrome.storage.StorageChange }) => {
      const maybeStoreChanges = hasStoreChanges(changes);
      if (maybeStoreChanges) {
        setStoreGlobal(maybeStoreChanges);
        render();
      }
    },
    [render],
  );
  useEffect(() => {
    // Using storage `onChanged` listener to re-render so any changes to the
    // store, be they from within the React app or from the background script,
    // are reflected in the UI.

    chrome.storage.onChanged.addListener(renderCallback);
    return () => {
      chrome.storage.onChanged.removeListener(renderCallback);
    };
  }, [renderCallback]);

  const saveStore = useCallback((nextStore: Permissions.Store.PermissionsStore) => {
    saveStoreGlobal(nextStore);
  }, []);
  const getStore = useCallback(() => getStoreGlobal(), []);

  // Queries

  const getClient = useCallback(
    (clientId: Permissions.Store.Client['id']) => {
      const store = getStore();
      return permissions.utils.store.getClient(store, clientId);
    },
    [getStore],
  );

  const getClients = useCallback(() => {
    const store = getStore();
    return permissions.utils.store.getClients(store);
  }, [getStore]);

  const getClientPermissions = useCallback(
    (clientId: Permissions.Store.Client['id']) => {
      const store = getStore();
      return permissions.utils.store.getClientPermissions(store, clientId);
    },
    [getStore],
  );

  const getClientMetadata = useCallback(
    (clientId: Permissions.Store.Client['id']) => {
      const store = getStore();
      return permissions.utils.store.getClientMetadata(store, clientId);
    },
    [getStore],
  );

  const getClientPermission = useCallback(
    (
      type: Permissions.Store.Permission['type'],
      clientId: Permissions.Store.Client['id'],
      resourceId: Permissions.Store.Resource['id'],
    ) => {
      const store = getStore();
      return permissions.utils.store.getClientPermission(store, type, clientId, resourceId);
    },
    [getStore],
  );

  const getResource = useCallback(
    (resourceId: Permissions.Store.Resource['id']) => {
      const store = getStore();
      return permissions.utils.store.getResource(store, resourceId);
    },
    [getStore],
  );

  // Mutations

  const addClient = useCallback(
    (client: Permissions.Store.Client) => {
      const store = getStore();
      const nextStore = permissions.utils.store.addClient(store, client);
      saveStore(nextStore);
    },
    [getStore, saveStore],
  );

  const addResource = useCallback(
    (resource: Permissions.Store.Resource) => {
      const store = getStore();
      const nextStore = permissions.utils.store.addResource(store, resource);
      saveStore(nextStore);
    },
    [getStore, saveStore],
  );

  const removeResource = useCallback(
    (resourceId: Permissions.Store.Resource['id']) => {
      const store = getStore();
      const nextStore = permissions.utils.store.removeResource(store, resourceId);
      saveStore(nextStore);
    },
    [getStore, saveStore],
  );

  const setPermission = useCallback(
    (permission: Permissions.Store.Permission) => {
      const store = getStore();
      const nextStore = permissions.utils.store.setPermission(store, permission);
      saveStore(nextStore);
    },
    [getStore, saveStore],
  );

  const removePermission = useCallback(
    (
      type: Permissions.Store.Permission['type'],
      clientId: Permissions.Store.Client['id'],
      resourceId: Permissions.Store.Resource['id'],
    ) => {
      const store = getStore();
      const nextStore = permissions.utils.store.removePermission(store, type, clientId, resourceId);
      saveStore(nextStore);
    },
    [getStore, saveStore],
  );

  const removeAllClientPermissions = useCallback(
    (clientId: Permissions.Store.Client['id']) => {
      const store = getStore();
      const nextStore = permissions.utils.store.removeAllClientPermissions(store, clientId);
      saveStore(nextStore);
    },
    [getStore, saveStore],
  );

  const removeClient = useCallback(
    (clientId: Permissions.Store.Client['id']) => {
      const store = getStore();
      const nextStore = permissions.utils.store.removeClient(store, clientId);
      saveStore(nextStore);
    },
    [getStore, saveStore],
  );

  const removeAllClients = useCallback(() => {
    const store = getStore();
    const nextStore = permissions.utils.store.removeAllClients(store);
    saveStore(nextStore);
  }, [getStore, saveStore]);

  // On purpose, this object needs to be a new object on every render so
  // dependant components render each time the store is updated.
  //
  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const contextValue = {
    getClient,
    getClients,
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
  };

  if (!isStoreInitializationComplete) return null;

  return (
    <PermissionsUtilsContext.Provider value={contextValue}>
      {children}
    </PermissionsUtilsContext.Provider>
  );
}

export const usePermissions = () => {
  const context = useContext(PermissionsUtilsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

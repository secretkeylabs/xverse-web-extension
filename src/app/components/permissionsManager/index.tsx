import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Client, Permission, Resource } from './schemas';
import { TContext } from './types';
import * as utils from './utils';

const PermissionsContext = createContext<TContext | undefined>(undefined);

export function PermissionsProvider(props: { children: React.ReactNode }) {
  const { children } = props;

  const [hasLoadedPermissions, setHasLoadedPermissions] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    utils.permissionsStoreMutex.runExclusive(async () => {
      const [e, store] = await utils.getPermissionsStore();

      if (e) {
        setError(e);
        return;
      }

      if (!store) {
        const newStore = utils.makePermissionsStoreV1();
        await utils.savePermissionsStore(newStore);
        setError(null);
        setHasLoadedPermissions(true);
        return;
      }

      setError(null);
      setHasLoadedPermissions(true);
    });
  }, []);

  // Queries

  const getClientPermissions = useCallback(async (clientId: Client['id']) => {
    const [e, store] = await utils.getPermissionsStore();

    if (e) {
      setError(e);
      return [];
    }

    if (!store) {
      setError(new Error('Expected `store` to be defined to get client permissions.'));
      return [];
    }

    return utils.getClientPermissions(store.permissions, clientId);
  }, []);
  const getClientPermission = useCallback(
    async (clientId: Client['id'], resourceId: Resource['id']) => {
      // if (!permissionStoreRef.current) return;

      const [e, store] = await utils.getPermissionsStore();

      if (e) {
        setError(e);
        return;
      }

      if (!store) {
        setError(new Error('Expected `store` to be defined to get client permission.'));
        return;
      }

      return utils.getClientPermission(store.permissions, clientId, resourceId);
    },
    [],
  );
  const getPermissionsStore = useCallback(async () => {
    const [e, store] = await utils.getPermissionsStore();

    if (e) {
      setError(e);
      return null;
    }

    return store;
  }, []);
  const getResource = useCallback(async (resourceId: Resource['id']) => {
    const [e, store] = await utils.getPermissionsStore();

    if (e) {
      setError(e);
      return;
    }

    if (!store) {
      setError(new Error('Expected `store` to be defined to get resource.'));
      return;
    }

    return utils.getResource(store.resources, resourceId);
  }, []);

  // Mutations

  const addClient = useCallback(async (client: Client) => {
    utils.permissionsStoreMutex.runExclusive(async () => {
      const [e, store] = await utils.getPermissionsStore();

      if (e) {
        setError(e);
        return;
      }

      if (!store) {
        setError(new Error('Expected `store` to be defined to add client.'));
        return;
      }

      utils.addClient(store.clients, client);
      await utils.savePermissionsStore(store);
    });
  }, []);
  const addResource = useCallback(async (resource: Resource) => {
    utils.permissionsStoreMutex.runExclusive(async () => {
      const [e, store] = await utils.getPermissionsStore();

      if (e) {
        setError(e);
        return;
      }

      if (!store) {
        setError(new Error('Expected `store` to be defined to add resource.'));
        return;
      }

      utils.addResource(store.resources, resource);
      await utils.savePermissionsStore(store);
    });
  }, []);
  const removeResource = useCallback(async (resourceId: Resource['id']) => {
    utils.permissionsStoreMutex.runExclusive(async () => {
      const [e, store] = await utils.getPermissionsStore();

      if (e) {
        setError(e);
        return;
      }

      if (!store) {
        setError(new Error('Expected `store` to be defined to remove resource.'));
        return;
      }

      utils.removeResource(store.resources, resourceId);
      await utils.savePermissionsStore(store);
    });
  }, []);
  const setPermission = useCallback(async (permission: Permission) => {
    utils.permissionsStoreMutex.runExclusive(async () => {
      const [e, store] = await utils.getPermissionsStore();

      if (e) {
        setError(e);
        return;
      }

      if (!store) {
        setError(new Error('Expected `store` to be defined to set permission.'));
        return;
      }

      utils.setPermission(store.clients, store.resources, store.permissions, permission);
      await utils.savePermissionsStore(store);
    });
  }, []);
  const removePermission = useCallback(
    async (clientId: Client['id'], resourceId: Resource['id']) => {
      utils.permissionsStoreMutex.runExclusive(async () => {
        const [e, store] = await utils.getPermissionsStore();

        if (e) {
          setError(e);
          return;
        }

        if (!store) {
          setError(new Error('Expected `store` to be defined to remove permission.'));
          return;
        }

        utils.removePermission(store.permissions, clientId, resourceId);
        await utils.savePermissionsStore(store);
      });
    },
    [],
  );
  const removeAllClientPermissions = useCallback(async (clientId: Client['id']) => {
    utils.permissionsStoreMutex.runExclusive(async () => {
      const [e, store] = await utils.getPermissionsStore();

      if (e) {
        setError(e);
        return;
      }

      if (!store) {
        setError(new Error('Expected `store` to be defined to remove all client permissions.'));
        return;
      }

      utils.removeAllClientPermissions(store.permissions, clientId);
      await utils.savePermissionsStore(store);
    });
  }, []);
  const removeClient = useCallback(async (clientId: Client['id']) => {
    utils.permissionsStoreMutex.runExclusive(async () => {
      const [e, store] = await utils.getPermissionsStore();

      if (e) {
        setError(e);
        return;
      }

      if (!store) {
        setError(new Error('Expected `store` to be defined to remove client.'));
        return;
      }

      utils.removeClient(store.clients, store.permissions, clientId);
      await utils.savePermissionsStore(store);
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      addClient,
      addResource,
      removeResource,
      setPermission,
      removePermission,
      removeAllClientPermissions,
      getClientPermissions,
      getClientPermission,
      removeClient,
      getPermissionsStore,
      getResource,
      hasLoadedPermissions,
      error,
    }),
    [
      addClient,
      addResource,
      removeResource,
      setPermission,
      removePermission,
      removeAllClientPermissions,
      getClientPermissions,
      getClientPermission,
      removeClient,
      getPermissionsStore,
      getResource,
      hasLoadedPermissions,
      error,
    ],
  );

  return <PermissionsContext.Provider value={contextValue}>{children}</PermissionsContext.Provider>;
}

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

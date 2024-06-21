/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import { safePromise } from '@common/utils/safe';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { parse, stringify } from 'superjson';
import * as v from 'valibot';
import { permissionsPersistantStoreKeyName } from './constants';
import {
  Client,
  Permission,
  PermissionsStoreV1,
  Resource,
  permissionsStoreV1Schema,
} from './schemas';
import * as utils from './utils';

type TContext = {
  addClient: (client: Client) => Promise<void>;
  addResource: (resource: Resource) => Promise<void>;
  removeResource: (resourceId: Resource['id']) => Promise<void>;
  getResource: (resourceId: Resource['id']) => Resource | undefined;
  setPermission: (permission: Permission) => Promise<void>;
  removePermission: (clientId: Client['id'], resourceId: Resource['id']) => Promise<void>;
  removeAllClientPermissions: (clientId: Client['id']) => Promise<void>;
  getClientPermissions: (clientId: Client['id']) => Permission[];
  getClientPermission: (
    clientId: Client['id'],
    resourceId: Resource['id'],
  ) => Permission | undefined;
  removeClient: (clientId: Client['id']) => void;
  getPermissionsStore: () => PermissionsStoreV1 | null;
  hasLoadedPermissions: boolean;
  error: unknown | null;
};
const PermissionsContext = createContext<TContext | undefined>(undefined);

export function PermissionsProvider(props: { children: React.ReactNode }) {
  const { children } = props;

  const permissionStoreRef = useRef<PermissionsStoreV1 | null>(null);
  const [hasLoadedPermissions, setHasLoadedPermissions] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const savePermissions = useCallback(() => {
    console.log('[ARY]: Inside savePermissions');
    if (!permissionStoreRef.current) return;

    console.log('[ARY]: Saving permission');

    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify(JSON.parse(stringify(permissionStoreRef.current)), null, 2));
    }

    return chrome.storage.local.set({
      [permissionsPersistantStoreKeyName]: stringify(permissionStoreRef.current),
    });
  }, []);

  useEffect(() => {
    let isCurrent = true;

    (async () => {
      const [e, getResult] = await safePromise(
        chrome.storage.local.get(permissionsPersistantStoreKeyName),
      );

      if (!isCurrent) return;

      if (e) {
        setError(e);
        return;
      }

      // TODO: initialize permissions store if it doesn't exist
      console.log('[ARY]: data', getResult);

      const persistedData = getResult[permissionsPersistantStoreKeyName];
      const hydrated = persistedData ? parse(persistedData) : utils.makePermissionsStoreV1();
      const parseResult = v.safeParse(permissionsStoreV1Schema, hydrated);
      if (!parseResult.success) {
        setError(parseResult.issues);
        return;
      }
      permissionStoreRef.current = parseResult.output;

      if (process.env.NODE_ENV === 'development') {
        console.log(JSON.stringify(JSON.parse(stringify(permissionStoreRef.current)), null, 2));
      }

      await savePermissions();

      if (!isCurrent) {
        return;
      }

      setError(null);
      setHasLoadedPermissions(true);
    })();

    return () => {
      isCurrent = false;
    };
  }, [savePermissions]);

  const addClient = useCallback(
    async (client: Client) => {
      if (!permissionStoreRef.current) return;

      const store = permissionStoreRef.current;
      utils.addClient(store.clients, client);

      await savePermissions();
    },
    [savePermissions],
  );

  const addResource = useCallback(
    async (resource: Resource) => {
      if (!permissionStoreRef.current) return;

      const store = permissionStoreRef.current;
      utils.addResource(store.resources, resource);

      await savePermissions();
    },
    [savePermissions],
  );

  const removeResource = useCallback(
    async (resourceId: Resource['id']) => {
      if (!permissionStoreRef.current) return;

      const store = permissionStoreRef.current;
      utils.removeResource(store.resources, resourceId);

      await savePermissions();
    },
    [savePermissions],
  );

  const setPermission = useCallback(
    async (permission: Permission) => {
      if (!permissionStoreRef.current) return;

      const store = permissionStoreRef.current;
      utils.setPermission(store.clients, store.resources, store.permissions, permission);

      await savePermissions();
    },
    [savePermissions],
  );

  const removePermission = useCallback(
    async (clientId: Client['id'], resourceId: Resource['id']) => {
      if (!permissionStoreRef.current) return;

      const store = permissionStoreRef.current;
      utils.removePermission(store.permissions, clientId, resourceId);

      await savePermissions();
    },
    [savePermissions],
  );

  const removeAllClientPermissions = useCallback(
    async (clientId: Client['id']) => {
      if (!permissionStoreRef.current) return;

      const store = permissionStoreRef.current;
      utils.removeAllClientPermissions(store.permissions, clientId);

      await savePermissions();
    },
    [savePermissions],
  );

  const getClientPermissions = useCallback((clientId: Client['id']) => {
    if (!permissionStoreRef.current) return [];

    const store = permissionStoreRef.current;
    return utils.getClientPermissions(store.permissions, clientId);
  }, []);

  const getClientPermission = useCallback((clientId: Client['id'], resourceId: Resource['id']) => {
    if (!permissionStoreRef.current) return;

    const store = permissionStoreRef.current;
    return utils.getClientPermission(store.permissions, clientId, resourceId);
  }, []);

  const getPermissionsStore = useCallback(() => permissionStoreRef.current, []);

  const removeClient = useCallback(
    async (clientId: Client['id']) => {
      if (!permissionStoreRef.current) return;

      const store = permissionStoreRef.current;
      utils.removeClient(store.clients, store.permissions, clientId);

      await savePermissions();
    },
    [savePermissions],
  );

  const getResource = useCallback(
    (resourceId: Resource['id']) => {
      if (!permissionStoreRef.current) return;

      const store = permissionStoreRef.current;
      return utils.getResource(store.resources, resourceId);
    },
    [permissionStoreRef],
  );

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

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
import { ClientId, Group, PermissionsStoreV1, Resource, permissionsStoreV1Schema } from './schemas';

export const permissionsPersistantStoreKeyName = 'client-permissions';

type TContext = {
  addClientToGroup: (clientId: ClientId, group: Group) => Promise<void>;
  removeClientFromGroup: (clientId: ClientId, group: Group) => Promise<void>;
  clearClientGroups: (clientId: ClientId) => Promise<void>;
  clearAllGroups: () => Promise<void>;
  hasAccessToResource: (clientId: ClientId, resource: Resource) => boolean;
  hasLoadedPermissions: boolean;
  error: unknown | null;
};
const PermissionsContext = createContext<TContext | undefined>(undefined);

export function PermissionsProvider(props: { children: React.ReactNode }) {
  const { children } = props;

  const permissionStoreRef = useRef<PermissionsStoreV1 | null>(null);
  const [hasLoadedPermissions, setHasLoadedPermissions] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    let isCurrent = true;

    (async () => {
      const [e, data] = await safePromise(
        chrome.storage.local.get(permissionsPersistantStoreKeyName),
      );

      if (!isCurrent) return;

      if (e) {
        setError(e);
        return;
      }

      const hydrated = parse(data[permissionsPersistantStoreKeyName]);
      const parseResult = v.safeParse(permissionsStoreV1Schema, hydrated);
      if (!parseResult.success) {
        setError(parseResult.issues);
        return;
      }

      setError(null);
      permissionStoreRef.current = parseResult.output;
      setHasLoadedPermissions(true);
    })();

    return () => {
      isCurrent = false;
    };
  }, []);

  const addClientToGroup = useCallback(async (clientId: ClientId, group: Group) => {
    if (!permissionStoreRef.current) return;

    const clientPermissions = permissionStoreRef.current.permissions.get(clientId);
    if (!clientPermissions) {
      permissionStoreRef.current.permissions.set(clientId, {
        groups: new Set([group]),
      });
    } else {
      clientPermissions.groups.add(group);
    }

    const [e] = await safePromise(
      chrome.storage.local.set({
        [permissionsPersistantStoreKeyName]: stringify(permissionStoreRef.current),
      }),
    );

    if (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to save permissions');
      // eslint-disable-next-line no-console
      console.error(e);
      setError(e);
    }
  }, []);

  const removeClientFromGroup = useCallback(async (clientId: ClientId, group: Group) => {
    if (!permissionStoreRef.current) return;

    const clientPermissions = permissionStoreRef.current.permissions.get(clientId);
    if (!clientPermissions) return;

    clientPermissions.groups.delete(group);

    const [e] = await safePromise(
      chrome.storage.local.set({
        [permissionsPersistantStoreKeyName]: stringify(permissionStoreRef.current),
      }),
    );

    if (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to save permissions');
      // eslint-disable-next-line no-console
      console.error(e);
      setError(e);
    }
  }, []);

  const clearClientGroups = useCallback(async (clientId: ClientId) => {
    if (!permissionStoreRef.current) return;

    permissionStoreRef.current.permissions.delete(clientId);

    const [e] = await safePromise(
      chrome.storage.local.set({
        [permissionsPersistantStoreKeyName]: stringify(permissionStoreRef.current),
      }),
    );

    if (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to save permissions');
      // eslint-disable-next-line no-console
      console.error(e);
      setError(e);
    }
  }, []);

  const clearAllGroups = useCallback(async () => {
    permissionStoreRef.current = null;

    const [e] = await safePromise(chrome.storage.local.remove(permissionsPersistantStoreKeyName));

    if (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to save permissions');
      // eslint-disable-next-line no-console
      console.error(e);
      setError(e);
    }
  }, []);

  const hasAccessToResource = useCallback((clientId: ClientId, resource: Resource) => {
    if (!permissionStoreRef.current) return false;

    const clientPermissions = permissionStoreRef.current.permissions.get(clientId);
    if (!clientPermissions) return false;

    for (const group of clientPermissions.groups) {
      const roles = groupToRoleMap.get(group);
      if (!roles) continue;

      for (const role of roles) {
        const resources = roleToResourceMap.get(role);
        if (!resources) continue;

        if (resources.has(resource)) return true;
      }
    }

    return false;
  }, []);

  const contextValue = useMemo(
    () => ({
      addClientToGroup,
      removeClientFromGroup,
      clearClientGroups,
      clearAllGroups,
      hasAccessToResource,
      hasLoadedPermissions,
      error,
    }),
    [
      addClientToGroup,
      clearAllGroups,
      clearClientGroups,
      error,
      hasAccessToResource,
      hasLoadedPermissions,
      removeClientFromGroup,
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

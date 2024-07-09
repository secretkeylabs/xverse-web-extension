import { Result, safePromise } from '@common/utils/safe';
import storage from '@utils/chromeStorage';
import { Mutex } from 'async-mutex';
import { parse, stringify } from 'superjson';
import * as v from 'valibot';
import { permissionsPersistantStoreKeyName } from './constants';
import {
  Client,
  ClientsTable,
  Permission,
  PermissionsStoreV1,
  PermissionsTable,
  Resource,
  ResourcesTable,
  permissionsStoreV1Schema,
} from './schemas';

// Queries

export function getResource(resources: ResourcesTable, resourceId: Resource['id']) {
  return [...resources].find((r) => r.id === resourceId);
}
export function getClientPermissions(permissions: PermissionsTable, clientId: Client['id']) {
  return [...permissions].filter((p) => p.clientId === clientId);
}
export function getClientPermission(
  permissions: PermissionsTable,
  clientId: Client['id'],
  resourceId: Resource['id'],
) {
  return [...permissions].find((p) => p.clientId === clientId && p.resourceId === resourceId);
}
export async function loadPermissionsStore(): Promise<Result<PermissionsStoreV1 | null>> {
  const [error, persistedData] = await safePromise(
    storage.local.getItem(permissionsPersistantStoreKeyName),
  );

  if (error) {
    return [error, null];
  }

  if (!persistedData) {
    return [null, null];
  }

  const hydrated = parse(persistedData);
  const parseResult = v.safeParse(permissionsStoreV1Schema, hydrated);
  if (!parseResult.success) {
    return [new Error('Failed to parse permissions store.', { cause: parseResult.issues }), null];
  }

  return [null, parseResult.output];
}

// Mutations

export function addClient(clients: ClientsTable, client: Client) {
  if (![...clients].some((c) => c.id === client.id)) {
    clients.add(client);
  }
}
export function removeAllClientPermissions(permissions: PermissionsTable, clientId: Client['id']) {
  const clientPermissions = [...permissions].filter((p) => p.clientId === clientId);
  clientPermissions.forEach((p) => permissions.delete(p));
}
export function removeClient(
  clients: ClientsTable,
  permissions: PermissionsTable,
  clientId: Client['id'],
) {
  removeAllClientPermissions(permissions, clientId);

  const client = [...clients].find((c) => c.id === clientId);
  if (client) {
    clients.delete(client);
  }
}
export function addResource(resources: ResourcesTable, resource: Resource) {
  if (![...resources].some((r) => r.id === resource.id)) {
    resources.add(resource);
  }
}
export function removeResource(resources: ResourcesTable, resourceId: Resource['id']) {
  const resource = [...resources].find((r) => r.id === resourceId);
  if (resource) {
    resources.delete(resource);
  }
}
export function setPermission(
  clients: ClientsTable,
  resources: ResourcesTable,
  permissions: PermissionsTable,
  permission: Permission,
) {
  // Ensure both the client and resource exist
  const clientExists = [...clients].some((c) => c.id === permission.clientId);
  const resourceExists = [...resources].some((r) => r.id === permission.resourceId);
  if (!clientExists || !resourceExists) {
    return;
  }

  const existingPermission = [...permissions].find(
    (p) => p.clientId === permission.clientId && p.resourceId === permission.resourceId,
  );

  if (existingPermission) {
    existingPermission.actions = permission.actions;
    return;
  }

  permissions.add(permission);
}
export function removePermission(
  permissions: PermissionsTable,
  clientId: Client['id'],
  resourceId: Resource['id'],
) {
  const permission = [...permissions].find(
    (p) => p.clientId === clientId && p.resourceId === resourceId,
  );
  if (permission) {
    permissions.delete(permission);
  }
}
export function savePermissionsStore(permissionsStore: PermissionsStoreV1) {
  return chrome.storage.local.set({
    [permissionsPersistantStoreKeyName]: stringify(permissionsStore),
  });
}

// Helpers

function makeClientsTable() {
  return new Set<Client>();
}
function makeResourcesTable() {
  return new Set<Resource>();
}
function makePermissionsTable() {
  return new Set<Permission>();
}
export function makePermissionsStoreV1(): PermissionsStoreV1 {
  return {
    version: 1,
    clients: makeClientsTable(),
    resources: makeResourcesTable(),
    permissions: makePermissionsTable(),
  };
}
export const permissionsStoreMutex = new Mutex();

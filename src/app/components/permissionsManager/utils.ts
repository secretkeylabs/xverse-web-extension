import { error, safePromise, success, type Result, type SafeError } from '@common/utils/safe';
import storage from '@utils/chromeStorage';
import { Mutex } from 'async-mutex';
import { parse, stringify } from 'superjson';
import * as v from 'valibot';
import { permissionsPersistantStoreKeyName } from './constants';
import {
  permissionsStoreSchema,
  type Client,
  type ClientMetadata,
  type ClientMetadataTable,
  type ClientsTable,
  type Permission,
  type PermissionsStore,
  type PermissionsTable,
  type Resource,
  type ResourcesTable,
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
export async function getPermissionsStore(): Promise<
  Result<PermissionsStore, SafeError<'StorageRetrievalError' | 'StoreNotFoundError' | 'ParseError'>>
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
  const parseResult = v.safeParse(permissionsStoreSchema, hydrated);
  if (!parseResult.success) {
    return error({
      name: 'ParseError',
      message: 'Failed to parse permissions store.',
      data: parseResult.issues,
    });
  }

  return success(parseResult.output);
}

/**
 * Get a client by its ID.
 * @public
 */
export async function getClient(permissionStore: PermissionsStore, clientId: Client['id']) {
  return [...permissionStore.clients].find((c) => c.id === clientId);
}

/**
 * Get a client Metadata by its ID.
 * @public
 */
export function getClientMetadata(
  permissionStore: PermissionsStore,
  clientId: Client['id'],
): ClientMetadata {
  const metadata = [...permissionStore.clientMetadata].find((c) => c.clientId === clientId);
  // If the metadata doesn't exist, create it
  if (!metadata) {
    permissionStore.clientMetadata.add({ clientId });
    return { clientId };
  }
  return metadata;
}

// Mutations

export function addClient(permissionStore: PermissionsStore, client: Client) {
  if (![...permissionStore.clients].some((c) => c.id === client.id)) {
    permissionStore.clients.add(client);
    permissionStore.clientMetadata.add({ clientId: client.id, lastUsed: new Date().getTime() });
  }
}

export function updateClientMetadata(
  permissionStore: PermissionsStore,
  clientId: Client['id'],
  updatedData: Partial<ClientMetadata>,
) {
  const updatedMetadata = Array.from(permissionStore.clientMetadata).map((item) =>
    item.clientId === clientId ? { ...item, ...updatedData } : item,
  );
  permissionStore.clientMetadata = new Set(updatedMetadata);
}

export function removeAllClientPermissions(permissions: PermissionsTable, clientId: Client['id']) {
  const clientPermissions = [...permissions].filter((p) => p.clientId === clientId);
  clientPermissions.forEach((p) => permissions.delete(p));
}

function removeClientMetadata(clientMetadata: ClientMetadataTable, clientId: Client['id']) {
  const metadata = [...clientMetadata].find((p) => p.clientId === clientId);
  if (metadata) {
    clientMetadata.delete(metadata);
  }
}

export function removeClient(permissionStore: PermissionsStore, clientId: Client['id']) {
  removeAllClientPermissions(permissionStore.permissions, clientId);
  removeClientMetadata(permissionStore.clientMetadata, clientId);
  const client = [...permissionStore.clients].find((c) => c.id === clientId);
  if (client) {
    permissionStore.clients.delete(client);
  }
}

export function removeAllClients(permissionStore: PermissionsStore) {
  permissionStore.clients.clear();
  permissionStore.clientMetadata.clear();
  permissionStore.permissions.clear();
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
export function savePermissionsStore(permissionsStore: PermissionsStore) {
  return chrome.storage.local.set({
    [permissionsPersistantStoreKeyName]: stringify(permissionsStore),
  });
}

// Helpers

function makeClientsTable() {
  return new Set<Client>();
}
function makeClientsMetadataTable() {
  return new Set<ClientMetadata>();
}
function makeResourcesTable() {
  return new Set<Resource>();
}
function makePermissionsTable() {
  return new Set<Permission>();
}
function makePermissionsStore(): PermissionsStore {
  return {
    version: 3,
    clients: makeClientsTable(),
    clientMetadata: makeClientsMetadataTable(),
    resources: makeResourcesTable(),
    permissions: makePermissionsTable(),
  };
}

/**
 * Loads the permissions store, and creates or migrates it to the latest version
 * if necessary. Since this operation may result in the store being mutated, it
 * should be called within a mutex.
 */
export async function initPermissionsStore(): Promise<Result<PermissionsStore>> {
  const [getStoreError, store] = await getPermissionsStore();

  if (getStoreError) {
    if (getStoreError.name === 'ParseError') {
      // The store is outdated and needs to be migrated. For now, the store is
      // migrated by creating a new store using the current schema and
      // overwriting the previous one. As the store becomes more complex, a more
      // comprehensive migration may be required.
      const newStore = makePermissionsStore();
      await savePermissionsStore(newStore);
      return success(newStore);
    }

    if (getStoreError.name === 'StoreNotFoundError') {
      // The store doesn't exist yet, so we create a new one.
      const newStore = makePermissionsStore();
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

import {
  Client,
  ClientsTable,
  Permission,
  PermissionsStoreV1,
  PermissionsTable,
  Resource,
  ResourcesTable,
} from './schemas';

export function makeClientsTable() {
  return new Set<Client>();
}
export function addClient(clients: ClientsTable, client: Client) {
  if (![...clients].some((c) => c.id === client.id)) {
    clients.add(client);
  }
}

export function makeResourcesTable() {
  return new Set<Resource>();
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

export function makePermissionsTable() {
  return new Set<Permission>();
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
export function removeAllClientPermissions(permissions: PermissionsTable, clientId: Client['id']) {
  const clientPermissions = [...permissions].filter((p) => p.clientId === clientId);
  clientPermissions.forEach((p) => permissions.delete(p));
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

export function makePermissionsStoreV1(): PermissionsStoreV1 {
  return {
    version: 1,
    clients: makeClientsTable(),
    resources: makeResourcesTable(),
    permissions: makePermissionsTable(),
  };
}

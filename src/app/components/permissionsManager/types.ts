import { type Permissions } from '@secretkeylabs/xverse-core';

type Resource = Permissions.Store.Resource;
type Client = Permissions.Store.Client;
type Permission = Permissions.Store.Permission;

export type TPermissionsUtilsContext = {
  // Queries
  getClient: (clientId: Client['id']) => Client | undefined;
  getClients: () => Client[];
  getResource: (resourceId: Resource['id']) => Resource | undefined;
  getClientPermissions: (clientId: Client['id']) => Permission[];
  getClientMetadata: (clientId: Client['id']) => Permissions.Store.ClientMetadata | undefined;
  getClientPermission: (
    type: Permissions.Store.Permission['type'],
    clientId: Client['id'],
    resourceId: Resource['id'],
  ) => Permission | undefined;

  // Mutations
  addClient: (client: Client) => void;
  removeClient: (clientId: Client['id']) => void;
  addResource: (resource: Resource) => void;
  removeResource: (resourceId: Resource['id']) => void;
  setPermission: (permission: Permission) => void;
  removePermission: (
    type: Permission['type'],
    clientId: Client['id'],
    resourceId: Resource['id'],
  ) => void;
  removeAllClientPermissions: (clientId: Client['id']) => void;
  removeAllClients: () => void;
};

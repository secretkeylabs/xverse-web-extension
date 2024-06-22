import { Client, Permission, PermissionsStoreV1, Resource } from './schemas';

export type TContext = {
  // Queries
  getResource: (resourceId: Resource['id']) => Promise<Resource | undefined>;
  getClientPermissions: (clientId: Client['id']) => Promise<Permission[]>;
  getClientPermission: (
    clientId: Client['id'],
    resourceId: Resource['id'],
  ) => Promise<Permission | undefined>;
  getPermissionsStore: () => Promise<PermissionsStoreV1 | null>;

  // Mutations
  addClient: (client: Client) => Promise<void>;
  removeClient: (clientId: Client['id']) => Promise<void>;
  addResource: (resource: Resource) => Promise<void>;
  removeResource: (resourceId: Resource['id']) => Promise<void>;
  setPermission: (permission: Permission) => Promise<void>;
  removePermission: (clientId: Client['id'], resourceId: Resource['id']) => Promise<void>;
  removeAllClientPermissions: (clientId: Client['id']) => Promise<void>;

  // Vars
  hasLoadedPermissions: boolean;
  error: unknown | null;
};

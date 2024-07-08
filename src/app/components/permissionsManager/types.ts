import { Client, Permission, PermissionsStoreV1, Resource } from './schemas';

export type TPermissionsStoreContext<TError = unknown> =
  | {
      isLoading: true;
      error: undefined;
      store: undefined;
    }
  | { isLoading: false; error: TError; store: undefined }
  | { isLoading: false; error: undefined; store: PermissionsStoreV1 };

export type TPermissionsUtilsContext = {
  // Queries
  getResource: (resourceId: Resource['id']) => Promise<Resource | undefined>;
  getClientPermissions: (clientId: Client['id']) => Promise<Permission[]>;
  getClientPermission: (
    clientId: Client['id'],
    resourceId: Resource['id'],
  ) => Promise<Permission | undefined>;

  // Mutations
  addClient: (client: Client) => Promise<void>;
  removeClient: (clientId: Client['id']) => Promise<void>;
  addResource: (resource: Resource) => Promise<void>;
  removeResource: (resourceId: Resource['id']) => Promise<void>;
  setPermission: (permission: Permission) => Promise<void>;
  removePermission: (clientId: Client['id'], resourceId: Resource['id']) => Promise<void>;
  removeAllClientPermissions: (clientId: Client['id']) => Promise<void>;
};

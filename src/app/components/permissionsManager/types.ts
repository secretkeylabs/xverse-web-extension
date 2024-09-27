import type { Client, ClientMetadata, Permission, PermissionsStore, Resource } from './schemas';

export type TPermissionsStoreContext<TError = unknown> =
  | {
      isLoading: true;
      error: undefined;
      store: undefined;
    }
  | { isLoading: false; error: TError; store: undefined }
  | { isLoading: false; error: undefined; store: PermissionsStore };

export type TPermissionsUtilsContext = {
  // Queries
  getResource: (resourceId: Resource['id']) => Resource | undefined;
  getClientPermissions: (clientId: Client['id']) => Permission[];
  getClientMetadata: (clientId: Client['id']) => ClientMetadata | undefined;
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
  removeAllClients: () => Promise<void>;
};

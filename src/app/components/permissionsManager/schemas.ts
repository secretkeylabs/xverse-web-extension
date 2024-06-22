import * as v from 'valibot';

// Clients
export const clientSchema = v.object({
  id: v.string(),
  name: v.optional(v.string()),
});
export type Client = v.InferOutput<typeof clientSchema>;
export const clientsTableSchema = v.set(clientSchema);
export type ClientsTable = v.InferOutput<typeof clientsTableSchema>;

// Resources
export const resourceSchema = v.object({
  id: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
});
export type Resource = v.InferOutput<typeof resourceSchema>;
export const resourcesTableSchema = v.set(resourceSchema);
export type ResourcesTable = v.InferOutput<typeof resourcesTableSchema>;

// Actions
export const actionSchema = v.picklist(['create', 'read', 'update', 'delete']);
export type Action = v.InferOutput<typeof actionSchema>;

// Permissions
export const permissionSchema = v.object({
  clientId: clientSchema.entries.id,
  resourceId: resourceSchema.entries.id,
  actions: v.set(actionSchema),
});
export type Permission = v.InferOutput<typeof permissionSchema>;
export const permissionsTableSchema = v.set(permissionSchema);
export type PermissionsTable = v.InferOutput<typeof permissionsTableSchema>;

// Permissions Store
export const permissionsStoreV1Schema = v.object({
  version: v.literal(1),
  clients: clientsTableSchema,
  resources: resourcesTableSchema,
  permissions: permissionsTableSchema,
});
export type PermissionsStoreV1 = v.InferOutput<typeof permissionsStoreV1Schema>;

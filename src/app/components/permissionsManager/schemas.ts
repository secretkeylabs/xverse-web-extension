import * as v from 'valibot';

// Clients

/**
 * @public
 */
export const clientSchema = v.object({
  id: v.string(),
  name: v.string(),
  origin: v.string(),
});

/**
 * @public
 */
export type Client = v.InferOutput<typeof clientSchema>;

/**
 * @public
 */
export const clientsTableSchema = v.set(clientSchema);

/**
 * @public
 */
export type ClientsTable = v.InferOutput<typeof clientsTableSchema>;

// Resources

/**
 * @public
 */
export const resourceSchema = v.object({
  id: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
});

/**
 * @public
 */
export type Resource = v.InferOutput<typeof resourceSchema>;

/**
 * @public
 */
export const resourcesTableSchema = v.set(resourceSchema);

/**
 * @public
 */
export type ResourcesTable = v.InferOutput<typeof resourcesTableSchema>;

// Actions

/**
 * @public
 */
export const actionSchema = v.picklist(['create', 'read', 'update', 'delete']);

/**
 * @public
 */
export type Action = v.InferOutput<typeof actionSchema>;

// Permissions

/**
 * @public
 */
export const permissionSchema = v.object({
  clientId: clientSchema.entries.id,
  resourceId: resourceSchema.entries.id,
  actions: v.set(actionSchema),
});

/**
 * @public
 */
export type Permission = v.InferOutput<typeof permissionSchema>;

/**
 * @public
 */
export const permissionsTableSchema = v.set(permissionSchema);

/**
 * @public
 */
export type PermissionsTable = v.InferOutput<typeof permissionsTableSchema>;

// Permissions Store

/**
 * @public
 */
export const permissionsStoreSchema = v.object({
  version: v.literal(2),
  clients: clientsTableSchema,
  resources: resourcesTableSchema,
  permissions: permissionsTableSchema,
});

/**
 * @public
 */
export type PermissionsStoreV1 = v.InferOutput<typeof permissionsStoreSchema>;

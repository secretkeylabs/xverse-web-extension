import * as v from 'valibot';

const permissionsSchema = v.picklist(['create', 'read', 'update', 'delete']);
export type Permission = v.InferOutput<typeof permissionsSchema>;

export const resourceSchema = v.object({
  id: v.string(),
  title: v.string(),
  description: v.string(),
});
export type Resource = v.InferOutput<typeof resourceSchema>;

// export const resourceInfo: Record<Resource, { title: string; description: string }> = {
//   default: {
//     title: 'Connect to wallet.',
//     description:
//       'Allows access to your addresses and balances. It does NOT allow performing actions on your behalf or spending your funds.',
//   },
// };

export const roleSchema = v.object({
  name: v.string(),
  permissions: v.map(resourceSchema.entries.id, v.set(permissionsSchema)),
});
export type Role = v.InferOutput<typeof roleSchema>;

export const groupSchema = v.picklist(['default']);
export type Group = v.InferOutput<typeof groupSchema>;

export const clientPermissionsSchema = v.object({
  groups: v.set(groupSchema),
});

export const clientIdSchema = v.string();
export type ClientId = v.InferOutput<typeof clientIdSchema>;

export const permissionsStoreV1Schema = v.object({
  version: v.literal('1'),
  permissions: v.map(clientIdSchema, clientPermissionsSchema),
});
export type PermissionsStoreV1 = v.InferOutput<typeof permissionsStoreV1Schema>;

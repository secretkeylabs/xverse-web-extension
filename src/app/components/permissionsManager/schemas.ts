import * as v from 'valibot';

export const resourceSchema = v.picklist(['default']);
export type Resource = v.InferOutput<typeof resourceSchema>;

export const roleSchema = v.picklist(['default']);
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

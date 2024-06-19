import { Group, Resource, Role } from './schemas';

export const roleToResourceMap = new Map<Role, Set<Resource>>();
roleToResourceMap.set('default', new Set(['default']));

export const groupToRoleMap = new Map<Group, Set<Role>>();
groupToRoleMap.set('default', new Set(['default']));

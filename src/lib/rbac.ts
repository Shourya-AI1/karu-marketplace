import type { Role } from '@prisma/client';

/**
 * Role-Based Access Control.
 * Hierarchical permission system with least-privilege defaults.
 */

export const ROLE_HIERARCHY: Record<Role, number> = {
  GUEST: 0,
  BUYER: 10,
  SELLER: 20,
  BUSINESS_SELLER: 25,
  SUPPORT: 30,
  MODERATOR: 40,
  ADMIN: 50,
  SUPER_ADMIN: 100,
};

export type Permission =
  | 'product:create'
  | 'product:edit:own'
  | 'product:edit:any'
  | 'product:delete:any'
  | 'order:view:own'
  | 'order:view:any'
  | 'order:manage:own'
  | 'store:create'
  | 'store:manage:own'
  | 'review:create'
  | 'review:moderate'
  | 'user:moderate'
  | 'kyc:review'
  | 'support:handle'
  | 'audit:view'
  | 'campaign:manage'
  | 'admin:access'
  | 'superadmin:access';

const PERMISSIONS: Record<Role, Permission[]> = {
  GUEST: [],
  BUYER: ['order:view:own', 'review:create'],
  SELLER: [
    'order:view:own',
    'review:create',
    'product:create',
    'product:edit:own',
    'store:create',
    'store:manage:own',
    'order:manage:own',
  ],
  BUSINESS_SELLER: [
    'order:view:own',
    'review:create',
    'product:create',
    'product:edit:own',
    'store:create',
    'store:manage:own',
    'order:manage:own',
  ],
  SUPPORT: ['order:view:any', 'support:handle', 'review:create'],
  MODERATOR: [
    'order:view:any',
    'support:handle',
    'review:moderate',
    'product:edit:any',
    'user:moderate',
    'kyc:review',
  ],
  ADMIN: [
    'order:view:any',
    'support:handle',
    'review:moderate',
    'product:edit:any',
    'product:delete:any',
    'user:moderate',
    'kyc:review',
    'audit:view',
    'campaign:manage',
    'admin:access',
  ],
  SUPER_ADMIN: [
    'order:view:any',
    'support:handle',
    'review:moderate',
    'product:edit:any',
    'product:delete:any',
    'user:moderate',
    'kyc:review',
    'audit:view',
    'campaign:manage',
    'admin:access',
    'superadmin:access',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}

export function atLeast(role: Role, minimum: Role): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimum];
}

export function isSeller(role: Role): boolean {
  return role === 'SELLER' || role === 'BUSINESS_SELLER';
}

export function isStaff(role: Role): boolean {
  return atLeast(role, 'SUPPORT');
}

export function isAdmin(role: Role): boolean {
  return atLeast(role, 'ADMIN');
}

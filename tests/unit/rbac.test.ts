import { describe, it, expect } from 'vitest';
import { atLeast, isSeller, isStaff, isAdmin, ROLE_HIERARCHY } from '@/lib/rbac';

describe('role hierarchy', () => {
  it('orders roles by privilege', () => {
    expect(ROLE_HIERARCHY.SUPER_ADMIN).toBeGreaterThan(ROLE_HIERARCHY.ADMIN);
    expect(ROLE_HIERARCHY.ADMIN).toBeGreaterThan(ROLE_HIERARCHY.MODERATOR);
    expect(ROLE_HIERARCHY.SELLER).toBeGreaterThan(ROLE_HIERARCHY.BUYER);
    expect(ROLE_HIERARCHY.BUYER).toBeGreaterThan(ROLE_HIERARCHY.GUEST);
  });
});

describe('atLeast', () => {
  it('returns true when role meets minimum', () => {
    expect(atLeast('ADMIN', 'MODERATOR')).toBe(true);
    expect(atLeast('SUPER_ADMIN', 'SUPER_ADMIN')).toBe(true);
  });
  it('returns false when role is below minimum', () => {
    expect(atLeast('BUYER', 'ADMIN')).toBe(false);
  });
});

describe('isSeller', () => {
  it('matches both seller tiers', () => {
    expect(isSeller('SELLER')).toBe(true);
    expect(isSeller('BUSINESS_SELLER')).toBe(true);
  });
  it('rejects buyers', () => {
    expect(isSeller('BUYER')).toBe(false);
  });
});

describe('isStaff / isAdmin', () => {
  it('staff includes support and above', () => {
    expect(isStaff('SUPPORT')).toBe(true);
    expect(isStaff('ADMIN')).toBe(true);
    expect(isStaff('SELLER')).toBe(false);
  });
  it('admin requires admin tier', () => {
    expect(isAdmin('ADMIN')).toBe(true);
    expect(isAdmin('SUPER_ADMIN')).toBe(true);
    expect(isAdmin('MODERATOR')).toBe(false);
  });
});

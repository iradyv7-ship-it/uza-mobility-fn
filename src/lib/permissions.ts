import { workspaceRoutes } from '@/config/routes';
import type { MeUser } from '@/types/auth/me-user';
import type { PlatformRole } from '@/types/auth/role';
import { lenderRole } from '@/config/lenders';

/** Staff roles that use uza-mobility-admin (not this marketplace app). */
export const PLATFORM_STAFF_ROLES: PlatformRole[] = [
  'SUPER_ADMIN',
  'MARKETPLACE_ADMIN',
  'FINANCE_ADMIN',
  'LOGISTICS_ADMIN',
  'FLEET_ADMIN',
  'SUSTAINABILITY_ADMIN',
  'ADVERTISING_ADMIN',
  'SALES_AGENT',
];

/** Permissions that only platform staff hold — excludes buyer/seller overlaps (e.g. orders:read). */
const ADMIN_PERMISSION_MARKERS = [
  'listings:approve',
  'listings:reject',
  'listings:feature',
  'listings:delete',
  'payments:verify',
  'payments:reject',
  'payments:refund',
  'invoices:send',
  'invoices:cancel',
  'financing:read',
  'financing:send-to-bank',
  'fleet:read',
  'fleet:update-status',
  'promotions:create',
  'promotions:manage',
  'sustainability:read',
  'sustainability:manage',
  'sellers:verify',
  'sellers:suspend',
  'users:manage-roles',
  'users:read',
  'orders:update-status',
  'invoices:read',
  'parts:manage',
  'stations:read-all',
  'stations:approve',
  'stations:reject',
  'stations:suspend',
] as const;

export function can(permissions: string[], action: string): boolean {
  if (permissions.includes('*')) return true;
  return permissions.includes(action);
}

export function canAny(permissions: string[], actions: string[]): boolean {
  return actions.some((action) => can(permissions, action));
}

export function isSuperAdmin(permissions: string[]): boolean {
  return permissions.includes('*');
}

export function hasAdminAccess(
  permissions: string[],
  roles?: readonly string[] | null,
): boolean {
  if (isSuperAdmin(permissions)) return true;

  if (
    roles?.some((role) =>
      (PLATFORM_STAFF_ROLES as readonly string[]).includes(role),
    )
  ) {
    return true;
  }

  return permissions.some((permission) =>
    (ADMIN_PERMISSION_MARKERS as readonly string[]).includes(permission),
  );
}

export function hasSellerWorkspace(
  permissions: string[],
  seller: { id: string; sellerType?: string } | null | undefined,
  sellers?: { id: string; sellerType?: string }[] | null,
): boolean {
  const profiles = sellers?.length ? sellers : seller ? [seller] : [];
  const marketplace = profiles.find(
    (s) =>
      s.sellerType === 'LOCAL_SELLER' ||
      s.sellerType === 'INTERNATIONAL_SELLER',
  );
  if (!marketplace) return false;
  return canAny(permissions, ['listings:create', 'parts:create']);
}

const OPERATOR_WORKSPACE_PERMISSIONS = [
  'stations:create',
  'stations:update',
  'stations:submit',
  'stations:read-own',
] as const;

export function hasOperatorWorkspace(
  permissions: string[],
  roles?: readonly string[] | null,
): boolean {
  if (hasAdminAccess(permissions, roles)) {
    return false;
  }
  if (roles?.includes('CHARGING_OPERATOR')) {
    return true;
  }
  return canAny(permissions, [...OPERATOR_WORKSPACE_PERMISSIONS]);
}

export function hasOperatorApplication(
  operator: MeUser['operator'] | null | undefined,
): boolean {
  return operator != null;
}

function pathStartsWith(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

/** Applicants may open overview + profile; approved operators get the full workspace. */
export function canAccessOperatorPath(me: MeUser, path: string): boolean {
  if (hasOperatorWorkspace(me.permissions, me.roles)) {
    return true;
  }
  return (
    pathStartsWith(path, workspaceRoutes.operator) &&
    (path === workspaceRoutes.operator ||
      path === workspaceRoutes.operatorProfile)
  );
}

const BUYER_WORKSPACE_PERMISSIONS = [
  'orders:read',
  'invoices:create',
  'payments:submit',
  'financing:submit',
] as const;

/** Buyer, marketplace seller, or charging-operator workspaces on this app. */
export function hasMarketplaceWorkspace(me: MeUser): boolean {
  return (
    hasBuyerWorkspace(me.permissions, me.roles) ||
    hasSellerWorkspace(me.permissions, me.seller, me.sellers) ||
    hasOperatorWorkspace(me.permissions, me.roles) ||
    hasOperatorApplication(me.operator)
  );
}

/** Platform staff without a marketplace workspace must use uza-mobility-admin. */
export function isStaffOnlyAccount(me: MeUser): boolean {
  return (
    hasAdminAccess(me.permissions, me.roles) && !hasMarketplaceWorkspace(me)
  );
}

export function hasBuyerWorkspace(
  permissions: string[],
  roles?: readonly string[] | null,
): boolean {
  // Platform staff use uza-mobility-admin, not the buyer workspace on this app.
  if (hasAdminAccess(permissions, roles)) {
    return false;
  }
  if (roles?.includes('BUYER')) {
    return true;
  }
  return canAny(permissions, [...BUYER_WORKSPACE_PERMISSIONS]);
}


/**
 * Whether these roles open a given lender's portal.
 *
 * Convention, not configuration: the role name follows from the lender key, so
 * onboarding a bank is one row in `lenders.ts` plus one role row in the database.
 *
 * SUPER_ADMIN is included because somebody has to be able to see a portal is broken.
 * No other staff role is: a marketplace administrator has no business inside a bank's
 * borrower files, and "they are staff" is not consent under 058/2021.
 */
export function hasLenderWorkspace(
  lenderKey: string,
  roles?: readonly string[] | null,
): boolean {
  if (!roles?.length) return false;
  return roles.includes(lenderRole(lenderKey)) || roles.includes('SUPER_ADMIN');
}

/** Every lender key these roles open. Used to route somebody to their own bank. */
export function lenderKeysFor(
  lenderKeys: readonly string[],
  roles?: readonly string[] | null,
): string[] {
  return lenderKeys.filter((key) => hasLenderWorkspace(key, roles));
}

export function hasWorkshopWorkspace(roles?: readonly string[] | null): boolean {
  if (!roles?.length) return false;
  return (
    roles.includes('MECHANIC') ||
    roles.includes('WORKSHOP_ADMIN') ||
    roles.includes('SUPER_ADMIN')
  );
}

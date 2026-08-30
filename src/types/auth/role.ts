export const PLATFORM_ROLES = [
  'SUPER_ADMIN',
  'MARKETPLACE_ADMIN',
  'FINANCE_ADMIN',
  'LOGISTICS_ADMIN',
  'FLEET_ADMIN',
  'SUSTAINABILITY_ADMIN',
  'ADVERTISING_ADMIN',
  'SALES_AGENT',
  'SELLER',
  'BUYER',
  'CHARGING_OPERATOR',
  'MECHANIC',
  'WORKSHOP_ADMIN',
] as const;

/**
 * A financial institution's role.
 *
 * Not a member of PLATFORM_ROLES, deliberately. Lenders are onboarded as data — see
 * `src/config/lenders.ts` — so the set is open, and closing it here would turn signing
 * a new bank into a type change, a pull request and a deploy.
 */
export type LenderRole = `LENDER_${string}`;

export type PlatformRole = (typeof PLATFORM_ROLES)[number] | LenderRole;

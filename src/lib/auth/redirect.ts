import { workspaceRoutes } from '@/config/routes';
import {
  canAccessOperatorPath,
  lenderKeysFor,
  hasBuyerWorkspace,
  hasMarketplaceWorkspace,
  hasOperatorWorkspace,
  hasLenderWorkspace,
  hasSellerWorkspace,
  hasWorkshopWorkspace,
  isStaffOnlyAccount,
} from '@/lib/permissions';
import { findLender, LENDERS } from '@/config/lenders';
import type { MeUser } from '@/types/auth/me-user';

function pathStartsWith(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

/**
 * Whether this user may open a path under `/lender`.
 *
 * Two separate questions, and the order matters:
 *
 *  1. Does the URL name a lender at all? An unknown key is refused before anything
 *     about this user is consulted, so the answer cannot vary by who is asking.
 *  2. Does this user hold that lender's role, and — for the collateral page — is that
 *     lender entitled to the facility?
 *
 * The collateral check lives here rather than in the page because a page cannot reliably
 * change the response status once React has begun streaming: `notFound()` inside it
 * served the 404 body with a 200 status, and that status difference alone told Equity
 * that `collateral` is a real route on a real lender. Deciding it before rendering is
 * the only place the status is still ours to set.
 */
function canAccessLenderPath(me: MeUser, path: string): boolean {
  const [, , key, ...rest] = path.split('/');
  const lender = key ? findLender(key) : undefined;
  if (!lender) return false;
  if (!hasLenderWorkspace(lender.key, me.roles)) return false;
  if (rest[0] === 'collateral') return lender.seesCollateral === true;
  return true;
}

/** Whether this signed-in user may open a protected workspace path. */
export function canAccessWorkspacePath(me: MeUser, path: string): boolean {
  if (isStaffOnlyAccount(me)) {
    return false;
  }
  if (pathStartsWith(path, workspaceRoutes.account)) {
    return hasBuyerWorkspace(me.permissions, me.roles);
  }
  if (pathStartsWith(path, workspaceRoutes.seller)) {
    return hasSellerWorkspace(me.permissions, me.seller, me.sellers);
  }
  if (pathStartsWith(path, workspaceRoutes.operator)) {
    return canAccessOperatorPath(me, path);
  }
  if (pathStartsWith(path, workspaceRoutes.lender)) {
    return canAccessLenderPath(me, path);
  }
  if (pathStartsWith(path, workspaceRoutes.workshop)) {
    return hasWorkshopWorkspace(me.roles);
  }
  return true;
}

/**
 * After login, honor callbackUrl only when the user is allowed on that workspace.
 */
export function resolvePostLoginRedirect(
  me: MeUser,
  callbackUrl?: string | null,
): string {
  const fallback = authRedirect(me);
  if (!callbackUrl?.startsWith('/')) {
    return fallback;
  }
  if (canAccessWorkspacePath(me, callbackUrl)) {
    return callbackUrl;
  }
  return fallback;
}

/** Default destination for a signed-in marketplace user (buyer / seller / operator). */
export function authRedirect(me: MeUser): string {
  // A bank officer or a mechanic has no marketplace workspace, and until 12 September 2026
  // this function sent them to the homepage — vehicles, accessories, "customize your dream
  // vehicle" — with their portal one URL away. The first thing a lender sees after signing
  // in should be their own book. Checked before the staff-only rule because these roles
  // are not platform staff and must not be bounced to the admin app either.
  if (!isStaffOnlyAccount(me)) {
    const lenderKeys = lenderKeysFor(
      LENDERS.map((l) => l.key),
      me.roles,
    );
    if (lenderKeys.length === 1 && !hasMarketplaceWorkspace(me)) {
      return `${workspaceRoutes.lender}/${lenderKeys[0]}`;
    }
    if (
      hasWorkshopWorkspace(me.roles) &&
      !hasMarketplaceWorkspace(me) &&
      lenderKeys.length === 0
    ) {
      return workspaceRoutes.workshop;
    }
  }

  if (isStaffOnlyAccount(me) || !hasMarketplaceWorkspace(me)) {
    return '/';
  }

  const isSeller = hasSellerWorkspace(me.permissions, me.seller, me.sellers);
  const isBuyer = hasBuyerWorkspace(me.permissions, me.roles);
  const isOperator = hasOperatorWorkspace(me.permissions, me.roles);

  if (isSeller && !isBuyer) {
    return workspaceRoutes.seller;
  }

  if (isOperator && !isSeller && !isBuyer) {
    return workspaceRoutes.operator;
  }

  if (isBuyer) {
    return '/vehicles';
  }

  if (isSeller) {
    return workspaceRoutes.seller;
  }

  return '/vehicles';
}

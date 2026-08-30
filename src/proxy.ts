import { auth, authRedirect, canAccessWorkspacePath } from '@/lib/auth';
import {
  authRoutes,
  protectedWorkspacePrefixes,
  publicOnlyAuthPaths,
  workspaceRoutes,
} from '@/config/routes';
import { isMeUser } from '@/types/auth/me-user';
import { findLender } from '@/config/lenders';
import { NextResponse } from 'next/server';

/**
 * The cash-collateral facility, refused before anything renders.
 *
 * A signed-in bank that is not entitled must get the same answer as anyone typing a URL
 * that does not exist: a 404, with a 404 status. Not a redirect, which says "you are
 * somewhere real but not allowed", and not `notFound()` inside the page, which serves
 * the 404 body with a 200 status once streaming has begun — that status difference alone
 * told Equity that `collateral` is a real route on a real lender.
 *
 * Entitlement is read from `config/lenders.ts`, so this stays one rule for every bank
 * rather than a list of names in the routing layer.
 */
function isUnentitledCollateralPath(pathname: string): boolean {
  const [, root, key, leaf] = pathname.split('/');
  if (root !== 'lender' || leaf !== 'collateral') return false;
  return findLender(key ?? '')?.seesCollateral !== true;
}

const legacyRedirects: Record<string, string> = {
  '/dashboard': workspaceRoutes.account,
  '/settings': workspaceRoutes.accountSettings,
  '/billing': workspaceRoutes.accountBookings,
};

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (legacyRedirects[pathname]) {
    return NextResponse.redirect(
      new URL(legacyRedirects[pathname], req.nextUrl.origin),
    );
  }

  const isAuthPage = publicOnlyAuthPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  const isProtected = protectedWorkspacePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  // Before authentication is even consulted: the answer must not depend on who asks.
  if (isUnentitledCollateralPath(pathname)) {
    return NextResponse.rewrite(new URL('/not-found', req.nextUrl.origin), { status: 404 });
  }

  const user = req.auth?.user;

  if (isAuthPage && isMeUser(user)) {
    const destination = authRedirect(user);
    return NextResponse.redirect(new URL(destination, req.nextUrl.origin));
  }

  if (isProtected && !req.auth) {
    const login = new URL(authRoutes.login, req.nextUrl.origin);
    login.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(login);
  }

  if (
    isMeUser(user) &&
    isProtected &&
    !canAccessWorkspacePath(user, pathname)
  ) {
    return NextResponse.redirect(
      new URL(authRedirect(user), req.nextUrl.origin),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/my',
    '/my/:path*',
    '/seller/:path*',
    '/operator/:path*',
    '/lender/:path*',
    '/workshop/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/check-email',
    '/auth/google/callback',
    '/dashboard/:path*',
    '/settings/:path*',
    '/billing/:path*',
  ],
};

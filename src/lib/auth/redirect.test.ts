import { describe, expect, it } from 'vitest';
import { authRedirect } from './redirect';
import type { MeUser } from '@/types/auth/me-user';
import type { PlatformRole } from '@/types/auth/role';

/**
 * Where somebody lands after signing in.
 *
 * The case that matters: a bank officer whose only role is their lender's must land on their
 * own portal, not on the marketplace homepage. That was the first thing Unguka's officer
 * would have seen on day one, and it was vehicles and accessories.
 */

const user = (roles: PlatformRole[], permissions: string[] = []): MeUser => ({
  id: 'u1',
  email: 'x@example.com',
  phone: null,
  firstName: 'A',
  lastName: 'B',
  isActive: true,
  isEmailVerified: true,
  isPhoneVerified: false,
  preferredLanguage: 'en',
  profilePhoto: null,
  roles,
  permissions,
  buyerProfile: null,
  seller: null,
  sellers: [],
  operator: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});

describe('authRedirect', () => {
  it('sends a lender-only account to its own portal', () => {
    expect(authRedirect(user(['LENDER_UNGUKA']))).toBe('/lender/unguka');
    expect(authRedirect(user(['LENDER_NCBA']))).toBe('/lender/ncba');
  });

  it('sends a mechanic-only account to the workshop', () => {
    expect(authRedirect(user(['MECHANIC']))).toBe('/workshop');
    expect(authRedirect(user(['WORKSHOP_ADMIN']))).toBe('/workshop');
  });

  it('does not guess between two lender roles', () => {
    // Two banks on one account is a configuration error, not a routing decision. The
    // homepage is the safe answer; the wall still holds on whichever portal they open.
    expect(authRedirect(user(['LENDER_UNGUKA', 'LENDER_NCBA']))).toBe('/');
  });

  it('leaves a buyer on the marketplace', () => {
    expect(authRedirect(user(['BUYER']))).not.toMatch(/^\/(lender|workshop)/);
  });

  it('still sends platform staff to the homepage, not a portal', () => {
    // Staff use uza-mobility-admin. SUPER_ADMIN technically opens every lender portal on
    // the API, but a person with every key should not be dropped into one bank's view.
    expect(authRedirect(user(['SUPER_ADMIN']))).toBe('/');
  });
});

import { describe, expect, it } from 'vitest';
import { findLender, LENDERS, lenderNav, lenderRole } from './lenders';
import { canAccessWorkspacePath } from '@/lib/auth/redirect';
import { hasLenderWorkspace, hasWorkshopWorkspace } from '@/lib/permissions';
import type { MeUser } from '@/types/auth/me-user';
import type { PlatformRole } from '@/types/auth/role';

/**
 * Onboarding a new bank, and the one thing that must never be onboarded with it.
 *
 * These are the first tests in this repository. They cover the part where being wrong
 * is most expensive: showing one institution another institution's borrowers, or telling
 * a bank that a facility it is not party to exists at all.
 */

function user(roles: string[]): MeUser {
  return {
    id: 'u1',
    email: 'someone@uza.local',
    phone: null,
    firstName: 'A',
    lastName: 'Person',
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: false,
    preferredLanguage: 'en',
    profilePhoto: null,
    roles: roles as PlatformRole[],
    permissions: [],
    buyerProfile: null,
    seller: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('a lender is a row, not a branch', () => {
  it('resolves every configured lender, case and whitespace insensitively', () => {
    for (const lender of LENDERS) {
      expect(findLender(lender.key)).toBe(lender);
      expect(findLender(`  ${lender.key.toUpperCase()} `)).toBe(lender);
    }
  });

  it('does not resolve a bank nobody has onboarded', () => {
    expect(findLender('bank-of-kigali')).toBeUndefined();
  });

  it('derives the role from the key, so the two cannot drift apart', () => {
    expect(lenderRole('bk')).toBe('LENDER_BK');
    for (const lender of LENDERS) {
      expect(hasLenderWorkspace(lender.key, [lenderRole(lender.key)])).toBe(true);
    }
  });

  it('gives every lender the same five screens', () => {
    for (const lender of LENDERS) {
      const hrefs = lenderNav(lender).map((n) => n.href);
      expect(hrefs).toContain(`/lender/${lender.key}`);
      expect(hrefs).toContain(`/lender/${lender.key}/applications`);
      expect(hrefs).toContain(`/lender/${lender.key}/borrowers`);
      expect(hrefs).toContain(`/lender/${lender.key}/disbursements`);
      expect(hrefs).toContain(`/lender/${lender.key}/portfolio`);
    }
  });

  it('keeps every link inside the lender’s own path', () => {
    // A link that escapes the base path is a link into another bank's portal.
    for (const lender of LENDERS) {
      for (const item of lenderNav(lender)) {
        expect(item.href.startsWith(`/lender/${lender.key}`)).toBe(true);
      }
    }
  });
});

describe('one bank cannot reach another bank', () => {
  it('refuses every cross-pair', () => {
    for (const a of LENDERS) {
      for (const b of LENDERS) {
        if (a.key === b.key) continue;
        expect(hasLenderWorkspace(b.key, [lenderRole(a.key)])).toBe(false);
        expect(canAccessWorkspacePath(user([lenderRole(a.key)]), `/lender/${b.key}`)).toBe(false);
        expect(
          canAccessWorkspacePath(user([lenderRole(a.key)]), `/lender/${b.key}/borrowers`),
        ).toBe(false);
      }
    }
  });

  it('lets a bank into its own portal', () => {
    for (const lender of LENDERS) {
      expect(
        canAccessWorkspacePath(user([lenderRole(lender.key)]), `/lender/${lender.key}/borrowers`),
      ).toBe(true);
    }
  });

  it('refuses a lender key that does not exist, whoever asks', () => {
    // Refused before roles are consulted, so the answer cannot vary by who is asking —
    // otherwise the response itself says which banks are real.
    expect(canAccessWorkspacePath(user(['LENDER_UNGUKA']), '/lender/bk')).toBe(false);
    expect(canAccessWorkspacePath(user(['SUPER_ADMIN']), '/lender/bk')).toBe(false);
  });

  it('does not let a marketplace administrator wander into a bank', () => {
    // "They are staff" is not consent under 058/2021. Only SUPER_ADMIN, who has to be
    // able to see that a portal is broken.
    expect(canAccessWorkspacePath(user(['MARKETPLACE_ADMIN']), '/lender/unguka')).toBe(false);
    expect(canAccessWorkspacePath(user(['FINANCE_ADMIN']), '/lender/unguka')).toBe(false);
  });
});

describe('the cash-collateral facility', () => {
  it('is entitled to Unguka and to nobody else', () => {
    // The one thing onboarding must never grant by default. Widening it is a founder's
    // decision, so it should cost a file change, this test changing, and a review.
    expect(LENDERS.filter((l) => l.seesCollateral).map((l) => l.key)).toEqual(['unguka']);
  });

  it('is absent from an unentitled bank’s navigation, not disabled in it', () => {
    // A greyed-out link still tells Equity the facility exists. That is the disclosure.
    for (const lender of LENDERS.filter((l) => !l.seesCollateral)) {
      const nav = lenderNav(lender);
      expect(nav.some((n) => n.href.endsWith('/collateral'))).toBe(false);
      expect(nav.map((n) => n.label.toLowerCase()).join(' ')).not.toMatch(
        /collateral|credit enhancement/,
      );
    }
  });

  it('is in the entitled bank’s navigation', () => {
    const unguka = findLender('unguka')!;
    expect(lenderNav(unguka).some((n) => n.href.endsWith('/collateral'))).toBe(true);
  });

  it('is refused to an unentitled bank even holding its own valid role', () => {
    for (const lender of LENDERS.filter((l) => !l.seesCollateral)) {
      const me = user([lenderRole(lender.key)]);
      expect(canAccessWorkspacePath(me, `/lender/${lender.key}`)).toBe(true);
      expect(canAccessWorkspacePath(me, `/lender/${lender.key}/collateral`)).toBe(false);
    }
  });

  it('is allowed to the entitled bank', () => {
    expect(
      canAccessWorkspacePath(user(['LENDER_UNGUKA']), '/lender/unguka/collateral'),
    ).toBe(true);
  });
});

describe('the workshop', () => {
  it('opens for mechanics and workshop staff', () => {
    expect(hasWorkshopWorkspace(['MECHANIC'])).toBe(true);
    expect(hasWorkshopWorkspace(['WORKSHOP_ADMIN'])).toBe(true);
    expect(canAccessWorkspacePath(user(['MECHANIC']), '/workshop/rescue')).toBe(true);
  });

  it('does not open for a bank or a buyer', () => {
    expect(hasWorkshopWorkspace(['LENDER_UNGUKA'])).toBe(false);
    expect(hasWorkshopWorkspace(['BUYER'])).toBe(false);
    expect(canAccessWorkspacePath(user(['LENDER_UNGUKA']), '/workshop')).toBe(false);
  });

  it('does not open for somebody with no roles at all', () => {
    expect(hasWorkshopWorkspace([])).toBe(false);
    expect(hasWorkshopWorkspace(null)).toBe(false);
    expect(hasLenderWorkspace('unguka', null)).toBe(false);
  });
});

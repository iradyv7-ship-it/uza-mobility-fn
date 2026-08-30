'use client';

import { authenticatedFetch } from '@/lib/api/authenticated';
import type {
  CreditEnhancement,
  LenderApplication,
  LenderBorrower,
  LenderDisbursement,
  LenderPortfolioRow,
  LenderSummary,
} from '@/types/lender/portfolio';

/**
 * The lender portal's calls.
 *
 * Every path carries the lender key, and the API re-derives entitlement from the
 * caller's token rather than trusting it. That is the point: this argument decides
 * which URL is requested, never who is allowed to see it. A lender asking for another
 * lender's key gets the same answer as one asking for a reference that does not exist,
 * so the portal cannot be used to find out who banks with UZA.
 */
const base = (lenderKey: string) => `/financing/lenders/${lenderKey}`;

export function getLenderSummary(lenderKey: string, token?: string) {
  return authenticatedFetch<LenderSummary>(`${base(lenderKey)}/summary`, { token });
}

export function getLenderApplications(lenderKey: string, token?: string) {
  return authenticatedFetch<LenderApplication[]>(`${base(lenderKey)}/applications`, { token });
}

export function getLenderBorrowers(lenderKey: string, token?: string) {
  return authenticatedFetch<LenderBorrower[]>(`${base(lenderKey)}/borrowers`, { token });
}

export function getLenderDisbursements(lenderKey: string, token?: string) {
  return authenticatedFetch<LenderDisbursement[]>(`${base(lenderKey)}/disbursements`, { token });
}

export function getLenderPortfolio(lenderKey: string, token?: string) {
  return authenticatedFetch<LenderPortfolioRow[]>(`${base(lenderKey)}/portfolio`, { token });
}

/**
 * The cash-collateral ledger.
 *
 * Reachable only from a route that is not mounted unless the lender's registry entry
 * entitles it — and refused again by the API, which is the enforcement that counts.
 */
export function getCreditEnhancement(lenderKey: string, token?: string) {
  return authenticatedFetch<CreditEnhancement>(`${base(lenderKey)}/credit-enhancement`, { token });
}

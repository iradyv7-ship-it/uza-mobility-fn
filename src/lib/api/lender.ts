'use client';

import { authenticatedFetch } from '@/lib/api/authenticated';
import type {
  CreditEnhancement,
  LenderApplication,
  LenderBorrower,
  LenderDecisionOutcome,
  LenderDecisionRecord,
  LenderDisbursement,
  LenderInfoRequestRecord,
  LenderInspectionRecord,
  LenderLoanCovenants,
  LenderPortfolioRow,
  LenderSummary,
  LoanChangeType,
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

const loanBase = (lenderKey: string, loanId: string) => `${base(lenderKey)}/loans/${loanId}`;

/** The financed vehicle's condition-report history — one of the three things UZA Empower
 * gives a lender in exchange for financing at better terms than the vehicle alone would
 * justify (see LenderService.inspectionsForLoan in uza-mobility-bn). */
export function getLenderLoanInspections(lenderKey: string, loanId: string, token?: string) {
  return authenticatedFetch<LenderInspectionRecord[]>(`${loanBase(lenderKey, loanId)}/inspections`, {
    token,
  });
}

/** The borrower's daily savings behaviour against their required payment. Shape is a
 * computed summary, not raw entries — see LenderService.savingsForLoan. */
export function getLenderLoanSavings(lenderKey: string, loanId: string, token?: string) {
  return authenticatedFetch<Record<string, unknown>>(`${loanBase(lenderKey, loanId)}/savings`, {
    token,
  });
}

/** What the borrower was taught and how their comprehension held up — see
 * LenderService.trainingForLoan. */
export function getLenderLoanTraining(lenderKey: string, loanId: string, token?: string) {
  return authenticatedFetch<Record<string, unknown>>(`${loanBase(lenderKey, loanId)}/training`, {
    token,
  });
}

/** Open covenant warnings on one loan, lender-facing ones only — see
 * LenderService.covenantsForLoan. Explains the badge on the borrower row. */
export function getLenderLoanCovenants(lenderKey: string, loanId: string, token?: string) {
  return authenticatedFetch<LenderLoanCovenants>(`${loanBase(lenderKey, loanId)}/covenants`, {
    token,
  });
}

export function getLenderLoanDecisions(lenderKey: string, loanId: string, token?: string) {
  return authenticatedFetch<LenderDecisionRecord[]>(`${loanBase(lenderKey, loanId)}/decisions`, {
    token,
  });
}

export function recordLenderDecision(
  lenderKey: string,
  loanId: string,
  body: { outcome: LenderDecisionOutcome; reasons: string; conditions?: string },
  token?: string,
) {
  return authenticatedFetch<LenderDecisionRecord>(`${loanBase(lenderKey, loanId)}/decisions`, {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  });
}

export function getLenderLoanInfoRequests(lenderKey: string, loanId: string, token?: string) {
  return authenticatedFetch<LenderInfoRequestRecord[]>(
    `${loanBase(lenderKey, loanId)}/info-requests`,
    { token },
  );
}

export function askLenderInfoRequest(
  lenderKey: string,
  loanId: string,
  body: { question: string },
  token?: string,
) {
  return authenticatedFetch<LenderInfoRequestRecord>(
    `${loanBase(lenderKey, loanId)}/info-requests`,
    { method: 'POST', body: JSON.stringify(body), token },
  );
}

/**
 * The "requires permission, but should be possible" gate: propose a change to a loan this
 * bank cannot edit directly. UZA reviews and applies it — see LoanChangeRequest's doc
 * comment in uza-mobility-bn's schema.prisma.
 */
export function submitLoanChangeRequest(
  lenderKey: string,
  loanId: string,
  body: { changeType: LoanChangeType; payload: Record<string, unknown>; note?: string },
  token?: string,
) {
  return authenticatedFetch<{ id: string; status: string }>(
    `${loanBase(lenderKey, loanId)}/change-requests`,
    { method: 'POST', body: JSON.stringify(body), token },
  );
}

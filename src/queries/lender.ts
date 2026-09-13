'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { ApiClientError } from '@/lib/api';
import {
  askLenderInfoRequest,
  getCreditEnhancement,
  getLenderApplications,
  getLenderBorrowers,
  getLenderDisbursements,
  getLenderLoanCovenants,
  getLenderLoanDecisions,
  getLenderLoanInfoRequests,
  getLenderLoanInspections,
  getLenderLoanSavings,
  getLenderLoanTraining,
  getLenderPortfolio,
  getLenderSummary,
  recordLenderDecision,
  submitLoanChangeRequest,
} from '@/lib/api/lender';
import type { LenderDecisionOutcome, LoanChangeType } from '@/types/lender/portfolio';

/**
 * Every query is keyed by the lender.
 *
 * Not a detail. Without the key in the cache entry, a user who legitimately holds two
 * institutions' roles — an auditor, or Yves — would see the first bank's borrowers
 * cached under a key the second bank's screen then reads. The wall would hold in the
 * API and break in the browser.
 */
export const lenderKeys = {
  all: (lender: string) => ['lender', lender] as const,
  summary: (lender: string) => [...lenderKeys.all(lender), 'summary'] as const,
  applications: (lender: string) => [...lenderKeys.all(lender), 'applications'] as const,
  borrowers: (lender: string) => [...lenderKeys.all(lender), 'borrowers'] as const,
  disbursements: (lender: string) => [...lenderKeys.all(lender), 'disbursements'] as const,
  portfolio: (lender: string) => [...lenderKeys.all(lender), 'portfolio'] as const,
  collateral: (lender: string) => [...lenderKeys.all(lender), 'collateral'] as const,
  loanInspections: (lender: string, loanId: string) =>
    [...lenderKeys.all(lender), 'loan', loanId, 'inspections'] as const,
  loanSavings: (lender: string, loanId: string) =>
    [...lenderKeys.all(lender), 'loan', loanId, 'savings'] as const,
  loanCovenants: (lender: string, loanId: string) =>
    [...lenderKeys.all(lender), 'loan', loanId, 'covenants'] as const,
  loanTraining: (lender: string, loanId: string) =>
    [...lenderKeys.all(lender), 'loan', loanId, 'training'] as const,
  loanDecisions: (lender: string, loanId: string) =>
    [...lenderKeys.all(lender), 'loan', loanId, 'decisions'] as const,
  loanInfoRequests: (lender: string, loanId: string) =>
    [...lenderKeys.all(lender), 'loan', loanId, 'info-requests'] as const,
};

function mutationError(error: unknown) {
  return error instanceof ApiClientError
    ? error.message
    : 'Something went wrong. Please try again.';
}

function useLenderAuth() {
  const { data, status } = useSession();
  return {
    token: data?.accessToken,
    ready: status === 'authenticated' && Boolean(data?.accessToken),
  };
}

export function useLenderSummary(lender: string) {
  const { token, ready } = useLenderAuth();
  return useQuery({
    queryKey: lenderKeys.summary(lender),
    queryFn: () => getLenderSummary(lender, token),
    enabled: ready,
  });
}

export function useLenderApplications(lender: string) {
  const { token, ready } = useLenderAuth();
  return useQuery({
    queryKey: lenderKeys.applications(lender),
    queryFn: () => getLenderApplications(lender, token),
    enabled: ready,
  });
}

export function useLenderBorrowers(lender: string) {
  const { token, ready } = useLenderAuth();
  return useQuery({
    queryKey: lenderKeys.borrowers(lender),
    queryFn: () => getLenderBorrowers(lender, token),
    enabled: ready,
  });
}

export function useLenderDisbursements(lender: string) {
  const { token, ready } = useLenderAuth();
  return useQuery({
    queryKey: lenderKeys.disbursements(lender),
    queryFn: () => getLenderDisbursements(lender, token),
    enabled: ready,
  });
}

export function useLenderPortfolio(lender: string) {
  const { token, ready } = useLenderAuth();
  return useQuery({
    queryKey: lenderKeys.portfolio(lender),
    queryFn: () => getLenderPortfolio(lender, token),
    enabled: ready,
  });
}

/**
 * The cash-collateral ledger.
 *
 * Only ever called from a page that is not mounted unless the lender's registry entry
 * entitles it. The API refuses it again, which is the enforcement that counts.
 */
export function useCreditEnhancement(lender: string) {
  const { token, ready } = useLenderAuth();
  return useQuery({
    queryKey: lenderKeys.collateral(lender),
    queryFn: () => getCreditEnhancement(lender, token),
    enabled: ready,
  });
}

// ── One loan's file ─────────────────────────────────────────────────────────────────────

export function useLenderLoanInspections(lender: string, loanId: string) {
  const { token, ready } = useLenderAuth();
  return useQuery({
    queryKey: lenderKeys.loanInspections(lender, loanId),
    queryFn: () => getLenderLoanInspections(lender, loanId, token),
    enabled: ready && !!loanId,
  });
}

export function useLenderLoanSavings(lender: string, loanId: string) {
  const { token, ready } = useLenderAuth();
  return useQuery({
    queryKey: lenderKeys.loanSavings(lender, loanId),
    queryFn: () => getLenderLoanSavings(lender, loanId, token),
    enabled: ready && !!loanId,
  });
}

export function useLenderLoanTraining(lender: string, loanId: string) {
  const { token, ready } = useLenderAuth();
  return useQuery({
    queryKey: lenderKeys.loanTraining(lender, loanId),
    queryFn: () => getLenderLoanTraining(lender, loanId, token),
    enabled: ready && !!loanId,
  });
}

export function useLenderLoanCovenants(lender: string, loanId: string) {
  const { token, ready } = useLenderAuth();
  return useQuery({
    queryKey: lenderKeys.loanCovenants(lender, loanId),
    queryFn: () => getLenderLoanCovenants(lender, loanId, token),
    enabled: ready && !!loanId,
  });
}

export function useLenderLoanDecisions(lender: string, loanId: string) {
  const { token, ready } = useLenderAuth();
  return useQuery({
    queryKey: lenderKeys.loanDecisions(lender, loanId),
    queryFn: () => getLenderLoanDecisions(lender, loanId, token),
    enabled: ready && !!loanId,
  });
}

export function useLenderLoanInfoRequests(lender: string, loanId: string) {
  const { token, ready } = useLenderAuth();
  return useQuery({
    queryKey: lenderKeys.loanInfoRequests(lender, loanId),
    queryFn: () => getLenderLoanInfoRequests(lender, loanId, token),
    enabled: ready && !!loanId,
  });
}

export function useRecordLenderDecision(lender: string, loanId: string) {
  const { token } = useLenderAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      outcome: LenderDecisionOutcome;
      reasons: string;
      conditions?: string;
    }) => recordLenderDecision(lender, loanId, body, token),
    onSuccess: () => {
      toast.success('Decision recorded');
      void queryClient.invalidateQueries({
        queryKey: lenderKeys.loanDecisions(lender, loanId),
      });
      void queryClient.invalidateQueries({ queryKey: lenderKeys.applications(lender) });
      void queryClient.invalidateQueries({ queryKey: lenderKeys.borrowers(lender) });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useAskLenderInfoRequest(lender: string, loanId: string) {
  const { token } = useLenderAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { question: string }) =>
      askLenderInfoRequest(lender, loanId, body, token),
    onSuccess: () => {
      toast.success('Question sent to UZA');
      void queryClient.invalidateQueries({
        queryKey: lenderKeys.loanInfoRequests(lender, loanId),
      });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

/**
 * The "requires permission, but should be possible" gate: propose a change UZA must
 * review before it takes effect. There is no list-my-own-requests endpoint on the lender
 * side (only UZA's review queue has one) — this mutation is intentionally fire-and-forget
 * from this portal's point of view; the lender is notified of the outcome separately.
 */
export function useSubmitLoanChangeRequest(lender: string, loanId: string) {
  const { token } = useLenderAuth();
  return useMutation({
    mutationFn: (body: {
      changeType: LoanChangeType;
      payload: Record<string, unknown>;
      note?: string;
    }) => submitLoanChangeRequest(lender, loanId, body, token),
    onSuccess: () => toast.success('Change proposed — UZA will review it'),
    onError: (error) => toast.error(mutationError(error)),
  });
}

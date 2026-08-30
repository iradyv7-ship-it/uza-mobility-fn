'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  getCreditEnhancement,
  getLenderApplications,
  getLenderBorrowers,
  getLenderDisbursements,
  getLenderPortfolio,
  getLenderSummary,
} from '@/lib/api/lender';

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
};

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

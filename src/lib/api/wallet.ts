import { authenticatedFetch } from '@/lib/api/authenticated';
import type {
  AllocateInput,
  Bucket,
  LedgerLine,
  RecordDepositInput,
  WalletOverview,
  WalletWarnings,
} from '@/types/buyer/wallet';

/** The driver's own wallet — every route is "me"; the API takes the user from the token. */
export function getMyWallet() {
  return authenticatedFetch<WalletOverview>('/wallet/me');
}

export function getMyStatement(limit = 60) {
  return authenticatedFetch<LedgerLine[]>(`/wallet/me/statement?limit=${limit}`);
}

export function getMyWarnings() {
  return authenticatedFetch<WalletWarnings>('/wallet/me/warnings');
}

export function recordMyDeposit(body: RecordDepositInput) {
  return authenticatedFetch<{ duplicate: boolean; message: string }>('/wallet/me/deposits', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function allocateMine(body: AllocateInput) {
  return authenticatedFetch<WalletOverview>('/wallet/me/allocations', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function setMySplit(body: Record<Bucket, number>) {
  return authenticatedFetch<WalletOverview>('/wallet/me/split', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

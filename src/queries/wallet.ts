import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiClientError } from '@/lib/api';
import {
  allocateMine,
  getMyStatement,
  getMyWallet,
  getMyWarnings,
  recordMyDeposit,
  setMySplit,
} from '@/lib/api/wallet';
import type { AllocateInput, Bucket, RecordDepositInput } from '@/types/buyer/wallet';

export const walletKeys = {
  all: ['wallet'] as const,
  overview: () => [...walletKeys.all, 'overview'] as const,
  statement: () => [...walletKeys.all, 'statement'] as const,
  warnings: () => [...walletKeys.all, 'warnings'] as const,
};

function mutationError(error: unknown) {
  // The API's wallet messages are written for the driver — "Only RWF 20,000 is confirmed in
  // Maintenance…" — so they are shown verbatim.
  return error instanceof ApiClientError ? error.message : 'Something went wrong. Please try again.';
}

export function useMyWallet(enabled = true) {
  return useQuery({ queryKey: walletKeys.overview(), queryFn: getMyWallet, enabled, staleTime: 30_000 });
}

export function useMyStatement(enabled = true) {
  return useQuery({ queryKey: walletKeys.statement(), queryFn: () => getMyStatement(60), enabled });
}

export function useMyWarnings(enabled = true) {
  return useQuery({ queryKey: walletKeys.warnings(), queryFn: getMyWarnings, enabled, staleTime: 60_000 });
}

export function useRecordDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RecordDepositInput) => recordMyDeposit(body),
    onSuccess: (r) => {
      toast[r.duplicate ? 'info' : 'success'](r.message);
      void qc.invalidateQueries({ queryKey: walletKeys.all });
    },
    onError: (e) => toast.error(mutationError(e)),
  });
}

export function useAllocate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AllocateInput) => allocateMine(body),
    onSuccess: () => {
      toast.success('Moved. No money changed hands — only the label.');
      void qc.invalidateQueries({ queryKey: walletKeys.all });
    },
    onError: (e) => toast.error(mutationError(e)),
  });
}

export function useSetSplit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<Bucket, number>) => setMySplit(body),
    onSuccess: () => {
      toast.success('Your split is saved. Loan first.');
      void qc.invalidateQueries({ queryKey: walletKeys.all });
    },
    onError: (e) => toast.error(mutationError(e)),
  });
}

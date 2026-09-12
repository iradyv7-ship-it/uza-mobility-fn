import { Landmark } from 'lucide-react';
import type { WalletOverview } from '@/types/buyer/wallet';

/**
 * Said first, on every visit. UZA does not hold client money; this wallet is a view over the
 * driver's own account at a licensed institution. Compliance and trust are one sentence.
 */
export function WhoseMoney({ whoseMoney }: { whoseMoney: WalletOverview['whoseMoney'] }) {
  const si = whoseMoney.standingInstruction;
  return (
    <div className="flex gap-3 rounded-lg border bg-muted/40 p-4 text-sm">
      <Landmark className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
      <div className="space-y-1">
        <p>{whoseMoney.statement}</p>
        <p className="text-xs text-muted-foreground">
          {si?.status === 'ACTIVE'
            ? `Your standing instruction to ${whoseMoney.institutionName ?? 'your bank'} moves the loan amount to the loan account. UZA does not touch it.`
            : si?.status === 'PENDING'
              ? 'Your standing instruction is being set up at the branch. Until then, deposits stay in your account.'
              : 'No standing instruction yet. When you take a loan, you will sign one at the branch — with the bank, not with UZA.'}
        </p>
      </div>
    </div>
  );
}

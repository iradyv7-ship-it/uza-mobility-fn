import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatRwf } from '@/lib/format';
import type { LedgerLine } from '@/types/buyer/wallet';

const BUCKET: Record<string, string> = {
  LOAN: 'Loan',
  MAINTENANCE: 'Maintenance',
  CHARGING: 'Charging',
  INSURANCE: 'Insurance',
  PERSONAL: 'My savings',
};

/** Every line, newest first, with its state on it. A statement should never need explaining. */
export function StatementList({ lines, loading }: { lines: LedgerLine[]; loading: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Urutonde · Statement</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing yet. Your first recorded deposit will appear here.</p>
        ) : (
          <ul className="divide-y">
            {lines.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div className="min-w-0">
                  <div className="truncate">
                    <span className="font-medium">{l.bucket ? BUCKET[l.bucket] : 'Wallet'}</span>
                    <span className="text-muted-foreground"> · {formatDate(l.occurredAt)}</span>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {l.confirmedAt ? 'Byemejwe na banki · confirmed' : 'Bitegereje banki · waiting for the bank'}
                    {l.externalRef ? ` · ${l.externalRef}` : ''}
                    {l.note ? ` · ${l.note}` : ''}
                  </div>
                </div>
                <span className={`shrink-0 tabular-nums ${l.direction === 'DEBIT' ? 'text-muted-foreground' : ''}`}>
                  {l.direction === 'DEBIT' ? '−' : '+'}
                  {formatRwf(l.amountRwf)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

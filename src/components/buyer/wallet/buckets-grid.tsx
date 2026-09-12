import { Car, Clock, Plug, ShieldCheck, Wrench } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatRwf } from '@/lib/format';
import type { Bucket, BucketBalance } from '@/types/buyer/wallet';

const ICONS: Record<Bucket, typeof Car> = {
  LOAN: Car,
  MAINTENANCE: Wrench,
  CHARGING: Plug,
  INSURANCE: ShieldCheck,
  PERSONAL: Clock,
};

/**
 * Five buckets, five cards. The label is what the money is FOR — that is the whole reason
 * a driver can say "I saved RWF 40,000 for maintenance" and the wallet can say it back.
 * Pending money is shown separately and honestly: recorded by you, not yet seen by the bank.
 */
export function BucketsGrid({ buckets }: { buckets: BucketBalance[] }) {
  return (
    <section aria-labelledby="buckets-h">
      <h2 id="buckets-h" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        What each part is for
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {buckets.map((b) => {
          const Icon = ICONS[b.bucket];
          return (
            <Card key={b.bucket} className={b.bucket === 'LOAN' ? 'border-primary/40' : undefined}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{b.label.en}</span>
                  <Icon className="size-4 text-muted-foreground" aria-hidden />
                </div>
                <div className="text-2xl font-semibold tabular-nums">{formatRwf(b.confirmedRwf)}</div>
                {b.pendingRwf > 0 ? (
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    + {formatRwf(b.pendingRwf)} waiting for the bank
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">{b.label.purpose}</p>
                )}
                <p className="text-xs text-muted-foreground">{b.label.rw}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

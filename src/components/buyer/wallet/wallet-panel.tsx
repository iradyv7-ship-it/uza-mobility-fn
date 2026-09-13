'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyStatement, useMyWallet, useMyWarnings } from '@/queries/wallet';
import { BucketsGrid } from './buckets-grid';
import { CovenantBanner } from './covenant-banner';
import { DepositForm } from './deposit-form';
import { MoveBetweenBuckets } from './move-between-buckets';
import { PerformanceCard } from './performance-card';
import { StatementList } from './statement-list';
import { TodayCard } from './today-card';
import { WhoseMoney } from './whose-money';

/**
 * The driver's wallet.
 *
 * Order on the page is deliberate: whose money it is, then today, then any warning, then the
 * buckets, then performance, then the two things they can do, then the statement. A driver
 * opening this at the end of a shift should see in one glance what today needs and whether
 * they are on track — and never once wonder whether UZA is holding their savings.
 */
export function WalletPanel() {
  const wallet = useMyWallet();
  const warnings = useMyWarnings();
  const statement = useMyStatement();

  if (wallet.isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="My wallet" />
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (wallet.isError || !wallet.data) {
    return (
      <div className="space-y-4">
        <PageHeader title="My wallet" />
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          {wallet.error instanceof Error
            ? wallet.error.message
            : 'Your wallet is opened at enrolment, against your own account at the institution. If you have enrolled and do not see it, tell your UZA contact.'}
        </div>
      </div>
    );
  }

  const w = wallet.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ikigega cyanjye · My wallet"
        description="Twara EV — Twara. Tunga. Your savings, in your own account, labelled by what each part is for."
      />

      <WhoseMoney whoseMoney={w.whoseMoney} />

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <TodayCard today={w.today} streak={w.performance.currentStreak} />
        <PerformanceCard performance={w.performance} targets={w.targets} />
      </div>

      {warnings.data && warnings.data.covenants.length > 0 ? (
        <CovenantBanner warnings={warnings.data} />
      ) : null}

      <BucketsGrid buckets={w.buckets} />

      <div className="grid gap-4 lg:grid-cols-2">
        <DepositForm split={w.split} />
        <MoveBetweenBuckets buckets={w.buckets} />
      </div>

      <StatementList lines={statement.data ?? []} loading={statement.isLoading} />
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRwf } from '@/lib/format';
import type { WalletOverview } from '@/types/buyer/wallet';

/**
 * The 90-day record — the same numbers a lender reads, shown to the driver first. The
 * consistency ratio is the input to the readiness score; the driver should know it before
 * a bank does.
 */
export function PerformanceCard({
  performance: p,
  targets,
}: {
  performance: WalletOverview['performance'];
  targets: WalletOverview['targets'];
}) {
  const last30 = p.daily.slice(-30);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Your record — last {p.windowDays} days</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-3 gap-3 text-center">
          <div>
            <dt className="text-xs text-muted-foreground">Consistency</dt>
            <dd className="text-xl font-semibold tabular-nums">{Math.round(p.consistencyRatio * 100)}%</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Days on target</dt>
            <dd className="text-xl font-semibold tabular-nums">{p.daysHit}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Best streak</dt>
            <dd className="text-xl font-semibold tabular-nums">{p.longestStreak}</dd>
          </div>
        </dl>

        {/* Thirty small bars: a full bar is a day on target, a short one a day with something, empty a miss. */}
        <div className="flex h-10 items-end gap-0.5" aria-label="Last 30 days of deposits">
          {last30.map((d) => {
            const h = d.targetRwf > 0 ? Math.min(100, Math.round((d.depositedRwf / d.targetRwf) * 100)) : d.depositedRwf > 0 ? 100 : 0;
            return (
              <div
                key={d.date}
                title={`${d.date}: ${formatRwf(d.depositedRwf)}`}
                className={`flex-1 rounded-sm ${d.hit ? 'bg-emerald-600' : d.depositedRwf > 0 ? 'bg-amber-500' : 'bg-muted'}`}
                style={{ height: `${Math.max(8, h)}%` }}
              />
            );
          })}
        </div>

        {targets.contributionTargetRwf ? (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Toward your contribution</span>
              <span className="tabular-nums">{p.progressPct ?? 0}% of {formatRwf(targets.contributionTargetRwf)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={p.progressPct ?? 0} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-primary" style={{ width: `${p.progressPct ?? 0}%` }} />
            </div>
          </div>
        ) : null}

        <p className="text-xs text-muted-foreground">
          Confirmed deposits only. This is the record your lender reads — with your consent — so it counts only what the bank has seen.
        </p>
      </CardContent>
    </Card>
  );
}

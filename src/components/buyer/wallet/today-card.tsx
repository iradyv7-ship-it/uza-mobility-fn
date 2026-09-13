import { Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRwf } from '@/lib/format';
import type { WalletOverview } from '@/types/buyer/wallet';

/** The one number the driver lives by, and how far today is from it. */
export function TodayCard({ today, streak }: { today: WalletOverview['today']; streak: number }) {
  const pct = today.targetRwf > 0 ? Math.min(100, Math.round((today.depositedRwf / today.targetRwf) * 100)) : 0;
  const done = today.targetRwf > 0 && today.remainingRwf === 0;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span>Uyu munsi · Today</span>
          <span className="flex items-center gap-1 text-sm font-normal text-muted-foreground">
            <Flame className="size-4" aria-hidden />
            iminsi {streak} ikurikiranye · {streak} in a row
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-semibold tabular-nums">{formatRwf(today.depositedRwf)}</span>
          <span className="text-sm text-muted-foreground">of {formatRwf(today.targetRwf)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className={`h-full ${done ? 'bg-emerald-600' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-sm text-muted-foreground">
          {today.targetRwf === 0
            ? 'No daily target yet — it is set when your vehicle is chosen.'
            : done
              ? 'Uyu munsi warangije. Today is done — anything more goes to your own savings or the buffer.'
              : `${formatRwf(today.remainingRwf)} bisigaye uyu munsi · still to deposit today. Counted from confirmed deposits in the loan, maintenance, charging and insurance buckets.`}
        </p>
      </CardContent>
    </Card>
  );
}

'use client';

import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useJobCards } from '@/queries/workshop';
import type { JobCard } from '@/types/workshop/job-card';

/**
 * The board, ordered by what will go wrong first.
 *
 * Overdue, then at risk, then waiting on a decision somebody else owes, then waiting on
 * a part. A board sorted by arrival time lets a promised car slip quietly, which is the
 * failure a workshop is judged on.
 *
 * AWAITING_AUTHORISATION has its own lane rather than sitting inside "in progress"
 * because the work is stopped and the person who can unstick it is not in this room.
 */
const LANES = [
  { key: 'OVERDUE', label: 'Overdue' },
  { key: 'AT_RISK', label: 'At risk' },
  { key: 'AWAITING_AUTHORISATION', label: 'Awaiting authorisation' },
  { key: 'AWAITING_PARTS', label: 'Awaiting parts' },
  { key: 'IN_PROGRESS', label: 'In progress' },
] as const;

const promised = (v: string | null) =>
  v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'not promised';

export function WorkshopBoardPanel() {
  const q = useJobCards();
  const cards: JobCard[] = q.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Workshop board" description="Ordered by what will go wrong first." />

      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : q.error ? (
        <p className="text-sm text-muted-foreground">
          The workshop board is not connected in this environment yet.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-5">
          {LANES.map((lane) => {
            const inLane = cards.filter((c) => (c.state ?? '').toUpperCase() === lane.key);
            return (
              <Card key={lane.key}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    {lane.label} ({inLane.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {inLane.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Clear</p>
                  ) : (
                    inLane.map((c) => (
                      <div key={c.id} className="rounded-md border p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{c.vehiclePlate ?? c.reference}</span>
                          <StatusBadge status={lane.key} />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {c.assignedTo ?? 'Unassigned'} · promised {promised(c.promisedAt)}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

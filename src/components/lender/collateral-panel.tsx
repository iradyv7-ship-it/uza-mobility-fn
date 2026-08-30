'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { formatRwf } from '@/lib/format';
import { useCreditEnhancement } from '@/queries/lender';
import type { LenderConfig } from '@/config/lenders';

export function CollateralPanel({ lender }: { lender: LenderConfig }) {
  const q = useCreditEnhancement(lender.key);
  const d = q.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit enhancement"
        description={`The cash-collateral facility supporting ${lender.name} lending.`}
      />

      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : q.error ? (
        <p className="text-sm text-muted-foreground">That information is not available.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['Pledged', d?.pledged],
            ['Released', d?.released],
            ['Called back', d?.calledBack],
          ].map(([label, value]) => (
            <Card key={String(label)}>
              <CardContent className="pt-6">
                <div className="text-2xl font-semibold tabular-nums">
                  {formatRwf(value as number | undefined)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{String(label)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          {/*
            Two things that must appear wherever these figures do, because both are
            structural commitments rather than presentation. UZA does not hold client
            money, and it does not warrant repayment — the facility is a pledge under
            its own terms, not a guarantee.
          */}
          Figures are drawn from the facility ledger. UZA does not hold client money:
          these amounts sit in the facility account under its own terms. The facility is
          a pledge, not a guarantee of repayment.
        </CardContent>
      </Card>
    </div>
  );
}

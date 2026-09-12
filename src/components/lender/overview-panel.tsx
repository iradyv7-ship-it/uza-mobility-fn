'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRwf } from '@/lib/format';
import { useLenderSummary } from '@/queries/lender';
import type { LenderConfig } from '@/config/lenders';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

export function LenderOverviewPanel({ lender }: { lender: LenderConfig }) {
  const summary = useLenderSummary(lender.key);
  const d = summary.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={lender.name}
        description="Applications and portfolio for your institution only."
      />

      {summary.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : summary.error ? (
        <p className="text-sm text-muted-foreground">That information is not available.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Applications pending" value={String(d?.applicationsPending ?? 0)} />
          <Stat label="Active loans" value={String(d?.activeLoans ?? 0)} />
          <Stat label="Disbursed" value={formatRwf(d?.disbursedTotal)} />
          <Stat label="In arrears" value={formatRwf(d?.arrearsTotal)} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What you can see here</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {/*
            Said plainly, because the bank will ask. Consent is per-institution under
            058/2021: agreeing that one lender may see a file is not agreeing that
            another may.
          */}
          Borrower files appear here only where the borrower has consented to share them
          with {lender.name}. Files belonging to other institutions are not visible, and a
          reference that is not yours returns the same answer as one that does not exist.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Who UZA is in this relationship</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {/*
            The data model is unambiguous on this — Loan.borrower is a person, UZA appears
            only as originator, data provider and (for one lender) collateral depositor —
            but until 12 September 2026 nothing on this screen said so, and a bank officer
            opening the portal for the first time had to infer it. Stating it matters
            beyond courtesy: UZA borrowing and on-lending would make UZA a credit provider,
            which it is not and must not appear to be.
          */}
          <p>
            <strong className="text-foreground">The borrower on every loan is the driver named.</strong>{' '}
            UZA Solutions originates these applications, trains and places the drivers, and
            provides the data you see here. UZA is not a party to the loan and does not hold
            client money.
          </p>
          {lender.seesCollateral ? (
            <p>
              For {lender.name}, UZA Empower additionally holds the cash-collateral facility
              shown under <em>Credit enhancement</em>. It is a pledge in support of these
              loans, not a guarantee of repayment.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

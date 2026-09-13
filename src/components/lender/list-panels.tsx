'use client';

import { useState } from 'react';
import { StatusBadge } from '@/components/shared/status-badge';
import { CovenantBadge } from '@/components/lender/covenant-badge';
import { Column, DataTable } from '@/components/lender/data-table';
import { LenderLoanDetailSheet, type LoanSummaryHeader } from '@/components/lender/loan-detail-sheet';
import { Button } from '@/components/ui/button';
import { formatRwf } from '@/lib/format';
import {
  useLenderApplications,
  useLenderBorrowers,
  useLenderDisbursements,
  useLenderPortfolio,
} from '@/queries/lender';
import type {
  LenderApplication,
  LenderBorrower,
  LenderDisbursement,
  LenderPortfolioRow,
} from '@/types/lender/portfolio';

const text = (v: unknown) => (v == null || v === '' ? '—' : String(v));
const when = (v: string | null) =>
  v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export function ApplicationsPanel({ lender }: { lender: string }) {
  const [viewing, setViewing] = useState<LoanSummaryHeader | null>(null);

  const columns: Column<LenderApplication>[] = [
    { header: 'Reference', cell: (r) => text(r.reference) },
    { header: 'Applicant', cell: (r) => text(r.applicantName) },
    { header: 'Amount', numeric: true, cell: (r) => formatRwf(r.amount) },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    { header: 'Received', cell: (r) => when(r.createdAt) },
    {
      header: '',
      cell: (r) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setViewing({
              loanId: r.id,
              reference: r.reference,
              applicantName: r.applicantName,
              status: r.status,
            })
          }
        >
          Open
        </Button>
      ),
    },
  ];
  return (
    <>
      <DataTable
        title="Applications"
        description="Financing applications submitted to your institution."
        columns={columns}
        query={useLenderApplications(lender)}
        empty="No applications are waiting on you."
      />
      <LenderLoanDetailSheet
        lender={lender}
        loan={viewing}
        open={!!viewing}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
      />
    </>
  );
}

export function BorrowersPanel({ lender }: { lender: string }) {
  const [viewing, setViewing] = useState<LoanSummaryHeader | null>(null);

  const columns: Column<LenderBorrower>[] = [
    // The UZA ID first. It is the same person here, in the workshop and in Nexus, and
    // showing it makes that joinable rather than a claim.
    { header: 'UZA ID', cell: (r) => text(r.uzaId) },
    { header: 'Name', cell: (r) => text(r.displayName) },
    { header: 'Loan', cell: (r) => text(r.loanRef) },
    { header: 'Balance', numeric: true, cell: (r) => formatRwf(r.balance) },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    // What the covenant engine has open on this loan, right on the row. The officer should
    // not need the warnings page to see who needs a call today; the sheet explains why.
    { header: 'Warnings', cell: (r) => <CovenantBadge worst={r.worst} count={r.openWarnings} /> },
    {
      header: '',
      cell: (r) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setViewing({
              loanId: r.id,
              reference: r.loanRef ?? r.uzaId,
              applicantName: r.displayName,
              status: r.status,
            })
          }
        >
          Open
        </Button>
      ),
    },
  ];
  return (
    <>
      <DataTable
        title="Borrowers"
        description="Only borrowers who consented to share their file with you."
        columns={columns}
        query={useLenderBorrowers(lender)}
        empty="No borrowers have consented to share a file yet."
      />
      <LenderLoanDetailSheet
        lender={lender}
        loan={viewing}
        open={!!viewing}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
      />
    </>
  );
}

export function DisbursementsPanel({ lender }: { lender: string }) {
  const columns: Column<LenderDisbursement>[] = [
    { header: 'Reference', cell: (r) => text(r.reference) },
    { header: 'Amount', numeric: true, cell: (r) => formatRwf(r.amount) },
    { header: 'Date', cell: (r) => when(r.disbursedAt) },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
  ];
  return (
    <DataTable
      title="Disbursements"
      columns={columns}
      query={useLenderDisbursements(lender)}
      empty="Nothing has been disbursed yet."
    />
  );
}

export function PortfolioPanel({ lender }: { lender: string }) {
  const columns: Column<LenderPortfolioRow>[] = [
    { header: 'Cohort', cell: (r) => text(r.cohort) },
    { header: 'Loans', numeric: true, cell: (r) => text(r.count) },
    { header: 'Outstanding', numeric: true, cell: (r) => formatRwf(r.outstanding) },
    { header: 'Arrears', numeric: true, cell: (r) => formatRwf(r.arrears) },
  ];
  return (
    <DataTable
      title="Portfolio"
      description="Outstanding and arrears by cohort."
      columns={columns}
      query={useLenderPortfolio(lender)}
      empty="No cohorts have disbursed yet."
    />
  );
}

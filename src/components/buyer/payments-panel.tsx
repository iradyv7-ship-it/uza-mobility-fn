'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BuyerPaymentDetailSheet } from '@/components/buyer/payment-detail-sheet';
import { SubmitPaymentDialog } from '@/components/buyer/submit-payment-dialog';
import { StatusBadge } from '@/components/shared/status-badge';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatSettledAmount } from '@/lib/format';
import { useMyPayments } from '@/queries/buyer';
import type {
  BuyerPayment,
  BuyerPaymentsFilters,
} from '@/types/buyer/commerce';

function paymentStatusHint(status: string): string | null {
  switch (status) {
    case 'UNDER_VERIFICATION':
    case 'SUBMITTED':
      return 'Our finance team is verifying your payment.';
    case 'CONFIRMED':
      return 'Payment confirmed — check your orders for fulfillment updates.';
    case 'REJECTED':
      return 'Payment rejected — review the reason and submit again.';
    default:
      return null;
  }
}

export function BuyerPaymentsPanel() {
  const searchParams = useSearchParams();
  const invoiceIdParam = searchParams.get('invoiceId');

  const [filters, setFilters] = useState<BuyerPaymentsFilters>({
    page: 1,
    limit: 20,
  });
  const [submitOpen, setSubmitOpen] = useState(false);
  const [defaultInvoiceId, setDefaultInvoiceId] = useState<
    string | undefined
  >();
  const [detailPayment, setDetailPayment] = useState<BuyerPayment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, isLoading, isError, error } = useMyPayments(filters);

  useEffect(() => {
    if (!invoiceIdParam) return;
    setDefaultInvoiceId(invoiceIdParam);
    setSubmitOpen(true);
  }, [invoiceIdParam]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="My payments"
          description="Your latest payment submission per invoice. Older rejected attempts are hidden after you resubmit."
        />
        <Button
          onClick={() => {
            setDefaultInvoiceId(undefined);
            setSubmitOpen(true);
          }}
        >
          Submit payment
        </Button>
      </div>

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load payments'}
        </p>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}
            {!isLoading && (data?.items.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  No payment submissions yet. Submit proof after paying an
                  invoice.
                </TableCell>
              </TableRow>
            ) : null}
            {data?.items.map((payment) => {
              const hint = paymentStatusHint(payment.status);
              return (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div>
                      <p>{payment.invoice.invoiceNumber}</p>
                      {hint ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {hint}
                        </p>
                      ) : null}
                      {payment.rejectionReason ? (
                        <p className="mt-1 text-xs text-destructive">
                          {payment.rejectionReason}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatSettledAmount(payment.amountPaid, payment.currency)}
                    <span className="ml-1 text-xs text-muted-foreground">
                      {payment.currency === 'RWF' ? 'Rwf' : 'USD'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell>{formatDate(payment.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDetailPayment(payment);
                          setDetailOpen(true);
                        }}
                      >
                        Details
                      </Button>
                      {payment.status === 'REJECTED' ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setDefaultInvoiceId(payment.invoiceId);
                            setSubmitOpen(true);
                          }}
                        >
                          Resubmit payment
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {data?.meta ? (
        <PaginationBar
          meta={data.meta}
          onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        />
      ) : null}

      <BuyerPaymentDetailSheet
        payment={detailPayment}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <SubmitPaymentDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        defaultInvoiceId={defaultInvoiceId}
      />
    </div>
  );
}

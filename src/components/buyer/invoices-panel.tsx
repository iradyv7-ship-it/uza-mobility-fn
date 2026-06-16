'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { BuyerInvoiceDetailSheet } from '@/components/buyer/invoice-detail-sheet';
import { InvoiceBankDetailsDialog } from '@/components/buyer/invoice-bank-details-dialog';
import { RequestInvoiceDialog } from '@/components/buyer/request-invoice-dialog';
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
import { workspaceRoutes } from '@/config/routes';
import { formatUsd } from '@/lib/format';
import {
  invoiceLastRejectionReason,
  invoicePaymentWasRejected,
  invoiceStatusHintFor,
  isCancellableByBuyerInvoiceStatus,
  isPayableInvoiceStatus,
  publicListingToSummary,
} from '@/lib/buyer/invoice-flow';
import { cn } from '@/lib/utils';
import { getListingBySlug } from '@/lib/api/marketplace';
import {
  useCancelMyInvoice,
  useDownloadInvoiceDocument,
  useMyInvoices,
  useOpenInvoiceDocument,
} from '@/queries/buyer';
import type {
  BuyerInvoice,
  BuyerInvoicesFilters,
} from '@/types/buyer/commerce';
import type { PublicListingSummary } from '@/types/buyer/commerce';

export function BuyerInvoicesPanel() {
  const searchParams = useSearchParams();
  const listingIdParam = searchParams.get('listingId');
  const slugParam = searchParams.get('slug');
  const shouldOpenRequest = searchParams.get('request') === '1';
  const highlightId = searchParams.get('highlight');
  const paymentParam = searchParams.get('payment');

  const [filters, setFilters] = useState<BuyerInvoicesFilters>({
    page: 1,
    limit: 20,
  });
  const [requestOpen, setRequestOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<
    string | undefined
  >();
  const [bankDetailsInvoice, setBankDetailsInvoice] =
    useState<BuyerInvoice | null>(null);
  const [detailInvoice, setDetailInvoice] = useState<BuyerInvoice | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [initialListing, setInitialListing] =
    useState<PublicListingSummary | null>(null);
  const [cancelInvoice, setCancelInvoice] = useState<BuyerInvoice | null>(null);

  const openDoc = useOpenInvoiceDocument();
  const downloadDoc = useDownloadInvoiceDocument();
  const cancelReservation = useCancelMyInvoice();
  const { data, isLoading, isError, error } = useMyInvoices(filters);

  useEffect(() => {
    if (!paymentParam) return;
    setPaymentInvoiceId(paymentParam);
    setPaymentOpen(true);
  }, [paymentParam]);

  useEffect(() => {
    if (!shouldOpenRequest || !listingIdParam) return;

    let cancelled = false;

    async function openRequestDialog() {
      try {
        if (slugParam) {
          const listing = await getListingBySlug(slugParam);
          if (!cancelled && listing.id === listingIdParam) {
            setInitialListing(publicListingToSummary(listing));
          }
        }
      } catch {
        // Still open the dialog — listing id from the URL is enough to submit.
      } finally {
        if (!cancelled) setRequestOpen(true);
      }
    }

    void openRequestDialog();

    return () => {
      cancelled = true;
    };
  }, [shouldOpenRequest, listingIdParam, slugParam]);

  const onSubmitPayment = (invoiceId: string) => {
    setPaymentInvoiceId(invoiceId);
    setPaymentOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="My invoices"
          description="Proforma invoices for your vehicle purchases. Pay using the bank details on each invoice."
        />
        <Button onClick={() => setRequestOpen(true)}>Request invoice</Button>
      </div>

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load invoices'}
        </p>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
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
                  No invoices yet. Reserve a vehicle or request an invoice to
                  start a purchase.
                </TableCell>
              </TableRow>
            ) : null}
            {data?.items.map((invoice) => {
              const hint = invoiceStatusHintFor(invoice);
              const rejectionReason = invoiceLastRejectionReason(invoice);
              const needsResubmit = invoicePaymentWasRejected(invoice);
              const payable = isPayableInvoiceStatus(invoice.status);
              const cancellable = isCancellableByBuyerInvoiceStatus(
                invoice.status,
              );
              return (
                <TableRow
                  key={invoice.id}
                  className={cn(highlightId === invoice.id && 'bg-primary/5')}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        Ref {invoice.paymentReference}
                      </p>
                      {hint ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {hint}
                        </p>
                      ) : null}
                      {rejectionReason ? (
                        <p className="mt-1 text-xs text-destructive">
                          {rejectionReason}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    {invoice.vehicleBrand} {invoice.vehicleModel}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell>{formatUsd(invoice.totalAmountUsd)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDetailInvoice(invoice);
                          setDetailOpen(true);
                        }}
                      >
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={openDoc.isPending}
                        onClick={() => openDoc.mutate(invoice.id)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={downloadDoc.isPending}
                        onClick={() =>
                          downloadDoc.mutate({
                            invoiceId: invoice.id,
                            invoiceNumber: invoice.invoiceNumber,
                          })
                        }
                      >
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setBankDetailsInvoice(invoice)}
                      >
                        Bank details
                      </Button>
                      {payable ? (
                        <Button
                          size="sm"
                          onClick={() => onSubmitPayment(invoice.id)}
                        >
                          {needsResubmit ? 'Resubmit payment' : 'Pay'}
                        </Button>
                      ) : null}
                      {cancellable ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setCancelInvoice(invoice)}
                        >
                          Cancel reservation
                        </Button>
                      ) : null}
                      <Button size="sm" variant="ghost" asChild>
                        <Link
                          href={`${workspaceRoutes.accountFinancing}?invoiceId=${invoice.id}`}
                        >
                          Financing
                        </Link>
                      </Button>
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

      <RequestInvoiceDialog
        open={requestOpen}
        onOpenChange={setRequestOpen}
        defaultListingId={listingIdParam ?? undefined}
        initialListing={initialListing}
      />

      <SubmitPaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        defaultInvoiceId={paymentInvoiceId}
      />

      <BuyerInvoiceDetailSheet
        invoice={detailInvoice}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onSubmitPayment={onSubmitPayment}
        onDownload={(inv) =>
          downloadDoc.mutate({
            invoiceId: inv.id,
            invoiceNumber: inv.invoiceNumber,
          })
        }
        downloading={downloadDoc.isPending}
      />

      <InvoiceBankDetailsDialog
        invoice={bankDetailsInvoice}
        open={Boolean(bankDetailsInvoice)}
        onOpenChange={(open) => {
          if (!open) setBankDetailsInvoice(null);
        }}
        onSubmitPayment={onSubmitPayment}
      />

      <ConfirmDialog
        open={Boolean(cancelInvoice)}
        onOpenChange={(open) => {
          if (!open) setCancelInvoice(null);
        }}
        title="Cancel reservation?"
        description={
          cancelInvoice
            ? `${cancelInvoice.invoiceNumber} will be cancelled and the vehicle released back to the marketplace. You can reserve again later if it is still available.`
            : ''
        }
        confirmLabel="Cancel reservation"
        variant="destructive"
        loading={cancelReservation.isPending}
        onConfirm={() => {
          if (!cancelInvoice) return;
          cancelReservation.mutate(cancelInvoice.id, {
            onSuccess: () => setCancelInvoice(null),
          });
        }}
      />
    </div>
  );
}

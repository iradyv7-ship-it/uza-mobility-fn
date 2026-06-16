'use client';

import Link from 'next/link';
import {
  BuyerDetailRow,
  BuyerDetailSection,
  BuyerDetailNote,
} from '@/components/buyer/detail-fields';
import {
  BuyerDetailCallout,
  BuyerDetailSheetBody,
  BuyerDetailSheetFooter,
  BuyerDetailSheetHeader,
  BuyerDetailSummary,
} from '@/components/buyer/detail-sheet-layout';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatDateTime, formatUsd } from '@/lib/format';
import { invoiceStatusHintFor } from '@/lib/buyer/invoice-flow';
import { buyerDetailSheetClassName } from '@/lib/buyer/detail-sheet';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import type { BuyerInvoice } from '@/types/buyer/commerce';

const vehicleLinkClassName =
  'font-medium text-[#046A38] underline-offset-4 hover:underline';

type BuyerInvoiceDetailSheetProps = {
  invoice: BuyerInvoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitPayment?: (invoiceId: string) => void;
  onDownload?: (invoice: BuyerInvoice) => void;
  downloading?: boolean;
};

export function BuyerInvoiceDetailSheet({
  invoice,
  open,
  onOpenChange,
  onSubmitPayment,
  onDownload,
  downloading,
}: BuyerInvoiceDetailSheetProps) {
  if (!invoice) return null;

  const hint = invoiceStatusHintFor(invoice);
  const vehicleLabel =
    [invoice.vehicleBrand, invoice.vehicleModel].filter(Boolean).join(' ') ||
    '—';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={buyerDetailSheetClassName}>
        <BuyerDetailSheetHeader
          title={invoice.invoiceNumber}
          description={`${vehicleLabel} · Ref ${invoice.paymentReference}`}
          meta={<StatusBadge status={invoice.status} />}
        />

        <BuyerDetailSheetBody>
          {hint ? (
            <BuyerDetailCallout variant="info">{hint}</BuyerDetailCallout>
          ) : null}

          <BuyerDetailSummary
            items={[
              {
                label: 'Amount due',
                value: `${formatUsd(invoice.totalAmountUsd)} ${invoice.currency}`,
                emphasis: true,
              },
              {
                label: 'Pay before',
                value: formatDate(invoice.paymentDeadline),
              },
              {
                label: 'Valid until',
                value: formatDate(invoice.validUntil),
              },
              {
                label: 'Issued',
                value: formatDate(invoice.issuedAt),
              },
            ]}
          />

          <BuyerDetailSection title="Vehicle & listing">
            <BuyerDetailRow label="Vehicle" value={vehicleLabel} />
            <BuyerDetailRow
              label="Listing"
              value={
                invoice.listing?.slug ? (
                  <Link
                    href={`/vehicles/${invoice.listing.slug}`}
                    className={vehicleLinkClassName}
                  >
                    {invoice.listing.listingTitle}
                  </Link>
                ) : (
                  (invoice.listingTitle ?? '—')
                )
              }
              fullWidth
            />
            <BuyerDetailRow
              label="Created"
              value={formatDateTime(invoice.createdAt)}
            />
          </BuyerDetailSection>

          {invoice.beneficiaryName ||
          invoice.bankName ||
          invoice.accountNumber ? (
            <BuyerDetailSection title="Bank details">
              <BuyerDetailRow
                label="Beneficiary"
                value={invoice.beneficiaryName}
              />
              <BuyerDetailRow label="Bank" value={invoice.bankName} />
              <BuyerDetailRow
                label="Account number"
                value={
                  invoice.accountNumber ? (
                    <span className="font-mono text-xs">
                      {invoice.accountNumber}
                    </span>
                  ) : (
                    '—'
                  )
                }
                fullWidth
              />
            </BuyerDetailSection>
          ) : null}

          {invoice.payments && invoice.payments.length > 0 ? (
            <BuyerDetailSection title="Payment history">
              {invoice.payments.map((payment) => (
                <BuyerDetailRow
                  key={payment.id}
                  label={formatDate(payment.createdAt)}
                  value={
                    <span className="inline-flex flex-wrap items-center gap-2">
                      {formatUsd(payment.amountPaid)}
                      <StatusBadge status={payment.status} />
                    </span>
                  }
                  fullWidth
                />
              ))}
            </BuyerDetailSection>
          ) : null}

          {invoice.notes ? (
            <BuyerDetailNote title="Notes">{invoice.notes}</BuyerDetailNote>
          ) : null}
        </BuyerDetailSheetBody>

        {onDownload || onSubmitPayment ? (
          <BuyerDetailSheetFooter>
            {onDownload ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={downloading}
                onClick={() => onDownload(invoice)}
              >
                {downloading ? 'Downloading…' : 'Download invoice'}
              </Button>
            ) : null}
            {onSubmitPayment ? (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onSubmitPayment(invoice.id);
                  onOpenChange(false);
                }}
              >
                Submit payment
              </Button>
            ) : null}
          </BuyerDetailSheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

'use client';

import {
  BuyerDetailProofGrid,
  BuyerDetailRow,
  BuyerDetailSection,
  BuyerDetailNote,
} from '@/components/buyer/detail-fields';
import {
  BuyerDetailCallout,
  BuyerDetailSheetBody,
  BuyerDetailSheetHeader,
  BuyerDetailSummary,
} from '@/components/buyer/detail-sheet-layout';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate, formatDateTime, formatUsd } from '@/lib/format';
import { buyerDetailSheetClassName } from '@/lib/buyer/detail-sheet';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import type { BuyerPayment } from '@/types/buyer/commerce';

function isImageProof(fileType: string) {
  return ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF'].includes(fileType.toUpperCase());
}

type BuyerPaymentDetailSheetProps = {
  payment: BuyerPayment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BuyerPaymentDetailSheet({
  payment,
  open,
  onOpenChange,
}: BuyerPaymentDetailSheetProps) {
  if (!payment) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={buyerDetailSheetClassName}>
        <BuyerDetailSheetHeader
          title={`Payment · ${payment.invoice.invoiceNumber}`}
          description={`Ref ${payment.invoice.paymentReference}`}
          meta={<StatusBadge status={payment.status} />}
        />

        <BuyerDetailSheetBody>
          <BuyerDetailSummary
            items={[
              {
                label: 'Amount paid',
                value: `${formatUsd(payment.amountPaid)} ${payment.currency}`,
                emphasis: true,
              },
              {
                label: 'Invoice total',
                value: formatUsd(payment.invoice.totalAmountUsd),
              },
              {
                label: 'Submitted',
                value: formatDateTime(payment.createdAt),
              },
              {
                label: 'Invoice status',
                value: <StatusBadge status={payment.invoice.status} />,
              },
            ]}
          />

          <BuyerDetailSection title="Transfer details">
            <BuyerDetailRow label="Sender name" value={payment.senderName} />
            <BuyerDetailRow label="Bank" value={payment.bankName} />
            <BuyerDetailRow
              label="Transfer reference"
              value={payment.transferReference}
            />
            <BuyerDetailRow
              label="Payment date"
              value={formatDate(payment.paymentDate)}
            />
          </BuyerDetailSection>

          {payment.notes ? (
            <BuyerDetailNote title="Your notes">
              {payment.notes}
            </BuyerDetailNote>
          ) : null}

          {payment.rejectionReason ? (
            <BuyerDetailCallout variant="destructive">
              {payment.rejectionReason}
            </BuyerDetailCallout>
          ) : null}

          <BuyerDetailProofGrid
            proofs={payment.proofs}
            isImageProof={isImageProof}
          />
        </BuyerDetailSheetBody>
      </SheetContent>
    </Sheet>
  );
}

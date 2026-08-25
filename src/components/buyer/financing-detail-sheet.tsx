'use client';

import {
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
import { formatDateTime, formatInvoiceTotal, formatUsd } from '@/lib/format';
import { buyerDetailSheetClassName } from '@/lib/buyer/detail-sheet';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import type { BuyerFinancingRequest } from '@/types/buyer/commerce';

type BuyerFinancingDetailSheetProps = {
  request: BuyerFinancingRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BuyerFinancingDetailSheet({
  request,
  open,
  onOpenChange,
}: BuyerFinancingDetailSheetProps) {
  if (!request) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={buyerDetailSheetClassName}>
        <BuyerDetailSheetHeader
          title="Financing request"
          description={request.buyerName}
          meta={<StatusBadge status={request.status} />}
        />

        <BuyerDetailSheetBody>
          <BuyerDetailSummary
            items={[
              {
                label: 'Preferred deposit',
                value:
                  request.preferredDepositUsd != null
                    ? formatUsd(request.preferredDepositUsd)
                    : '—',
                emphasis: true,
              },
              {
                label: 'Preferred bank',
                value: request.preferredBankName ?? '—',
              },
              {
                label: 'Submitted',
                value: formatDateTime(request.createdAt),
              },
              {
                label: 'Last updated',
                value: formatDateTime(request.updatedAt),
              },
            ]}
          />

          <BuyerDetailSection title="Contact">
            <BuyerDetailRow label="Phone" value={request.phone} />
            <BuyerDetailRow
              label="Organization"
              value={request.organizationName}
            />
          </BuyerDetailSection>

          {request.invoice ? (
            <BuyerDetailSection title="Linked invoice">
              <BuyerDetailRow
                label="Invoice number"
                value={request.invoice.invoiceNumber}
              />
              <BuyerDetailRow
                label="Amount"
                value={formatInvoiceTotal(request.invoice)}
              />
              <BuyerDetailRow
                label="Invoice status"
                value={<StatusBadge status={request.invoice.status} />}
              />
            </BuyerDetailSection>
          ) : null}

          {request.assignedBank ? (
            <BuyerDetailSection title="Assigned bank partner">
              <BuyerDetailRow label="Bank" value={request.assignedBank.name} />
              <BuyerDetailRow
                label="Country"
                value={request.assignedBank.country}
              />
            </BuyerDetailSection>
          ) : null}

          {request.notes ? (
            <BuyerDetailNote title="Your notes">
              {request.notes}
            </BuyerDetailNote>
          ) : null}

          {request.reviewNotes ? (
            <BuyerDetailCallout variant="info">
              <p className="font-medium">UZA review notes</p>
              <p className="mt-1 whitespace-pre-wrap">{request.reviewNotes}</p>
            </BuyerDetailCallout>
          ) : null}
        </BuyerDetailSheetBody>
      </SheetContent>
    </Sheet>
  );
}

'use client';

import Link from 'next/link';
import {
  BuyerDetailRow,
  BuyerDetailSection,
  BuyerDetailNote,
  BuyerDetailTracking,
} from '@/components/buyer/detail-fields';
import {
  BuyerDetailSheetBody,
  BuyerDetailSheetHeader,
  BuyerDetailSummary,
} from '@/components/buyer/detail-sheet-layout';
import { StatusBadge } from '@/components/shared/status-badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { formatDate, formatDateTime, formatUsd } from '@/lib/format';
import { formatSellerChannel } from '@/lib/auth/seller-profiles';
import { buyerDetailSheetClassName } from '@/lib/buyer/detail-sheet';
import { useOrderTracking } from '@/queries/buyer';
import type { BuyerOrder } from '@/types/buyer/commerce';

const vehicleLinkClassName =
  'font-medium text-[#046A38] underline-offset-4 hover:underline';

type OrderDetailSheetProps = {
  order: BuyerOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BuyerOrderDetailSheet({
  order,
  open,
  onOpenChange,
}: OrderDetailSheetProps) {
  const { data: tracking, isLoading } = useOrderTracking(
    open && order ? order.id : null,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={buyerDetailSheetClassName}>
        {!order ? null : (
          <>
            <BuyerDetailSheetHeader
              title={order.orderNumber}
              description={`${order.listing.listingTitle} · ${formatSellerChannel(order.sellerType)}`}
              meta={<StatusBadge status={order.status} />}
            />

            <BuyerDetailSheetBody>
              <BuyerDetailSummary
                items={[
                  {
                    label: 'Total paid',
                    value: formatUsd(order.invoice.totalAmountUsd),
                    emphasis: true,
                  },
                  {
                    label: 'Invoice',
                    value: order.invoice.invoiceNumber,
                  },
                  {
                    label: 'Payment reference',
                    value: order.invoice.paymentReference,
                  },
                  {
                    label: 'Est. delivery',
                    value: formatDate(order.estimatedDeliveryDate),
                  },
                ]}
              />

              <BuyerDetailSection title="Vehicle">
                <BuyerDetailRow
                  label="Make / model / year"
                  value={`${order.listing.brand} ${order.listing.model} · ${order.listing.manufacturingYear}`}
                  fullWidth
                />
                <BuyerDetailRow
                  label="Listing"
                  value={
                    <Link
                      href={`/vehicles/${order.listing.slug}`}
                      className={vehicleLinkClassName}
                    >
                      View vehicle page
                    </Link>
                  }
                  fullWidth
                />
              </BuyerDetailSection>

              <BuyerDetailSection title="Delivery">
                <BuyerDetailRow
                  label="City / country"
                  value={
                    [order.deliveryCity, order.deliveryCountry]
                      .filter(Boolean)
                      .join(', ') || '—'
                  }
                />
                <BuyerDetailRow
                  label="Address"
                  value={order.deliveryAddress}
                  fullWidth
                />
                <BuyerDetailRow
                  label="Delivered"
                  value={formatDate(order.actualDeliveryDate)}
                />
                <BuyerDetailRow
                  label="Order placed"
                  value={formatDateTime(order.createdAt)}
                />
              </BuyerDetailSection>

              {order.handoverNotes ? (
                <BuyerDetailNote title="Handover notes">
                  {order.handoverNotes}
                </BuyerDetailNote>
              ) : null}

              <BuyerDetailTracking
                events={tracking?.events}
                isLoading={isLoading}
              />
            </BuyerDetailSheetBody>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

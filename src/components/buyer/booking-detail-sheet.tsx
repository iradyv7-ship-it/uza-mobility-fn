'use client';

import Link from 'next/link';
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
import {
  formatDate,
  formatDateTime,
  formatSettledAmount,
  formatUsd,
} from '@/lib/format';
import { formatSellerChannel } from '@/lib/auth/seller-profiles';
import { buyerDetailSheetClassName } from '@/lib/buyer/detail-sheet';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import type { VehicleBooking } from '@/types/buyer/bookings';

function isImageProof(fileName: string) {
  return ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF'].includes(
    fileName.split('.').pop()?.toUpperCase() ?? '',
  );
}

const vehicleLinkClassName =
  'font-medium text-[#046A38] underline-offset-4 hover:underline';

type BuyerBookingDetailSheetProps = {
  booking: VehicleBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BuyerBookingDetailSheet({
  booking,
  open,
  onOpenChange,
}: BuyerBookingDetailSheetProps) {
  if (!booking) return null;

  const proofs = booking.proofs ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={buyerDetailSheetClassName}>
        <BuyerDetailSheetHeader
          title={booking.listing?.listingTitle ?? 'Vehicle booking'}
          description={`${booking.bookingNumber} · Ref ${booking.paymentReference}`}
          meta={<StatusBadge status={booking.status} />}
        />

        <BuyerDetailSheetBody>
          <BuyerDetailSummary
            items={[
              {
                label: 'Booking fee',
                value: formatUsd(booking.bookingFeeUsd),
                emphasis: true,
              },
              {
                label: 'Amount paid',
                value:
                  booking.amountPaid != null
                    ? `${formatSettledAmount(booking.amountPaid, booking.currency)} (${booking.currency === 'RWF' ? 'Rwf' : 'USD'} account)`
                    : 'Not submitted',
              },
              {
                label: 'Valid until',
                value: formatDate(booking.validUntil),
              },
              {
                label: 'Confirmed',
                value: formatDateTime(booking.confirmedAt),
              },
            ]}
          />

          {booking.listing ? (
            <BuyerDetailSection title="Vehicle">
              <BuyerDetailRow
                label="Make / model"
                value={`${booking.listing.brand} ${booking.listing.model}`}
              />
              {booking.listing.sellerType ? (
                <BuyerDetailRow
                  label="Channel"
                  value={formatSellerChannel(booking.listing.sellerType)}
                />
              ) : null}
              <BuyerDetailRow
                label="Listing"
                value={
                  <Link
                    href={`/vehicles/${booking.listing.slug}`}
                    className={vehicleLinkClassName}
                  >
                    View vehicle page
                  </Link>
                }
                fullWidth
              />
            </BuyerDetailSection>
          ) : null}

          <BuyerDetailSection title="Payment details">
            <BuyerDetailRow label="Currency" value={booking.currency} />
            <BuyerDetailRow label="Bank" value={booking.bankName} />
            <BuyerDetailRow
              label="Transfer reference"
              value={booking.transferReference ?? booking.paymentReference}
            />
            <BuyerDetailRow label="Sender name" value={booking.senderName} />
            <BuyerDetailRow
              label="Payment date"
              value={formatDate(booking.paymentDate)}
            />
            <BuyerDetailRow
              label="Created"
              value={formatDateTime(booking.createdAt)}
            />
          </BuyerDetailSection>

          {booking.notes ? (
            <BuyerDetailNote title="Your notes">
              {booking.notes}
            </BuyerDetailNote>
          ) : null}

          {booking.rejectionReason ? (
            <BuyerDetailCallout variant="destructive">
              {booking.rejectionReason}
            </BuyerDetailCallout>
          ) : null}

          <BuyerDetailProofGrid proofs={proofs} isImageProof={isImageProof} />
        </BuyerDetailSheetBody>
      </SheetContent>
    </Sheet>
  );
}

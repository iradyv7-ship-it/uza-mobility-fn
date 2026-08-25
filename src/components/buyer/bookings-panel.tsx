'use client';

import { useEffect, useState } from 'react';
import { BuyerBookingDetailSheet } from '@/components/buyer/booking-detail-sheet';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { PageHeader } from '@/components/shared/page-header';
import { SubmitBookingPaymentDialog } from '@/components/buyer/submit-booking-payment-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatBookingFee } from '@/lib/format';
import { workspaceRoutes } from '@/config/routes';
import {
  bookingPaymentWasRejected,
  bookingStatusHint,
  isBookingPaymentSubmittable,
} from '@/lib/buyer/booking-flow';
import { useCancelBooking, useMyBookings } from '@/queries/bookings';
import type { VehicleBooking } from '@/types/buyer/bookings';

export function BuyerBookingsPanel() {
  const searchParams = useSearchParams();

  const highlightId =
    searchParams.get('highlight') ?? searchParams.get('bookingId');

  const { data, isLoading, isError, error } = useMyBookings({
    limit: 50,
    activeOnly: true,
  });

  const cancelBooking = useCancelBooking();
  const [submitOpen, setSubmitOpen] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<VehicleBooking | null>(
    null,
  );
  const [cancelTarget, setCancelTarget] = useState<VehicleBooking | null>(null);
  const [detailBooking, setDetailBooking] = useState<VehicleBooking | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (!highlightId || !data?.items.length) return;

    const booking = data.items.find(
      (row) => row.id === highlightId && isBookingPaymentSubmittable(row),
    );

    if (booking) {
      setPaymentBooking(booking);
      setSubmitOpen(true);
    }
  }, [highlightId, data?.items]);

  const openPaymentDialog = (booking: VehicleBooking) => {
    setPaymentBooking(booking);
    setSubmitOpen(true);
  };

  const confirmCancelBooking = () => {
    if (!cancelTarget) return;

    const bookingId = cancelTarget.id;
    setCancelTarget(null);

    if (paymentBooking?.id === bookingId) {
      setPaymentBooking(null);
      setSubmitOpen(false);
    }

    cancelBooking.mutate(bookingId);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicle bookings"
        description="Your vehicle bookings and booking fee payments. Rejected payments appear here with the reason — not on My payments."
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load bookings.'}
        </p>
      ) : null}

      <div className="space-y-3">
        {data?.items.map((booking) => {
          const hint = bookingStatusHint(booking);
          const needsResubmit = bookingPaymentWasRejected(booking);

          return (
            <div
              key={booking.id}
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {booking.listing?.listingTitle ?? booking.bookingNumber}
                </p>

                <p className="text-sm text-muted-foreground">
                  {formatBookingFee(booking)} · {booking.bookingNumber}
                </p>

                {hint ? (
                  <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
                ) : null}

                {booking.rejectionReason ? (
                  <p className="mt-1 text-xs text-destructive">
                    {booking.rejectionReason}
                  </p>
                ) : null}

                {booking.listing?.slug ? (
                  <Link
                    href={`/vehicles/${booking.listing.slug}`}
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    View vehicle
                  </Link>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {needsResubmit ? (
                  <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
                    Payment rejected
                  </span>
                ) : (
                  <StatusBadge status={booking.status} />
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setDetailBooking(booking);
                    setDetailOpen(true);
                  }}
                >
                  Details
                </Button>

                {isBookingPaymentSubmittable(booking) ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => openPaymentDialog(booking)}
                    >
                      {needsResubmit ? 'Resubmit payment' : 'Pay fee'}
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setCancelTarget(booking)}
                    >
                      Cancel booking
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}

        {!isLoading && (data?.items.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">
            No bookings yet. Browse{' '}
            <Link href="/vehicles" className="underline">
              vehicles
            </Link>{' '}
            to book a China-sourced import.
          </p>
        ) : null}
      </div>

      <Button asChild variant="outline">
        <Link href={workspaceRoutes.account}>Back to overview</Link>
      </Button>

      <BuyerBookingDetailSheet
        booking={detailBooking}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <SubmitBookingPaymentDialog
        open={submitOpen}
        onOpenChange={(open) => {
          setSubmitOpen(open);

          if (!open) setPaymentBooking(null);
        }}
        booking={paymentBooking}
      />

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        title="Cancel booking?"
        description={
          cancelTarget
            ? `Booking ${cancelTarget.bookingNumber} will be cancelled. You have not submitted payment proof, so you can book another vehicle when ready.`
            : ''
        }
        confirmLabel="Cancel booking"
        variant="destructive"
        loading={cancelBooking.isPending}
        onConfirm={confirmCancelBooking}
      />
    </div>
  );
}

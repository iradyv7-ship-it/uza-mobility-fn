'use client';

import { useEffect, useState } from 'react';
import { PaymentProofFileInput } from '@/components/buyer/payment-proof-file-input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { bookingPaymentWasRejected } from '@/lib/buyer/booking-flow';
import { formatBookingFee, usdtToRwf } from '@/lib/format';
import { useSubmitBookingPayment } from '@/queries/bookings';
import type { VehicleBooking } from '@/types/buyer/bookings';

function bookingFeeRwf(booking: VehicleBooking): number {
  if (booking.bookingFeeRwf != null) return booking.bookingFeeRwf;
  return usdtToRwf(booking.bookingFeeUsd) ?? booking.bookingFeeUsd;
}

type SubmitBookingPaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: VehicleBooking | null;
};

export function SubmitBookingPaymentDialog({
  open,
  onOpenChange,
  booking,
}: SubmitBookingPaymentDialogProps) {
  const submit = useSubmitBookingPayment();
  const [proofs, setProofs] = useState<File[]>([]);
  const [amountPaid, setAmountPaid] = useState('');

  useEffect(() => {
    if (!open || !booking) {
      setProofs([]);
      setAmountPaid('');
      return;
    }
    setAmountPaid(String(bookingFeeRwf(booking)));
    setProofs([]);
  }, [open, booking?.id, booking?.bookingFeeUsd, booking?.bookingFeeRwf]);

  const onSubmit = () => {
    if (!booking || proofs.length === 0) return;
    const parsed = Number(amountPaid);
    if (!Number.isFinite(parsed) || parsed <= 0) return;

    submit.mutate(
      {
        bookingId: booking.id,
        payload: {
          amountPaid: parsed,
          transferReference: booking.paymentReference,
        },
        proofs,
      },
      {
        onSuccess: () => {
          setProofs([]);
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        onInteractOutside={(event) => {
          if (proofs.length > 0) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {booking && bookingPaymentWasRejected(booking)
              ? 'Resubmit booking payment'
              : 'Submit booking payment'}
          </DialogTitle>
        </DialogHeader>

        {booking ? (
          <div className="space-y-4">
            {booking.rejectionReason ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <p className="font-medium">Previous payment not verified</p>
                <p className="mt-1">{booking.rejectionReason}</p>
              </div>
            ) : null}
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <p className="font-medium">
                {booking.listing?.listingTitle ?? booking.bookingNumber}
              </p>
              <p className="mt-1 text-muted-foreground">
                Booking fee: {formatBookingFee(booking)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Pay the Rwf account using payment reference{' '}
                <span className="font-mono">{booking.paymentReference}</span>.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="booking-amount">Amount paid (Rwf)</Label>
              <NumberInput
                id="booking-amount"
                min={1}
                step="1"
                value={amountPaid}
                onChange={(event) => setAmountPaid(event.target.value)}
                disabled={submit.isPending}
              />
            </div>

            <PaymentProofFileInput
              files={proofs}
              onFilesChange={setProofs}
              disabled={submit.isPending}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No payable booking selected.
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={submit.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={
              submit.isPending ||
              !booking ||
              proofs.length === 0 ||
              !Number.isFinite(Number(amountPaid)) ||
              Number(amountPaid) <= 0
            }
            onClick={onSubmit}
          >
            {submit.isPending
              ? 'Submitting…'
              : booking && bookingPaymentWasRejected(booking)
                ? 'Resubmit payment'
                : 'Submit payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

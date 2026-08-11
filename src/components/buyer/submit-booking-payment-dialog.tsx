'use client';

import { useEffect, useState } from 'react';
import { PaymentProofFileInput } from '@/components/buyer/payment-proof-file-input';
import { usePriceCurrency } from '@/components/marketing/price-currency-provider';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { bookingPaymentWasRejected } from '@/lib/buyer/booking-flow';
import { formatUsd, usdtToRwf } from '@/lib/format';
import { useSubmitBookingPayment } from '@/queries/bookings';
import type { VehicleBooking } from '@/types/buyer/bookings';

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
  const { rate } = usePriceCurrency();
  const [proofs, setProofs] = useState<File[]>([]);
  const [currency, setCurrency] = useState<'USD' | 'RWF'>('USD');
  const [amountPaid, setAmountPaid] = useState('');

  const effectiveRate = rate?.usdToRwfEffective ?? null;
  const expectedRwf =
    booking != null ? usdtToRwf(booking.bookingFeeUsd, effectiveRate) : null;

  useEffect(() => {
    if (!open || !booking) {
      setProofs([]);
      setCurrency('USD');
      setAmountPaid('');
      return;
    }
    setCurrency('USD');
    setAmountPaid(String(booking.bookingFeeUsd));
    setProofs([]);
  }, [open, booking?.id, booking?.bookingFeeUsd]);

  const onCurrencyChange = (value: string) => {
    const next = value === 'RWF' ? 'RWF' : 'USD';
    setCurrency(next);
    if (!booking) return;
    if (next === 'RWF') {
      setAmountPaid(String(expectedRwf ?? 0));
      return;
    }
    setAmountPaid(String(booking.bookingFeeUsd));
  };

  const onSubmit = () => {
    if (!booking || proofs.length === 0) return;
    const parsed = Number(amountPaid);
    if (!Number.isFinite(parsed) || parsed <= 0) return;

    submit.mutate(
      {
        bookingId: booking.id,
        payload: {
          amountPaid: parsed,
          currency,
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
                Booking fee: {formatUsd(booking.bookingFeeUsd)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Use payment reference{' '}
                <span className="font-mono">{booking.paymentReference}</span>{' '}
                when transferring funds.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Paid to account</Label>
              <Select value={currency} onValueChange={onCurrencyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD receiving account</SelectItem>
                  <SelectItem value="RWF">Rwf receiving account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="booking-amount">
                Amount paid ({currency === 'RWF' ? 'Rwf' : 'USD'})
              </Label>
              <NumberInput
                id="booking-amount"
                min={0.01}
                step="0.01"
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

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { VehicleInquiryDialog } from '@/components/marketing/vehicle-inquiry-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { workspaceRoutes } from '@/config/routes';
import { brand } from '@/lib/marketing/colors';
import { usePriceCurrency } from '@/components/marketing/price-currency-provider';
import {
  bookingPaymentWasRejected,
  bookingStatusHint,
  findActiveBuyerBooking,
  isBookingPaymentSubmittable,
  isCancellableBuyerBooking,
} from '@/lib/buyer/booking-flow';
import {
  buyerInvoiceRequestHref,
  findActiveBuyerInvoice,
  invoiceLastRejectionReason,
  invoicePaymentWasRejected,
  invoiceStatusHintFor,
  isPayableInvoiceStatus,
} from '@/lib/buyer/invoice-flow';
import { findSupersededBooking } from '@/lib/buyer/purchase-conflict';
import { VehiclePurchaseUnavailable } from '@/components/marketing/vehicle-purchase-unavailable';
import { useAppRouter } from '@/lib/navigation/use-app-router';
import {
  useBookingFeeQuote,
  useCancelBooking,
  useMyBookings,
  useRequestVehicleBooking,
} from '@/queries/bookings';
import {
  useBuyerProfile,
  useMyInvoices,
  useRequestInvoice,
} from '@/queries/buyer';
import { isMeUser } from '@/types/auth/me-user';
import type { PublicListing } from '@/types/marketplace/public-listing';
import type { VehicleBooking } from '@/types/buyer/bookings';
import type { InquiryInput } from '@/schemas/inquiry';

type GuestInquiryVariant = InquiryInput['intent'] | null;

type VehicleDetailBookingActionProps = {
  listing: PublicListing;
};

export function VehicleDetailBookingAction({
  listing,
}: VehicleDetailBookingActionProps) {
  const router = useAppRouter();
  const { data: session, status } = useSession();
  const { formatAmount } = usePriceCurrency();
  const me = isMeUser(session?.user) ? session.user : null;
  const isAuthenticatedBuyer =
    status === 'authenticated' && Boolean(me?.roles.includes('BUYER'));

  const { data: feeQuote } = useBookingFeeQuote();
  const requestBooking = useRequestVehicleBooking();
  const requestInvoice = useRequestInvoice();
  const cancelBooking = useCancelBooking();
  const [cancelTarget, setCancelTarget] = useState<VehicleBooking | null>(null);
  const [inquiryVariant, setInquiryVariant] =
    useState<GuestInquiryVariant>(null);

  const vehicleHref = `/vehicles/${listing.slug}`;
  const buyReturnHref = buyerInvoiceRequestHref(listing);
  const profileHrefForBuy = `${workspaceRoutes.accountProfile}?returnTo=${encodeURIComponent(buyReturnHref)}`;
  const profileHrefForBook = `${workspaceRoutes.accountProfile}?returnTo=${encodeURIComponent(vehicleHref)}`;

  const {
    data: myBookings,
    isLoading: bookingsLoading,
    isFetched: bookingsFetched,
  } = useMyBookings(
    { listingId: listing.id, limit: 5, activeOnly: true },
    isAuthenticatedBuyer,
  );

  const { data: bookingHistory } = useMyBookings(
    { listingId: listing.id, limit: 10, activeOnly: false },
    isAuthenticatedBuyer,
  );

  const {
    data: myInvoices,
    isLoading: invoicesLoading,
    isFetched: invoicesFetched,
  } = useMyInvoices(
    { listingId: listing.id, pendingPurchase: true, limit: 5 },
    isAuthenticatedBuyer,
  );

  const { data: buyerProfile, isLoading: profileLoading } =
    useBuyerProfile(isAuthenticatedBuyer);

  const buyerDataReady =
    !isAuthenticatedBuyer ||
    ((!bookingsLoading || bookingsFetched) &&
      (!invoicesLoading || invoicesFetched));

  const activeBooking = isAuthenticatedBuyer
    ? findActiveBuyerBooking(myBookings?.items)
    : null;

  const activeInvoice = isAuthenticatedBuyer
    ? findActiveBuyerInvoice(myInvoices?.items)
    : null;

  const supersededBooking = isAuthenticatedBuyer
    ? findSupersededBooking(bookingHistory?.items)
    : null;

  const confirmCancelBooking = () => {
    if (!cancelTarget) return;
    const bookingId = cancelTarget.id;
    setCancelTarget(null);
    cancelBooking.mutate(bookingId);
  };

  if (status === 'loading' || (isAuthenticatedBuyer && !buyerDataReady)) {
    return (
      <div className="mt-8 flex h-10 w-full items-center justify-center">
        <Spinner className="size-5" />
      </div>
    );
  }

  if (!isAuthenticatedBuyer) {
    return (
      <>
        <div className="mt-8 space-y-2">
          <Button
            type="button"
            onClick={() => setInquiryVariant('BUY')}
            className="h-10 w-full rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: brand.forest }}
          >
            Buy This Vehicle
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setInquiryVariant('BOOK')}
            className="h-10 w-full rounded-full border text-sm font-semibold"
            style={{ borderColor: brand.forest, color: brand.forest }}
          >
            Book This Vehicle
          </Button>
          <p className="text-center text-xs text-[#356769]">
            Share your details by email. Create a free account afterward to
            submit payment and track your purchase or booking.
          </p>
        </div>
        <VehicleInquiryDialog
          listing={listing}
          open={inquiryVariant !== null}
          onOpenChange={(open) => {
            if (!open) setInquiryVariant(null);
          }}
          variant={inquiryVariant ?? 'BOOK'}
        />
      </>
    );
  }

  if (supersededBooking && !activeInvoice) {
    return (
      <div className="mt-8">
        <VehiclePurchaseUnavailable variant="superseded" />
      </div>
    );
  }

  if (activeBooking) {
    const bookingHint = bookingStatusHint(activeBooking);
    const needsResubmit = bookingPaymentWasRejected(activeBooking);

    return (
      <>
        <div className="mt-8 space-y-3">
          <div className="rounded-xl border border-[#E9E9E9] bg-[#f8faf9] p-4 text-sm">
            <p className="font-medium text-[#151515]">
              Booking {activeBooking.bookingNumber}
            </p>
            <p className="mt-1 text-[#356769] capitalize">
              {activeBooking.status.replaceAll('_', ' ').toLowerCase()}
            </p>
            {bookingHint ? (
              <p className="mt-1 text-[#356769]">{bookingHint}</p>
            ) : null}
            {activeBooking.rejectionReason ? (
              <p className="mt-1 text-destructive">
                {activeBooking.rejectionReason}
              </p>
            ) : null}
            <p className="mt-2 text-[#356769]">
              Booking fee: {formatAmount(activeBooking.bookingFeeUsd)}
            </p>
          </div>
          {isBookingPaymentSubmittable(activeBooking) ? (
            <>
              <Button
                asChild
                className="h-10 w-full rounded-full"
                style={{ backgroundColor: brand.forest }}
              >
                <Link
                  href={`${workspaceRoutes.accountBookings}?bookingId=${activeBooking.id}`}
                >
                  {needsResubmit
                    ? 'Resubmit booking payment'
                    : 'Submit booking payment'}
                </Link>
              </Button>
              {isCancellableBuyerBooking(activeBooking.status) ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full rounded-full text-destructive hover:text-destructive"
                  disabled={cancelBooking.isPending}
                  onClick={() => setCancelTarget(activeBooking)}
                >
                  Cancel booking
                </Button>
              ) : null}
            </>
          ) : (
            <Button
              asChild
              variant="outline"
              className="h-10 w-full rounded-full"
            >
              <Link href={workspaceRoutes.accountBookings}>
                View my bookings
              </Link>
            </Button>
          )}
        </div>

        <ConfirmDialog
          open={Boolean(cancelTarget)}
          onOpenChange={(open) => {
            if (!open) setCancelTarget(null);
          }}
          title="Cancel booking?"
          description={
            cancelTarget
              ? `Booking ${cancelTarget.bookingNumber} will be cancelled. You can book another vehicle when ready.`
              : ''
          }
          confirmLabel="Cancel booking"
          variant="destructive"
          loading={cancelBooking.isPending}
          onConfirm={confirmCancelBooking}
        />
      </>
    );
  }

  if (activeInvoice) {
    const payable = isPayableInvoiceStatus(activeInvoice.status);
    const needsResubmit = invoicePaymentWasRejected(activeInvoice);
    const invoiceHint = invoiceStatusHintFor(activeInvoice);

    return (
      <div className="mt-8 space-y-3">
        <div className="rounded-xl border border-[#E9E9E9] bg-[#f8faf9] p-4 text-sm">
          <p className="font-medium text-[#151515]">
            Invoice {activeInvoice.invoiceNumber}
          </p>
          <p className="mt-1 text-[#356769] capitalize">
            {activeInvoice.status.replaceAll('_', ' ').toLowerCase()}
          </p>
          {invoiceHint ? (
            <p className="mt-1 text-[#356769]">{invoiceHint}</p>
          ) : null}
          {invoiceLastRejectionReason(activeInvoice) ? (
            <p className="mt-1 text-destructive">
              {invoiceLastRejectionReason(activeInvoice)}
            </p>
          ) : null}
          <p className="mt-2 text-[#356769]">
            Amount: {formatAmount(activeInvoice.totalAmountUsd)}
          </p>
        </div>
        <Button
          asChild
          className="h-10 w-full rounded-full"
          style={{ backgroundColor: brand.forest }}
        >
          <Link
            href={`${workspaceRoutes.accountInvoices}?highlight=${activeInvoice.id}${payable ? `&payment=${activeInvoice.id}` : ''}`}
          >
            {payable
              ? needsResubmit
                ? 'Resubmit payment'
                : 'Submit payment'
              : 'View my invoice'}
          </Link>
        </Button>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="mt-8 flex h-10 w-full items-center justify-center">
        <Spinner className="size-5" />
      </div>
    );
  }

  const hasBuyerProfile = Boolean(me?.buyerProfile ?? buyerProfile);

  if (!hasBuyerProfile) {
    return (
      <div className="mt-8 space-y-2">
        <Button
          asChild
          className="h-10 w-full rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: brand.forest }}
        >
          <Link href={profileHrefForBuy}>Complete profile to buy</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-10 w-full rounded-full border text-sm font-semibold"
          style={{ borderColor: brand.forest, color: brand.forest }}
        >
          <Link href={profileHrefForBook}>Complete profile to book</Link>
        </Button>
        <p className="text-center text-xs text-[#356769]">
          Complete your buyer profile before purchasing or booking this vehicle.
        </p>
      </div>
    );
  }

  const handleBuy = () => {
    requestInvoice.mutate(
      { listingId: listing.id },
      {
        onSuccess: (invoice) => {
          toast.success('Invoice requested — submit your payment next');
          router.push(
            `${workspaceRoutes.accountInvoices}?highlight=${invoice.id}&payment=${invoice.id}`,
          );
        },
      },
    );
  };

  const handleBook = () => {
    requestBooking.mutate(
      { listingId: listing.id },
      {
        onSuccess: (booking) => {
          toast.success('Booking created — submit your payment next');
          router.push(
            `${workspaceRoutes.accountBookings}?highlight=${booking.id}`,
          );
        },
      },
    );
  };

  const priceLabel =
    listing.listingPricing?.finalPriceUsd != null
      ? formatAmount(listing.listingPricing.finalPriceUsd)
      : 'the quoted price';

  return (
    <div className="mt-8 space-y-2">
      <Button
        type="button"
        disabled={requestInvoice.isPending}
        onClick={handleBuy}
        className="h-10 w-full rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: brand.forest }}
      >
        {requestInvoice.isPending ? 'Requesting invoice…' : 'Buy This Vehicle'}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={requestBooking.isPending}
        onClick={handleBook}
        className="h-10 w-full rounded-full border text-sm font-semibold"
        style={{ borderColor: brand.forest, color: brand.forest }}
      >
        {requestBooking.isPending ? 'Creating booking…' : 'Book This Vehicle'}
      </Button>
      <p className="text-center text-xs text-[#356769]">
        Buy requests a proforma invoice for {priceLabel} and lets you upload
        payment proof. Book secures the vehicle with a{' '}
        {feeQuote ? formatAmount(feeQuote.bookingFeeUsd) : 'small'} booking fee.
      </p>
    </div>
  );
}

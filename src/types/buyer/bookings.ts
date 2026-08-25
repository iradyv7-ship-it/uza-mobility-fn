export type VehicleBookingStatus =
  | 'AWAITING_PAYMENT'
  | 'PAYMENT_SUBMITTED'
  | 'UNDER_VERIFICATION'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export type VehicleBooking = {
  id: string;
  bookingNumber: string;
  paymentReference: string;
  listingId: string;
  userId: string;
  bookingFeeUsd: number;
  bookingFeeRwf?: number | null;
  currency: string;
  status: VehicleBookingStatus;
  amountPaid?: number | null;
  exchangeRateUsed?: number | null;
  bankName?: string | null;
  transferReference?: string | null;
  paymentDate?: string | null;
  senderName?: string | null;
  notes?: string | null;
  rejectionReason?: string | null;
  validUntil?: string | null;
  confirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  listing?: {
    id: string;
    slug: string;
    listingTitle: string;
    brand: string;
    model: string;
    sellerType?: string;
    status: string;
    isBooked?: boolean;
  };
  proofs?: Array<{
    id: string;
    fileUrl: string;
    fileName: string;
  }>;
};

export type BookingFeeQuote = {
  bookingFeeRwf: number;
  currency: 'RWF';
};

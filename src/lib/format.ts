/** Frozen leftover-USD display rate. */
let usdToRwfEffective: number | null = null;

export function setUsdToRwfEffective(rate: number | null | undefined) {
  usdToRwfEffective =
    rate != null && Number.isFinite(rate) && rate > 0 ? rate : null;
}

export function getUsdToRwfEffective() {
  return usdToRwfEffective;
}

export function formatRwf(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Math.round(value))} Rwf`;
}

export function usdtToRwf(
  amountUsdt: number | null | undefined,
  rate: number | null | undefined = usdToRwfEffective,
): number | null {
  if (
    amountUsdt == null ||
    rate == null ||
    !Number.isFinite(amountUsdt) ||
    !Number.isFinite(rate)
  ) {
    return null;
  }
  return Math.round(amountUsdt * rate);
}

/** Format an amount settled in USD or RWF (no dual conversion). */
export function formatSettledAmount(
  value: number | null | undefined,
  currency: string | null | undefined,
) {
  if (value == null) return '—';
  if (currency === 'RWF') return formatRwf(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

/** USD-only label for parts, promotions, charging, and financing deposits. */
export function formatUsd(value: number | null | undefined) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function listingDisplayRwf(pricing?: {
  currency?: string | null;
  finalPriceRwf?: number | null;
  displayPriceRwf?: number | null;
  finalPriceUsd?: number | null;
} | null): number | null {
  if (!pricing) return null;
  if (pricing.finalPriceRwf != null) return Math.round(pricing.finalPriceRwf);
  if (pricing.displayPriceRwf != null)
    return Math.round(pricing.displayPriceRwf);
  return usdtToRwf(pricing.finalPriceUsd);
}

export function formatListingPrice(pricing?: {
  currency?: string | null;
  finalPriceRwf?: number | null;
  displayPriceRwf?: number | null;
  finalPriceUsd?: number | null;
} | null) {
  const amount = listingDisplayRwf(pricing);
  return amount == null ? 'Price on request' : formatRwf(amount);
}

export function formatInvoiceTotal(invoice?: {
  currency?: string | null;
  totalAmountRwf?: number | null;
  totalAmountUsd?: number | null;
} | null) {
  if (!invoice) return '—';
  if (invoice.totalAmountRwf != null) return formatRwf(invoice.totalAmountRwf);
  return formatRwf(usdtToRwf(invoice.totalAmountUsd));
}

export function formatBookingFee(booking?: {
  bookingFeeRwf?: number | null;
  bookingFeeUsd?: number | null;
} | null) {
  if (!booking) return '—';
  if (booking.bookingFeeRwf != null) return formatRwf(booking.bookingFeeRwf);
  return formatRwf(usdtToRwf(booking.bookingFeeUsd));
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(
    new Date(value),
  );
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

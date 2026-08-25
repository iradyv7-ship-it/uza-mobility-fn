import type { AdminPayment, InvoiceStatus } from '@/types/commerce';
import type { BuyerInvoice } from '@/types/buyer/commerce';
import { workspaceRoutes } from '@/config/routes';
import { wasSupersededByOtherBuyerText } from '@/lib/buyer/purchase-conflict';

/** Purchase still in progress — vehicle reserved or payment being reviewed. */
export const PENDING_PURCHASE_INVOICE_STATUSES: InvoiceStatus[] = [
  'SENT',
  'AWAITING_PAYMENT',
  'PAYMENT_SUBMITTED',
  'UNDER_VERIFICATION',
  'PARTIALLY_PAID',
];

/** Buyer can submit or complete payment. */
export const PAYABLE_INVOICE_STATUSES: InvoiceStatus[] = [
  'SENT',
  'AWAITING_PAYMENT',
  'PARTIALLY_PAID',
];

export const PAYMENT_REVIEW_INVOICE_STATUSES: InvoiceStatus[] = [
  'PAYMENT_SUBMITTED',
  'UNDER_VERIFICATION',
];

export const BUYER_CANCELLABLE_INVOICE_STATUSES: InvoiceStatus[] = [
  'SENT',
  'AWAITING_PAYMENT',
];

export function isPayableInvoiceStatus(status: InvoiceStatus): boolean {
  return PAYABLE_INVOICE_STATUSES.includes(status);
}

export function isCancellableByBuyerInvoiceStatus(
  status: InvoiceStatus,
): boolean {
  return BUYER_CANCELLABLE_INVOICE_STATUSES.includes(status);
}

export function isPendingPurchaseInvoiceStatus(status: InvoiceStatus): boolean {
  return PENDING_PURCHASE_INVOICE_STATUSES.includes(status);
}

export function findActiveBuyerInvoice(
  invoices: BuyerInvoice[] | undefined,
): BuyerInvoice | null {
  return (
    invoices?.find((invoice) =>
      isPendingPurchaseInvoiceStatus(invoice.status),
    ) ?? null
  );
}

export function latestInvoicePayment(
  invoice: Pick<BuyerInvoice, 'payments'>,
): AdminPayment | undefined {
  return invoice.payments?.[0];
}

export function invoicePaymentWasRejected(
  invoice: Pick<BuyerInvoice, 'status' | 'payments'>,
): boolean {
  const latest = latestInvoicePayment(invoice);
  return (
    latest?.status === 'REJECTED' && isPayableInvoiceStatus(invoice.status)
  );
}

export function invoiceLastRejectionReason(
  invoice: Pick<BuyerInvoice, 'status' | 'payments'>,
): string | null {
  if (!invoicePaymentWasRejected(invoice)) return null;
  return latestInvoicePayment(invoice)?.rejectionReason ?? null;
}

export function invoiceStatusHint(
  status: InvoiceStatus,
  notes?: string | null,
  paymentRejected = false,
): string | null {
  if (status === 'CANCELLED' && wasSupersededByOtherBuyerText(notes)) {
    return 'Another buyer completed payment first. This invoice was cancelled.';
  }
  switch (status) {
    case 'SENT':
    case 'AWAITING_PAYMENT':
      if (paymentRejected) {
        return 'Payment rejected — review the reason and submit again.';
      }
      return 'Submit your payment proof to continue.';
    case 'PARTIALLY_PAID':
      return 'Partial payment received — submit the remaining balance.';
    case 'PAYMENT_SUBMITTED':
    case 'UNDER_VERIFICATION':
      return 'Payment under review — we will notify you when confirmed.';
    case 'PAYMENT_CONFIRMED':
    case 'FULLY_PAID':
      return 'Payment confirmed — check your orders for fulfillment updates.';
    case 'EXPIRED':
      return 'This invoice has expired.';
    case 'CANCELLED':
    case 'REJECTED':
      return 'This invoice is no longer active.';
    default:
      return null;
  }
}

export function invoiceStatusHintFor(
  invoice: Pick<BuyerInvoice, 'status' | 'notes' | 'payments'>,
): string | null {
  return invoiceStatusHint(
    invoice.status,
    invoice.notes,
    invoicePaymentWasRejected(invoice),
  );
}

export function buyerInvoiceRequestHref(
  listing: { id: string; slug: string },
  request = true,
) {
  const params = new URLSearchParams({
    listingId: listing.id,
    slug: listing.slug,
  });
  if (request) params.set('request', '1');
  return `${workspaceRoutes.accountInvoices}?${params.toString()}`;
}

export function publicListingToSummary(listing: {
  id: string;
  listingTitle: string;
  slug: string;
  brand: string;
  model: string;
  manufacturingYear: number;
  status: string;
  listingPricing?: {
    finalPriceUsd: number;
    finalPriceRwf?: number | null;
    displayPriceRwf?: number | null;
    currency: string;
  } | null;
}) {
  return {
    id: listing.id,
    listingTitle: listing.listingTitle,
    slug: listing.slug,
    brand: listing.brand,
    model: listing.model,
    manufacturingYear: listing.manufacturingYear,
    status: listing.status,
    listingPricing: listing.listingPricing,
  };
}

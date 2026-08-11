import { workspaceRoutes } from '@/config/routes';
import type { VehicleBooking } from '@/types/buyer/bookings';
import type { BuyerInvoice, BuyerOrder } from '@/types/buyer/commerce';

export type BuyerListingInteractionKind = 'order' | 'invoice' | 'booking';

export type BuyerListingInteraction = {
  kind: BuyerListingInteractionKind;
  label: string;
  href: string;
  status: string;
  listingId: string;
};

const INACTIVE_BOOKING = new Set(['CANCELLED', 'REJECTED', 'EXPIRED']);

const INACTIVE_INVOICE = new Set([
  'CANCELLED',
  'EXPIRED',
  'REJECTED',
  'REFUNDED',
]);

const INACTIVE_ORDER = new Set(['CANCELLED']);

function humanizeStatus(status: string): string {
  return status.replaceAll('_', ' ').toLowerCase();
}

export function buildBuyerListingInteractions(input: {
  bookings?: VehicleBooking[];
  invoices?: BuyerInvoice[];
  orders?: BuyerOrder[];
}): Map<string, BuyerListingInteraction> {
  const map = new Map<string, BuyerListingInteraction>();

  for (const booking of input.bookings ?? []) {
    if (INACTIVE_BOOKING.has(booking.status)) continue;
    const listingId = booking.listingId;
    if (!listingId || map.has(listingId)) continue;
    map.set(listingId, {
      kind: 'booking',
      label: 'Your booking',
      href: `${workspaceRoutes.accountBookings}?bookingId=${booking.id}`,
      status: humanizeStatus(booking.status),
      listingId,
    });
  }

  for (const invoice of input.invoices ?? []) {
    if (!invoice.listingId || INACTIVE_INVOICE.has(invoice.status)) continue;
    const existing = map.get(invoice.listingId);
    // Prefer invoice over booking
    if (existing?.kind === 'order') continue;
    map.set(invoice.listingId, {
      kind: 'invoice',
      label: 'Your invoice',
      href: `${workspaceRoutes.accountInvoices}?highlight=${invoice.id}`,
      status: humanizeStatus(invoice.status),
      listingId: invoice.listingId,
    });
  }

  for (const order of input.orders ?? []) {
    if (INACTIVE_ORDER.has(order.status)) continue;
    const listingId = order.listingId;
    if (!listingId) continue;
    // Orders win over invoice/booking
    map.set(listingId, {
      kind: 'order',
      label: 'Your order',
      href: `${workspaceRoutes.accountOrders}?orderId=${order.id}`,
      status: humanizeStatus(order.status),
      listingId,
    });
  }

  return map;
}

export function getBuyerListingInteraction(
  map: Map<string, BuyerListingInteraction> | undefined,
  listingId: string,
): BuyerListingInteraction | null {
  return map?.get(listingId) ?? null;
}

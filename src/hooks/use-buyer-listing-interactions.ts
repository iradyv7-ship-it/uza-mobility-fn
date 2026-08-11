'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  buildBuyerListingInteractions,
  getBuyerListingInteraction,
  type BuyerListingInteraction,
} from '@/lib/buyer/listing-interactions';
import { useMyBookings } from '@/queries/bookings';
import { useMyInvoices, useMyOrders } from '@/queries/buyer';
import { isMeUser } from '@/types/auth/me-user';

const LIST_LIMIT = 50;

export function useBuyerListingInteractions() {
  const { data: session, status } = useSession();
  const me = isMeUser(session?.user) ? session.user : null;
  const isBuyer =
    status === 'authenticated' && Boolean(me?.roles.includes('BUYER'));

  const bookingsQuery = useMyBookings(
    { activeOnly: true, limit: LIST_LIMIT },
    isBuyer,
  );
  const invoicesQuery = useMyInvoices(
    { pendingPurchase: true, limit: LIST_LIMIT },
    isBuyer,
  );
  const ordersQuery = useMyOrders({ limit: LIST_LIMIT }, isBuyer);

  const map = useMemo(() => {
    if (!isBuyer) return new Map<string, BuyerListingInteraction>();
    return buildBuyerListingInteractions({
      bookings: bookingsQuery.data?.items,
      invoices: invoicesQuery.data?.items,
      orders: ordersQuery.data?.items,
    });
  }, [
    isBuyer,
    bookingsQuery.data?.items,
    invoicesQuery.data?.items,
    ordersQuery.data?.items,
  ]);

  return {
    isBuyer,
    isLoading:
      isBuyer &&
      (bookingsQuery.isLoading ||
        invoicesQuery.isLoading ||
        ordersQuery.isLoading),
    map,
    getInteraction: (listingId: string) =>
      getBuyerListingInteraction(map, listingId),
  };
}

export function useBuyerListingInteraction(
  listingId: string,
): BuyerListingInteraction | null {
  const { getInteraction, isBuyer } = useBuyerListingInteractions();
  if (!isBuyer) return null;
  return getInteraction(listingId);
}

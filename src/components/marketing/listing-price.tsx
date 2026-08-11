'use client';

import { usePriceCurrency } from '@/components/marketing/price-currency-provider';
import type { PublicListing } from '@/types/marketplace/public-listing';

type ListingPriceProps = {
  listing: PublicListing;
  className?: string;
};

export function ListingPrice({ listing, className }: ListingPriceProps) {
  const { formatAmount } = usePriceCurrency();
  const amount = listing.listingPricing?.finalPriceUsd;

  return <span className={className}>{formatAmount(amount)}</span>;
}

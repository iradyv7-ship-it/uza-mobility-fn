'use client';

import { formatListingPrice } from '@/lib/format';
import type { PublicListing } from '@/types/marketplace/public-listing';

type ListingPriceProps = {
  listing: PublicListing;
  className?: string;
};

export function ListingPrice({ listing, className }: ListingPriceProps) {
  return (
    <span className={className}>{formatListingPrice(listing.listingPricing)}</span>
  );
}

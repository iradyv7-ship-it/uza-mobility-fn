'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { ListingCard } from '@/components/marketing/listing-card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useWishlist } from '@/queries/wishlist';

export function BuyerWishlistPanel() {
  const wishlist = useWishlist();

  if (wishlist.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (wishlist.isError) {
    return (
      <p className="text-sm text-destructive">
        Unable to load your wishlist. Please try again.
      </p>
    );
  }

  const listings = wishlist.data ?? [];

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <Heart className="size-10 text-[#356769]/40" />
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[#151515]">
            No saved vehicles yet
          </h2>
          <p className="max-w-md text-sm text-[#356769]">
            Browse the marketplace and tap the heart on any vehicle to save it
            here.
          </p>
        </div>
        <Button asChild>
          <Link href="/vehicles">Browse vehicles</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}

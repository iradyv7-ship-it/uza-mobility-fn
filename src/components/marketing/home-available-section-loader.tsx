'use client';

import { useEffect, useState } from 'react';
import { HomeAvailableSection } from '@/components/marketing/home-available-section';
import { HomeAvailableSectionSkeleton } from '@/components/marketing/home-available-section-skeleton';
import { getLocalStockListings } from '@/lib/api/marketplace';
import type { PublicListing } from '@/types/marketplace/public-listing';

const HOME_LOCAL_STOCK_LIMIT = 4;

export function HomeAvailableSectionLoader() {
  const [listings, setListings] = useState<PublicListing[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    void getLocalStockListings()
      .then((items) => {
        if (!cancelled) {
          setListings(items.slice(0, HOME_LOCAL_STOCK_LIMIT));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setListings([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (listings === null) {
    return <HomeAvailableSectionSkeleton />;
  }

  return <HomeAvailableSection listings={listings} />;
}

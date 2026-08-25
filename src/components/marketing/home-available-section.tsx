import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ListingCard } from '@/components/marketing/listing-card';
import { brand } from '@/lib/marketing/colors';
import {
  marketingContainer,
  marketingWhiteSurface,
} from '@/lib/marketing/layout-classes';
import type { PublicListing } from '@/types/marketplace/public-listing';

type HomeAvailableSectionProps = {
  listings: PublicListing[];
};

export function HomeAvailableSection({ listings }: HomeAvailableSectionProps) {
  return (
    <section className={`${marketingWhiteSurface} py-12 sm:py-20`}>
      <div className={marketingContainer}>
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-[#151515]">
              Available Now in Kigali
            </h2>
            <p className="max-w-3xl text-[#356769]">
              Premium, UZA-inspected inventory. Physically verified and ready
              for immediate handover.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link
              href="/vehicles?stock=local"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium"
              style={{ color: brand.forest }}
            >
              View All
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        {listings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-[#E9E9E9] px-6 py-12 text-center text-[#356769]">
            New vehicles arriving soon. Check back for Kigali stock.
          </p>
        )}
      </div>
    </section>
  );
}

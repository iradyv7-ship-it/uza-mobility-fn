'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Car, Download, MapPin } from 'lucide-react';
import { WishlistButton } from '@/components/marketing/wishlist-button';
import { ListingPrice } from '@/components/marketing/listing-price';
import { PriceCurrencyToggle } from '@/components/marketing/price-currency-provider';
import { BuyerListingInteractionChip } from '@/components/marketing/buyer-listing-interaction-chip';
import { VehicleDetailGallery } from '@/components/marketing/vehicle-detail-gallery';
import { VehicleDetailBookingAction } from '@/components/marketing/vehicle-detail-booking-action';
import { VehicleDetailSidebarSpecs } from '@/components/marketing/vehicle-detail-sidebar-specs';
import { VehicleDetailSpecs } from '@/components/marketing/vehicle-detail-specs';
import {
  buildVehicleExtendedSpecGroups,
  buildVehicleSidebarSpecRows,
  formatHandoverLine,
  formatStockLocation,
  getListingPhotos,
  resolveListingVideoUrl,
} from '@/lib/marketing/listing-detail';
import { brand } from '@/lib/marketing/colors';
import {
  marketingContainer,
  marketingWhiteSurface,
} from '@/lib/marketing/layout-classes';
import { useBuyerListingInteraction } from '@/hooks/use-buyer-listing-interactions';
import type { PublicListing } from '@/types/marketplace/public-listing';

type VehicleDetailViewProps = {
  listing: PublicListing;
};

export function VehicleDetailView({ listing }: VehicleDetailViewProps) {
  const photos = getListingPhotos(listing);
  const sidebarSpecs = buildVehicleSidebarSpecRows(listing);
  const extendedSpecGroups = buildVehicleExtendedSpecGroups(listing);
  const buyerInteraction = useBuyerListingInteraction(listing.id);

  return (
    <div className={`${marketingWhiteSurface} py-8 sm:py-14`}>
      <div className={marketingContainer}>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_429px]">
          <div className="space-y-5">
            <VehicleDetailGallery
              photos={photos}
              title={listing.listingTitle}
              videoUrl={resolveListingVideoUrl(listing)}
            />

            <div className="rounded-2xl border border-[#E9E9E9] p-4 sm:p-8">
              {listing.description?.trim() ? (
                <div>
                  <h2 className="mb-4 text-lg font-semibold text-[#151515]">
                    Description
                  </h2>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-[#356769]">
                    {listing.description}
                  </p>
                </div>
              ) : null}

              {listing.brochureUrl ? (
                <div className="mt-4">
                  <a
                    href={listing.brochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold"
                    style={{
                      backgroundColor: brand.teal,
                      color: brand.white,
                    }}
                  >
                    <Download className="size-4" />
                    Download brochure
                  </a>
                </div>
              ) : null}
            </div>

            {extendedSpecGroups.length > 0 ? (
              <VehicleDetailSpecs groups={extendedSpecGroups} />
            ) : null}
          </div>

          <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <div className="rounded-2xl border border-[#E9E9E9] p-4 sm:p-8">
              <div className="flex items-start justify-between gap-3">
                <p
                  className="text-sm font-medium"
                  style={{ color: brand.teal }}
                >
                  The Price
                </p>
                <PriceCurrencyToggle />
              </div>
              <p className="mt-2 text-3xl font-semibold text-[#151515]">
                <ListingPrice listing={listing} />
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {buyerInteraction ? (
                  <BuyerListingInteractionChip interaction={buyerInteraction} />
                ) : null}
                {listing.isFullOption ? (
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: `${brand.lime}33`,
                      color: brand.forest,
                    }}
                  >
                    Full option
                  </span>
                ) : null}
                <WishlistButton listingId={listing.id} />
              </div>

              <div className="mt-6 space-y-4 text-sm text-[#151515]">
                <div className="flex gap-2">
                  <MapPin
                    className="mt-0.5 size-[18px] shrink-0"
                    style={{ color: brand.teal }}
                  />
                  <div>
                    <span className="font-medium" style={{ color: brand.teal }}>
                      Location
                    </span>
                    <p>{formatStockLocation(listing)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Car
                    className="mt-0.5 size-[18px] shrink-0"
                    style={{ color: brand.teal }}
                  />
                  <div>
                    <span className="font-medium" style={{ color: brand.teal }}>
                      Delivery
                    </span>
                    <p>{formatHandoverLine(listing)}</p>
                  </div>
                </div>
              </div>

              <VehicleDetailBookingAction listing={listing} />
            </div>

            <VehicleDetailSidebarSpecs rows={sidebarSpecs} />

            <div className="relative min-h-[260px] overflow-hidden rounded-2xl px-6 py-8">
              <div className="absolute inset-0" aria-hidden>
                <Image
                  src="/images/find-accessories.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 380px"
                />
              </div>
              <div className="absolute inset-0 bg-[#17443866]" aria-hidden />
              <div className="relative z-10 flex min-h-[196px] items-end">
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white md:text-4xl">
                    Accessories & Spare parts
                  </h2>
                  <Link
                    href="/spare-parts"
                    className="inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-semibold"
                    style={{
                      backgroundColor: brand.lime,
                      color: brand.forest,
                    }}
                  >
                    Find Accessories
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

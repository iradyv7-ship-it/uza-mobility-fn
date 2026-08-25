import { ListingCard } from '@/components/marketing/listing-card';
import { VehiclesBrowseToolbar } from '@/components/marketing/vehicles-browse-toolbar';
import { VehiclesFiltersSidebar } from '@/components/marketing/vehicles-filters-sidebar';
import { VehiclesHero } from '@/components/marketing/vehicles-hero';
import { VehiclesPagination } from '@/components/marketing/vehicles-pagination';
import {
  browseListings,
  getBrowseFilterOptions,
  getLocalStockListings,
} from '@/lib/api/marketplace';
import {
  parseVehiclesSearchParams,
  VEHICLES_PAGE_SIZE,
  type BrowseFilterOptions,
} from '@/lib/marketing/vehicles-browse';
import {
  marketingContainer,
  marketingWhiteSurface,
} from '@/lib/marketing/layout-classes';
import type { PublicListing } from '@/types/marketplace/public-listing';

type VehiclesPageAsyncProps = {
  rawSearchParams: Record<string, string | string[] | undefined>;
};

const emptyFilterOptions: BrowseFilterOptions = {
  brands: [],
  models: [],
  conditions: [],
  drivetrains: [],
  colors: [],
  cities: [],
  countries: [],
  batteryCapacitiesKwh: [],
  yearRange: null,
  mileageRange: null,
  priceRange: null,
};

export async function VehiclesPageAsync({
  rawSearchParams,
}: VehiclesPageAsyncProps) {
  const filters = parseVehiclesSearchParams(rawSearchParams);
  const isLocalStock = filters.stock === 'local';
  const page = filters.page ?? 1;

  let listings: PublicListing[] = [];
  let totalPages = 1;
  let filterOptions = emptyFilterOptions;

  try {
    if (isLocalStock) {
      listings = await getLocalStockListings();
      totalPages = 1;
    } else {
      const [result, options] = await Promise.all([
        browseListings({
          page,
          limit: VEHICLES_PAGE_SIZE,
          q: filters.q,
          category: filters.category,
          useCase: filters.useCase,
          sort: filters.sort,
          brand: filters.brand,
          model: filters.model,
          condition: filters.condition,
          drivetrain: filters.drivetrain,
          color: filters.color,
          city: filters.city,
          country: filters.country,
          batteryCapacityKwh: filters.batteryCapacityKwh,
          yearMin: filters.yearMin,
          yearMax: filters.yearMax,
          mileageMin: filters.mileageMin,
          mileageMax: filters.mileageMax,
          priceMin: filters.priceMin,
          priceMax: filters.priceMax,
        }),
        getBrowseFilterOptions({
          category: filters.category,
          brand: filters.brand,
        }),
      ]);
      listings = result.items;
      totalPages = Math.max(1, result.meta.totalPages);
      filterOptions = options;
    }
  } catch {
    listings = [];
  }

  const heroTitle = isLocalStock ? 'Available Now.' : 'Vehicles.';

  return (
    <>
      <VehiclesHero title={heroTitle} />
      <div className={marketingWhiteSurface}>
        <div className={`${marketingContainer} py-10 sm:py-14 lg:py-[60px]`}>
          {!isLocalStock ? (
            <VehiclesBrowseToolbar filters={filters} />
          ) : null}

          <div className="flex flex-col gap-8 max-lg:flex-col-reverse lg:flex-row lg:items-start lg:gap-8">
            {!isLocalStock ? (
              <VehiclesFiltersSidebar
                filters={filters}
                filterOptions={filterOptions}
              />
            ) : null}

            <div className="min-w-0 flex-1">
              {listings.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-[#E9E9E9] px-6 py-16 text-center text-[#356769]">
                  No vehicles match your filters.
                </p>
              )}

              {!isLocalStock ? (
                <VehiclesPagination
                  filters={filters}
                  currentPage={page}
                  totalPages={totalPages}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { Skeleton } from '@/components/ui/skeleton';
import { ListingGridSkeleton } from '@/components/marketing/listing-grid-skeleton';
import { VehiclesHero } from '@/components/marketing/vehicles-hero';
import {
  marketingContainer,
  marketingWhiteSurface,
} from '@/lib/marketing/layout-classes';

export function VehiclesPageContentSkeleton() {
  return (
    <div
      className={marketingWhiteSurface}
      aria-busy
      aria-label="Loading vehicles"
    >
      <div className={`${marketingContainer} py-10 sm:py-14 lg:py-[60px]`}>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end">
          <Skeleton className="h-11 flex-1 rounded-lg" />
          <Skeleton className="h-11 w-full max-w-[208px] rounded-lg" />
        </div>
        <div className="flex flex-col gap-8 max-lg:flex-col-reverse lg:flex-row lg:items-start lg:gap-8">
          <Skeleton className="h-64 w-full shrink-0 self-start rounded-lg lg:h-auto lg:w-72" />
          <div className="min-w-0 flex-1">
            <ListingGridSkeleton
              count={9}
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function VehiclesPageSkeleton() {
  return (
    <>
      <VehiclesHero />
      <VehiclesPageContentSkeleton />
    </>
  );
}

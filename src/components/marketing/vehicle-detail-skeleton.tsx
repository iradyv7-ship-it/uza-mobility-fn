import { Skeleton } from '@/components/ui/skeleton';
import {
  marketingContainer,
  marketingForestSurface,
  marketingWhiteSurface,
} from '@/lib/marketing/layout-classes';

export function VehicleDetailHeroSkeleton() {
  return (
    <section
      className={`relative h-[min(650px,85vh)] w-full overflow-hidden ${marketingForestSurface}`}
      aria-hidden
    >
      <Skeleton className="absolute inset-0 rounded-none bg-white/10" />
      <div className="relative z-10 flex h-full items-end justify-center px-4 pt-24 pb-10 sm:pt-28 sm:pb-16">
        <div className="w-full max-w-3xl space-y-3 text-center">
          <Skeleton className="mx-auto h-10 w-3/4 max-w-lg bg-white/20" />
          <Skeleton className="mx-auto h-6 w-1/2 max-w-xs bg-white/15" />
        </div>
      </div>
    </section>
  );
}

export function VehicleDetailContentSkeleton() {
  return (
    <div
      className={`${marketingWhiteSurface} py-8 sm:py-14`}
      aria-busy
      aria-label="Loading vehicle details"
    >
      <div className={marketingContainer}>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_429px]">
          <div className="space-y-5">
            <Skeleton className="aspect-[859/528] w-full rounded-2xl" />

            <div className="space-y-4 rounded-2xl border border-[#E9E9E9] p-4 sm:p-8">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            <div className="space-y-4 rounded-2xl border border-[#E9E9E9] p-4 sm:p-8">
              <Skeleton className="h-6 w-40" />
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-4 rounded-2xl border border-[#E9E9E9] p-4 sm:p-8">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-44" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
              </div>
              <div className="space-y-3 pt-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="mt-2 h-11 w-full rounded-full" />
            </div>

            <div className="space-y-3 rounded-2xl border border-[#E9E9E9] p-4 sm:p-8">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex justify-between gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>

            <Skeleton className="min-h-[260px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

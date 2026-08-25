'use client';

import Link from 'next/link';
import { useAppRouter } from '@/lib/navigation/use-app-router';
import { useCallback, useTransition } from 'react';
import { useMarketingCategories } from '@/components/marketing/marketing-catalog-context';
import { VehiclesFilterSelect } from '@/components/marketing/vehicles-filter-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { brand } from '@/lib/marketing/colors';
import { sortPublicCategories } from '@/lib/marketing/marketing-catalog-nav';
import {
  applyVehiclesSearchPatch,
  formatConditionLabel,
  type BrowseFilterOptions,
  type VehiclesSearchParams,
} from '@/lib/marketing/vehicles-browse';
import { vehiclesHref } from '@/lib/marketing/vehicles-url';
import type { CategoryType } from '@/types/catalog';

const VEHICLE_CATEGORY_TYPES: CategoryType[] = [
  'PASSENGER_EV',
  'TWO_THREE_WHEEL',
  'COMMERCIAL_EV',
  'EV_PARTS_ACCESSORIES',
];

type VehiclesFiltersSidebarProps = {
  filters: VehiclesSearchParams;
  filterOptions: BrowseFilterOptions;
  disabled?: boolean;
};

export function VehiclesFiltersSidebar({
  filters,
  filterOptions,
  disabled,
}: VehiclesFiltersSidebarProps) {
  const router = useAppRouter();
  const [, startTransition] = useTransition();
  const categories = useMarketingCategories();
  const categoryTabs = sortPublicCategories(categories).filter((c) =>
    VEHICLE_CATEGORY_TYPES.includes(c.type),
  );

  const navigate = useCallback(
    (next: VehiclesSearchParams) => {
      startTransition(() => {
        router.push(vehiclesHref(next));
      });
    },
    [router],
  );

  const patch = (p: Partial<VehiclesSearchParams>) =>
    navigate(applyVehiclesSearchPatch(filters, p));

  const hasActiveFilters =
    filters.category ||
    filters.brand ||
    filters.model ||
    filters.condition ||
    filters.priceMin != null ||
    filters.priceMax != null;

  const filterFields = (
    <div className="flex flex-col gap-5">
      {categoryTabs.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#151515]">Category</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={vehiclesHref(
                applyVehiclesSearchPatch(filters, {
                  category: undefined,
                }),
              )}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                !filters.category
                  ? 'border-transparent font-medium text-white'
                  : 'border-[#E9E9E9] text-[#356769] hover:border-[#174438]/30'
              }`}
              style={
                !filters.category
                  ? { backgroundColor: brand.forest }
                  : undefined
              }
            >
              All
            </Link>
            {categoryTabs.map((cat) => {
              const active = filters.category === cat.slug;
              return (
                <Link
                  key={cat.slug}
                  href={vehiclesHref(
                    applyVehiclesSearchPatch(filters, {
                      category: cat.slug,
                    }),
                  )}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? 'border-transparent font-medium text-white'
                      : 'border-[#E9E9E9] text-[#356769] hover:border-[#174438]/30'
                  }`}
                  style={active ? { backgroundColor: brand.forest } : undefined}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <VehiclesFilterSelect
        label="Make"
        placeholder="Any make"
        value={filters.brand}
        disabled={disabled}
        options={filterOptions.brands.map((b) => ({ value: b, label: b }))}
        onChange={(brandValue) => patch({ brand: brandValue })}
      />

      <VehiclesFilterSelect
        label="Model"
        placeholder="Any model"
        value={filters.model}
        disabled={disabled || !filters.brand}
        options={filterOptions.models.map((m) => ({ value: m, label: m }))}
        onChange={(model) => patch({ model })}
      />

      <VehiclesFilterSelect
        label="Condition"
        placeholder="Any condition"
        value={filters.condition}
        disabled={disabled}
        options={filterOptions.conditions.map((c) => ({
          value: c,
          label: formatConditionLabel(c),
        }))}
        onChange={(condition) => patch({ condition })}
      />

      <div className="space-y-2">
        <Label className="text-sm font-medium text-[#151515]">
          Price (Rwf)
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            inputMode="numeric"
            disabled={disabled}
            placeholder={
              filterOptions.priceRange
                ? String(filterOptions.priceRange.min)
                : 'Min'
            }
            value={filters.priceMin ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              patch({
                priceMin:
                  v === ''
                    ? undefined
                    : Number.isFinite(Number(v))
                      ? Number(v)
                      : undefined,
              });
            }}
            className="h-11"
          />
          <Input
            type="number"
            inputMode="numeric"
            disabled={disabled}
            placeholder={
              filterOptions.priceRange
                ? String(filterOptions.priceRange.max)
                : 'Max'
            }
            value={filters.priceMax ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              patch({
                priceMax:
                  v === ''
                    ? undefined
                    : Number.isFinite(Number(v))
                      ? Number(v)
                      : undefined,
              });
            }}
            className="h-11"
          />
        </div>
      </div>

      {hasActiveFilters ? (
        <Link
          href={vehiclesHref({
            q: filters.q,
            sort: filters.sort,
            stock: filters.stock,
          })}
          className="text-center text-sm font-medium hover:underline"
          style={{ color: brand.forest }}
        >
          Clear filters
        </Link>
      ) : null}
    </div>
  );

  return (
    <div className="w-full shrink-0 self-start lg:w-72">
      <details className="overflow-hidden rounded-lg border border-[#E9E9E9] bg-white lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-medium text-[#151515] [&::-webkit-details-marker]:hidden">
          <span>Filters</span>
          {hasActiveFilters ? (
            <span className="text-xs font-normal text-[#356769]">Active</span>
          ) : null}
        </summary>
        <div className="border-t border-[#E9E9E9] p-4 pt-3">{filterFields}</div>
      </details>

      <aside
        className="hidden rounded-lg border border-[#E9E9E9] bg-white lg:block"
        aria-label="Vehicle filters"
      >
        <div className="p-4">{filterFields}</div>
      </aside>
    </div>
  );
}

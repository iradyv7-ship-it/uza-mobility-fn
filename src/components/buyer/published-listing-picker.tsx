'use client';

import { useMemo, useState } from 'react';
import { SearchablePicker } from '@/components/shared/searchable-picker';
import type { SearchablePickerOption } from '@/components/shared/searchable-picker';
import { formatListingPrice } from '@/lib/format';
import { useDebounce } from '@/hooks/use-debounce';
import { PUBLIC_LISTINGS_PAGE_LIMIT } from '@/lib/api/buyer';
import { usePublishedListings } from '@/queries/buyer';
import type { PublicListingSummary } from '@/types/buyer/commerce';

export function publishedListingToOption(
  listing: PublicListingSummary,
): SearchablePickerOption {
  const price = formatListingPrice(listing.listingPricing);
  return {
    value: listing.id,
    label: listing.listingTitle,
    hint: [
      `${listing.brand} ${listing.model}`,
      listing.manufacturingYear,
      price !== 'Price on request' ? price : null,
    ]
      .filter(Boolean)
      .join(' · '),
  };
}

type PublishedListingPickerProps = {
  label: string;
  value: string;
  onValueChange: (
    listingId: string,
    listing: PublicListingSummary | null,
  ) => void;
  /** When false, skips fetching (e.g. closed dialog). */
  enabled?: boolean;
  selectedListing?: PublicListingSummary | null;
  placeholder?: string;
  helperText?: string;
  error?: string;
  allowClear?: boolean;
};

export function PublishedListingPicker({
  label,
  value,
  onValueChange,
  enabled = false,
  selectedListing = null,
  placeholder = 'Select a vehicle listing',
  helperText = 'Only published listings available to buy.',
  error,
  allowClear = false,
}: PublishedListingPickerProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const listingFilters = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      limit: PUBLIC_LISTINGS_PAGE_LIMIT,
    }),
    [debouncedSearch],
  );

  const { data, isLoading } = usePublishedListings(listingFilters, enabled);

  const options = useMemo(
    () => data?.items.map(publishedListingToOption) ?? [],
    [data?.items],
  );

  const selectedOption = selectedListing
    ? publishedListingToOption(selectedListing)
    : null;

  return (
    <SearchablePicker
      label={label}
      value={value}
      onValueChange={(nextValue) => {
        if (!nextValue) {
          onValueChange('', null);
          setSearch('');
          return;
        }
        const listing = data?.items.find((row) => row.id === nextValue) ?? null;
        onValueChange(nextValue, listing);
      }}
      options={options}
      selectedOption={selectedOption}
      search={search}
      onSearchChange={setSearch}
      isLoading={isLoading}
      placeholder={placeholder}
      searchPlaceholder="Search by title, brand, or model"
      emptyMessage="No published listings match that search."
      helperText={helperText}
      error={error}
      allowClear={allowClear}
    />
  );
}

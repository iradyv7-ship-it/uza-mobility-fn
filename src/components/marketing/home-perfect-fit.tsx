'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { HomePerfectFitSkeleton } from '@/components/marketing/home-perfect-fit-skeleton';
import { ListingCard } from '@/components/marketing/listing-card';
import { ListingGridSkeleton } from '@/components/marketing/listing-grid-skeleton';
import {
  useMarketingCatalogLoading,
  useMarketingCategories,
} from '@/components/marketing/marketing-catalog-context';
import { browseListings } from '@/lib/api/marketplace';
import { buildPerfectFitTabs } from '@/lib/marketing/marketing-catalog-nav';
import { brand } from '@/lib/marketing/colors';
import {
  marketingContainer,
  marketingWhiteSurface,
} from '@/lib/marketing/layout-classes';
import { vehiclesHref } from '@/lib/marketing/vehicles-url';
import type { PublicListing } from '@/types/marketplace/public-listing';

export function HomePerfectFit() {
  const categories = useMarketingCategories();
  const catalogLoading = useMarketingCatalogLoading();
  const tabs = useMemo(() => buildPerfectFitTabs(categories), [categories]);

  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [listings, setListings] = useState<PublicListing[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0] ?? null;

  useEffect(() => {
    if (tabs.length === 0) {
      setActiveTabId(null);
      return;
    }
    if (!activeTabId || !tabs.some((t) => t.id === activeTabId)) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId]);

  const load = useCallback(async (categorySlug: string, pageNum: number) => {
    setLoading(true);
    try {
      const result = await browseListings({
        limit: 8,
        page: pageNum,
        category: categorySlug,
      });
      setListings(result.items);
      setTotalPages(result.meta.totalPages);
    } catch {
      setListings([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activeTab) {
      setListings([]);
      setLoading(false);
      return;
    }
    void load(activeTab.categorySlug, page);
  }, [activeTab, page, load]);

  const onTabChange = (tabId: string) => {
    setActiveTabId(tabId);
    setPage(1);
  };

  if (catalogLoading) {
    return <HomePerfectFitSkeleton />;
  }

  if (tabs.length === 0) {
    return null;
  }

  return (
    <section className={`${marketingWhiteSurface} py-20`}>
      <div className={marketingContainer}>
        <div className="mb-10 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="text-3xl font-semibold text-[#151515]">
              Find Your Perfect Fit
            </h2>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              {activeTab ? (
                <Link
                  href={vehiclesHref({ category: activeTab.categorySlug })}
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-medium"
                  style={{ color: brand.forest }}
                >
                  View All
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-8 border-b border-transparent">
            {tabs.map((tab) => {
              const active = tab.id === activeTab?.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`pb-3 text-sm transition-colors ${
                    active
                      ? 'font-medium'
                      : 'text-[#356769] hover:text-[#174438]'
                  }`}
                  style={active ? { color: brand.forest } : undefined}
                >
                  <span className="block">{tab.label}</span>
                  {active ? (
                    <span
                      className="mt-3 block h-0.5 w-full rounded-full"
                      style={{ backgroundColor: brand.forest }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <ListingGridSkeleton count={8} />
        ) : listings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-[#E9E9E9] px-6 py-12 text-center text-[#356769]">
            No vehicles in this category yet.
          </p>
        )}

        <div className="mt-6 flex gap-4">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex size-10 items-center justify-center rounded-full border-2 disabled:opacity-40"
            style={{ borderColor: brand.forest, color: brand.forest }}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            className="flex size-10 items-center justify-center rounded-full border-2 disabled:opacity-40"
            style={{ borderColor: brand.forest, color: brand.forest }}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getPublicCategories } from '@/lib/api/catalog';
import type { Category } from '@/types/catalog';

type MarketingCatalogState = {
  categories: Category[];
  isLoading: boolean;
};

const MarketingCatalogContext = createContext<MarketingCatalogState>({
  categories: [],
  isLoading: true,
});

export function MarketingCatalogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void getPublicCategories()
      .then((items) => {
        if (!cancelled) {
          setCategories(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCategories([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MarketingCatalogContext.Provider value={{ categories, isLoading }}>
      {children}
    </MarketingCatalogContext.Provider>
  );
}

export function useMarketingCategories(): Category[] {
  return useContext(MarketingCatalogContext).categories;
}

export function useMarketingCatalogLoading(): boolean {
  return useContext(MarketingCatalogContext).isLoading;
}

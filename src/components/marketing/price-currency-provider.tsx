'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/api';
import {
  formatListingPrice,
  formatRwf,
  listingDisplayRwf,
  setUsdToRwfEffective,
  usdtToRwf,
} from '@/lib/format';
import type { PublicListing } from '@/types/marketplace/public-listing';

export type ExchangeRateSnapshot = {
  usdToRwfApi: number;
  usdToRwfEffective: number;
  markupPercent: number;
  rateFetchedAt: string | null;
  baseCurrency: 'USDT';
  quoteCurrency: 'RWF';
  frozen?: boolean;
};

type PriceCurrencyContextValue = {
  rate: ExchangeRateSnapshot | null;
  isLoading: boolean;
  formatAmount: (amountUsdt: number | null | undefined) => string;
  formatListing: (listing: PublicListing) => string;
};

const PriceCurrencyContext = createContext<PriceCurrencyContextValue | null>(
  null,
);

export function PriceCurrencyProvider({ children }: { children: ReactNode }) {
  const { data: rate, isLoading } = useQuery({
    queryKey: ['exchange-rate'],
    queryFn: () => apiFetch<ExchangeRateSnapshot>('/exchange-rate'),
    staleTime: 60 * 60 * 1000,
  });

  useEffect(() => {
    setUsdToRwfEffective(rate?.usdToRwfEffective ?? null);
  }, [rate?.usdToRwfEffective]);

  const formatAmount = useCallback(
    (amountUsdt: number | null | undefined) => {
      if (amountUsdt == null) return 'Price on request';
      const rwf = usdtToRwf(amountUsdt, rate?.usdToRwfEffective);
      return rwf == null ? 'Price on request' : formatRwf(rwf);
    },
    [rate?.usdToRwfEffective],
  );

  const formatListing = useCallback((listing: PublicListing) => {
    return formatListingPrice(listing.listingPricing);
  }, []);

  const value = useMemo(
    () => ({
      rate: rate ?? null,
      isLoading,
      formatAmount,
      formatListing,
    }),
    [formatAmount, formatListing, isLoading, rate],
  );

  return (
    <PriceCurrencyContext.Provider value={value}>
      {children}
    </PriceCurrencyContext.Provider>
  );
}

export function usePriceCurrency() {
  const ctx = useContext(PriceCurrencyContext);
  if (!ctx) {
    throw new Error(
      'usePriceCurrency must be used within PriceCurrencyProvider',
    );
  }
  return ctx;
}

export { listingDisplayRwf };

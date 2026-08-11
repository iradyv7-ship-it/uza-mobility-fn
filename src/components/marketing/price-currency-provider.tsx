'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/api';
import { setUsdToRwfEffective } from '@/lib/format';

export type DisplayCurrency = 'RWF' | 'USD';

export type ExchangeRateSnapshot = {
  usdToRwfApi: number;
  usdToRwfEffective: number;
  markupPercent: number;
  rateFetchedAt: string | null;
  baseCurrency: 'USDT';
  quoteCurrency: 'RWF';
};

const STORAGE_KEY = 'uza-price-currency';

type PriceCurrencyContextValue = {
  currency: DisplayCurrency;
  setCurrency: (value: DisplayCurrency) => void;
  rate: ExchangeRateSnapshot | null;
  isLoading: boolean;
  /** Single currency based on the guest toggle (USD or Rwf). */
  formatAmount: (amountUsdt: number | null | undefined) => string;
};

const PriceCurrencyContext = createContext<PriceCurrencyContextValue | null>(
  null,
);

function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatRwf(amount: number): string {
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount))} Rwf`;
}

export function PriceCurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<DisplayCurrency>('RWF');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // Migrate older USDT preference to USD.
    if (stored === 'USDT' || stored === 'USD') {
      setCurrencyState('USD');
    } else if (stored === 'RWF') {
      setCurrencyState('RWF');
    }
    setHydrated(true);
  }, []);

  const setCurrency = useCallback((value: DisplayCurrency) => {
    setCurrencyState(value);
    window.localStorage.setItem(STORAGE_KEY, value);
  }, []);

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
      if (currency === 'USD' || !rate?.usdToRwfEffective) {
        return formatUsd(amountUsdt);
      }
      return formatRwf(amountUsdt * rate.usdToRwfEffective);
    },
    [currency, rate?.usdToRwfEffective],
  );

  const value = useMemo(
    () => ({
      currency: hydrated ? currency : 'RWF',
      setCurrency,
      rate: rate ?? null,
      isLoading,
      formatAmount,
    }),
    [currency, formatAmount, hydrated, isLoading, rate, setCurrency],
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

export function PriceCurrencyToggle({ className }: { className?: string }) {
  const { currency, setCurrency } = usePriceCurrency();

  return (
    <div
      className={
        className ??
        'inline-flex rounded-full border border-[#E9E9E9] bg-white p-0.5 text-xs font-semibold'
      }
      role="group"
      aria-label="Price currency"
    >
      {(['RWF', 'USD'] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setCurrency(option)}
          className={`rounded-full px-3 py-1.5 transition-colors ${
            currency === option
              ? 'bg-[#174438] text-white'
              : 'text-[#356769] hover:bg-[#f4f4f4]'
          }`}
        >
          {option === 'RWF' ? 'Rwf' : 'USD'}
        </button>
      ))}
    </div>
  );
}

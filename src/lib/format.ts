/** Module-level FX cache so existing formatUsd(...) call sites show dual currency. */
let usdToRwfEffective: number | null = null;

export function setUsdToRwfEffective(rate: number | null | undefined) {
  usdToRwfEffective =
    rate != null && Number.isFinite(rate) && rate > 0 ? rate : null;
}

export function getUsdToRwfEffective() {
  return usdToRwfEffective;
}

export function formatRwf(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Math.round(value))} Rwf`;
}

export function usdtToRwf(
  amountUsdt: number | null | undefined,
  rate: number | null | undefined = usdToRwfEffective,
): number | null {
  if (
    amountUsdt == null ||
    rate == null ||
    !Number.isFinite(amountUsdt) ||
    !Number.isFinite(rate)
  ) {
    return null;
  }
  return Math.round(amountUsdt * rate);
}

/** Format an amount settled in USD or RWF (no dual conversion). */
export function formatSettledAmount(
  value: number | null | undefined,
  currency: string | null | undefined,
) {
  if (value == null) return '—';
  if (currency === 'RWF') return formatRwf(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

/** USD/USDT amount with approximate Rwf when the exchange rate is available. */
export function formatUsd(value: number | null | undefined) {
  if (value == null) return '—';
  const primary = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
  const rwf = usdtToRwf(value);
  if (rwf == null) return primary;
  return `${primary} (≈ ${formatRwf(rwf)})`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(
    new Date(value),
  );
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

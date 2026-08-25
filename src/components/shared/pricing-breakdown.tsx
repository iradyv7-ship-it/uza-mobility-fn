'use client';

import { formatRwf } from '@/lib/format';
import type { PriceBreakdown } from '@/types/pricing';

function formatAmountWithPercent(
  amount: number | undefined,
  ratePercent?: number,
): string {
  const formatted = formatRwf(amount);
  if (ratePercent != null && ratePercent > 0) {
    const displayRate =
      ratePercent % 1 === 0 ? ratePercent.toFixed(0) : ratePercent.toFixed(2);
    return `${formatted} (${displayRate}%)`;
  }
  return formatted;
}

function Line({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-4 text-sm ${emphasis ? 'font-medium' : ''}`}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

type PricingBreakdownProps = {
  breakdown: PriceBreakdown | null | undefined;
  loading?: boolean;
  sellerType?: string;
};

export function PricingBreakdown({
  breakdown,
  loading,
  sellerType,
}: PricingBreakdownProps) {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Calculating estimate…</p>
    );
  }

  if (!breakdown) {
    return null;
  }

  const type = sellerType ?? breakdown.sellerType;
  const showDiscount =
    (breakdown.ruleDiscountRwf ?? 0) > 0 ||
    breakdown.ruleDiscountRatePercent != null;

  const discountLine = showDiscount ? (
    <Line
      label="Discount"
      value={formatAmountWithPercent(
        breakdown.ruleDiscountRwf,
        breakdown.ruleDiscountRatePercent,
      )}
    />
  ) : null;

  const listPriceLine = (
    <Line
      label="Buyer pays (list price)"
      value={formatRwf(breakdown.finalPriceRwf)}
      emphasis
    />
  );

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Buyer price breakdown
      </p>
      {type === 'LOCAL_SELLER' ? (
        <>
          <Line
            label="Seller payout"
            value={formatRwf(breakdown.sellerDesiredPayoutRwf)}
          />
          <Line
            label="Platform commission"
            value={formatRwf(breakdown.commissionRwf)}
          />
          {discountLine}
          {listPriceLine}
        </>
      ) : type === 'INTERNATIONAL_SELLER' ? (
        <>
          <Line label="FOB price" value={formatRwf(breakdown.fobPriceRwf)} />
          <Line label="Shipping" value={formatRwf(breakdown.shippingCostRwf)} />
          <Line
            label="Local charges"
            value={formatRwf(breakdown.localChargesRwf)}
          />
          <Line
            label="Taxes (est.)"
            value={formatRwf(breakdown.taxesEstimateRwf)}
          />
          {breakdown.marginRwf != null ? (
            <Line
              label="Platform margin"
              value={formatAmountWithPercent(
                breakdown.marginRwf,
                breakdown.platformMarginRatePercent,
              )}
            />
          ) : null}
          {discountLine}
          {listPriceLine}
        </>
      ) : (
        listPriceLine
      )}
    </div>
  );
}

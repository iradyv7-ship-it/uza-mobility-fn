'use client';

import Link from 'next/link';
import { brand } from '@/lib/marketing/colors';
import type { BuyerListingInteraction } from '@/lib/buyer/listing-interactions';
import { cn } from '@/lib/utils';

type BuyerListingInteractionChipProps = {
  interaction: BuyerListingInteraction;
  className?: string;
  /** When true, chip sits over a card image and must capture clicks above the card Link. */
  overlay?: boolean;
};

export function BuyerListingInteractionChip({
  interaction,
  className,
  overlay = false,
}: BuyerListingInteractionChipProps) {
  return (
    <Link
      href={interaction.href}
      className={cn(
        'inline-flex max-w-full items-center rounded-full px-3 py-1 text-xs font-semibold',
        overlay && 'pointer-events-auto relative z-[3]',
        className,
      )}
      style={{ backgroundColor: brand.forest, color: brand.white }}
      title={interaction.status}
      onClick={(event) => event.stopPropagation()}
    >
      <span className="truncate">{interaction.label}</span>
    </Link>
  );
}

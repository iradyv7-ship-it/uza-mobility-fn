'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { brand } from '@/lib/marketing/colors';
import { partCompatibilityLabel } from '@/lib/marketing/part-display';
import { formatUsd } from '@/lib/format';
import type { PublicPart } from '@/types/marketplace/public-part';
import { ArrowUpRight } from 'lucide-react';

type PublicPartCardProps = {
  part: PublicPart;
};

function primaryPhoto(part: PublicPart) {
  return (
    part.photos.find((photo) => photo.isPrimary)?.url ??
    part.photos[0]?.url ??
    null
  );
}

export function PublicPartCard({ part }: PublicPartCardProps) {
  const imageUrl = primaryPhoto(part);
  const compatibility = partCompatibilityLabel(part);
  const inStock = part.stockQuantity > 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#E9E9E9] bg-white">
      <div className="relative aspect-[318/212] w-full bg-[#f4f4f4]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={part.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 318px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#356769]">
            No photo
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 border-t border-[#E9E9E9] p-5 sm:p-6">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[#151515]">
            {part.name}
          </h3>
          {compatibility ? (
            <p className="text-sm leading-snug text-[#356769]">
              {compatibility}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <p className="text-lg font-semibold text-[#151515]">
            {formatUsd(part.priceUsd)}
          </p>
          <Button
            type="button"
            size="sm"
            disabled={!inStock}
            className="h-9 shrink-0 cursor-pointer border-0 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: brand.white, color: brand.forest }}
          >
            Add to Cart
            <ArrowUpRight className="size-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}

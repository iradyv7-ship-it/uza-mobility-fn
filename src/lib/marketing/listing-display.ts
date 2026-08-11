import { siteConfig } from '@/config/site';
import type { PublicListing } from '@/types/marketplace/public-listing';

/** Normalize API photo URLs for next/image (proxied /uploads + legacy Cloudinary). */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  const apiBase = siteConfig.apiUrl.replace(/\/$/, '');

  // API file storage — same-origin path (see next.config rewrites → backend /uploads)
  if (trimmed.startsWith(`${apiBase}/uploads/`)) {
    return trimmed.slice(apiBase.length);
  }
  if (trimmed.startsWith('/uploads/')) {
    return trimmed;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return trimmed;
}

export function getListingPrimaryPhoto(listing: PublicListing): string | null {
  const photos = listing.photos ?? [];
  if (photos.length === 0) return null;
  const primary = photos.find((p) => p.isPrimary) ?? photos[0];
  return resolveMediaUrl(primary?.url ?? null);
}
export function formatListingPrice(listing: PublicListing): string {
  const price = listing.listingPricing?.finalPriceUsd;
  if (price == null) return 'Price on request';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

/** Format stored USD/USDT amount for public display (USDT label). */
export function formatListingPriceUsdt(amountUsdt: number): string {
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amountUsdt)} USDT`;
}

export function formatListingPriceRwf(
  amountUsdt: number,
  usdToRwfEffective: number,
): string {
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Math.round(amountUsdt * usdToRwfEffective))} Rwf`;
}

export function formatDrivetrainLabel(
  drivetrain?: string | null,
): string | null {
  if (!drivetrain) return null;
  const map: Record<string, string> = {
    FWD: 'FWD',
    RWD: 'RWD',
    AWD: 'AWD',
    FOUR_WD: '4WD',
  };
  return map[drivetrain] ?? drivetrain.replace(/_/g, ' ');
}

export function listingSubtitle(listing: PublicListing): string {
  const parts: string[] = [];
  const kwh = listing.evSpecs?.batteryCapacityKwh;
  if (kwh != null) parts.push(`${kwh} kWh`);
  if (listing.trim) parts.push(listing.trim);
  if (listing.subcategory?.name) parts.push(listing.subcategory.name);
  else if (listing.category?.name) parts.push(listing.category.name);
  if (parts.length > 0) return parts.join(' · ');
  return `${listing.brand} ${listing.model} · ${listing.manufacturingYear}`;
}

export function listingDetailHref(slug: string): string {
  return `/vehicles/${slug}`;
}

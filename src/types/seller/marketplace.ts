import type { ListingStatus } from '@/types/catalog';

export type SellerListingPhoto = {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  displayOrder: number;
};

export type SellerListingCategory = {
  id: string;
  name: string;
  slug: string;
  type: string;
};

export type SellerListingEvSpecs = {
  rangeKm: number | null;
  batteryHealthPercent: number | null;
  chargingType?: string | null;
  batteryHealthReport?: boolean;
};

export type SellerListingPricing = {
  finalPriceUsd: number;
  finalPriceRwf?: number | null;
  displayPriceRwf?: number | null;
  currency: string;
  basePriceUsd?: number | null;
  fobPriceUsd?: number | null;
  sellerDesiredPayoutUsd?: number | null;
  commissionUsd?: number | null;
  shippingCostUsd?: number | null;
  localChargesUsd?: number | null;
  taxesEstimateUsd?: number | null;
  insuranceUsd?: number | null;
  marginUsd?: number | null;
  landingCostUsd?: number | null;
  discountUsd?: number | null;
  basePriceRwf?: number | null;
  fobPriceRwf?: number | null;
  sellerDesiredPayoutRwf?: number | null;
  commissionRwf?: number | null;
  shippingCostRwf?: number | null;
  localChargesRwf?: number | null;
  taxesEstimateRwf?: number | null;
  insuranceRwf?: number | null;
  marginRwf?: number | null;
  landingCostRwf?: number | null;
  discountRwf?: number | null;
};

export type SellerListing = {
  id: string;
  listingTitle: string;
  slug: string;
  status: ListingStatus;
  brand: string;
  model: string;
  trim: string | null;
  manufacturingYear: number;
  isNew: boolean;
  condition: string;
  mileageKm: number | null;
  description: string | null;
  vehicleLocation: string | null;
  city: string | null;
  country: string;
  sellerType: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  category: SellerListingCategory;
  subcategory: { id: string; name: string; slug: string } | null;
  listingPricing: SellerListingPricing | null;
  evSpecs: SellerListingEvSpecs | null;
  photos: SellerListingPhoto[];
  rejectionReason?: string;
};

export type SellerPartPhoto = {
  id: string;
  url: string;
  isPrimary: boolean;
};

export type PartStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export type SellerPart = {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  condition: string;
  priceUsd: number;
  stockQuantity: number;
  stockLabel: string;
  deliveryEstimate: string | null;
  description: string | null;
  status: PartStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  photos: SellerPartPhoto[];
  rejectionReason?: string;
};

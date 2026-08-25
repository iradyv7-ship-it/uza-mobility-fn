import type {
  CreateSellerListingInput,
  SellerListingFormInput,
  UpdateSellerListingInput,
} from '@/schemas/seller';
import type { SellerListing } from '@/types/seller/marketplace';
import { listingConditions } from '@/schemas/marketplace';
import { usdtToRwf } from '@/lib/format';

export function sellerListingToFormValues(
  listing: SellerListing,
): SellerListingFormInput {
  return {
    sellerType:
      listing.sellerType === 'INTERNATIONAL_SELLER'
        ? 'INTERNATIONAL_SELLER'
        : 'LOCAL_SELLER',
    listingTitle: listing.listingTitle,
    categoryId: listing.category.id,
    brand: listing.brand,
    model: listing.model,
    trim: listing.trim ?? '',
    manufacturingYear: listing.manufacturingYear,
    condition: (listingConditions as readonly string[]).includes(
      listing.condition,
    )
      ? (listing.condition as SellerListingFormInput['condition'])
      : 'GOOD',
    vehicleLocation: listing.vehicleLocation ?? '',
    city: listing.city ?? '',
    country: listing.country,
    description: listing.description ?? '',
    mileageKm: listing.mileageKm ?? undefined,
    rangeKm: listing.evSpecs?.rangeKm ?? undefined,
    batteryHealthPercent: listing.evSpecs?.batteryHealthPercent ?? undefined,
    fobPriceRwf:
      listing.listingPricing?.fobPriceRwf ??
      usdtToRwf(listing.listingPricing?.fobPriceUsd) ??
      undefined,
    sellerDesiredPayoutRwf:
      listing.listingPricing?.sellerDesiredPayoutRwf ??
      usdtToRwf(listing.listingPricing?.sellerDesiredPayoutUsd) ??
      undefined,
  };
}

export function toSellerListingBody(
  input: CreateSellerListingInput | UpdateSellerListingInput,
) {
  const {
    sellerDesiredPayoutRwf,
    fobPriceRwf,
    description,
    trim,
    mileageKm,
    ...rest
  } = input;

  return {
    ...rest,
    isNew: input.condition === 'NEW',
    description: description?.trim() || undefined,
    trim: trim?.trim() || undefined,
    mileageKm,
    evSpecs: {
      rangeKm: input.rangeKm!,
      batteryHealthPercent:
        input.condition === 'NEW' ? undefined : input.batteryHealthPercent,
    },
    pricing: {
      sellerDesiredPayoutRwf:
        input.sellerType === 'LOCAL_SELLER'
          ? sellerDesiredPayoutRwf
          : undefined,
      fobPriceRwf:
        input.sellerType === 'INTERNATIONAL_SELLER' ? fobPriceRwf : undefined,
    },
  };
}

export function isListingEditable(status: string) {
  return status === 'DRAFT' || status === 'REJECTED';
}

export function canSubmitListing(status: string) {
  return status === 'DRAFT' || status === 'REJECTED';
}

export function canDeleteListing(status: string) {
  return status === 'DRAFT';
}

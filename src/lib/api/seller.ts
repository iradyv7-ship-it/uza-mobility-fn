import { authenticatedFetch } from '@/lib/api/authenticated';
import {
  authenticatedMultipartFetch,
  buildMultipartFormData,
} from '@/lib/api/multipart';
import { toSellerListingBody } from '@/lib/seller/listing-form';
import type {
  CreatePartInput,
  CreateSellerListingInput,
  CreateSellerProfileInput,
  UpdatePartInput,
  UpdateSellerListingInput,
} from '@/schemas/seller';
import type { MeSellerProfile } from '@/types/auth/seller-profile';
import type { PriceBreakdown } from '@/types/pricing';
import type { SellerListing, SellerPart } from '@/types/seller/marketplace';

export type ListingPricingPreviewInput = {
  country?: string;
  sellerDesiredPayoutRwf?: number;
  fobPriceRwf?: number;
  discountRwf?: number;
};

export type PartPricingPreviewInput = {
  desiredPayoutRwf: number;
};

export function getMyListings() {
  return authenticatedFetch<SellerListing[]>('/listings/my');
}

export function createListing(body: CreateSellerListingInput) {
  return authenticatedFetch<SellerListing>('/listings', {
    method: 'POST',
    body: JSON.stringify(toSellerListingBody(body)),
  });
}

export function updateListing(id: string, body: UpdateSellerListingInput) {
  return authenticatedFetch<SellerListing>(`/listings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(toSellerListingBody(body)),
  });
}

export function deleteListing(id: string) {
  return authenticatedFetch<{ message: string }>(`/listings/${id}`, {
    method: 'DELETE',
  });
}

export function previewListingPricing(body: ListingPricingPreviewInput) {
  return authenticatedFetch<PriceBreakdown>('/listings/pricing-preview', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function previewPartPricing(body: PartPricingPreviewInput) {
  return authenticatedFetch<PriceBreakdown>('/parts/pricing-preview', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function submitListing(id: string) {
  return authenticatedFetch<SellerListing>(`/listings/${id}/submit`, {
    method: 'POST',
  });
}

export function uploadListingPhotos(id: string, photos: File[]) {
  const form = new FormData();
  for (const file of photos) {
    form.append('photos', file);
  }
  return authenticatedMultipartFetch<SellerListing>(
    `/listings/${id}/photos`,
    form,
  );
}

export function getMyParts() {
  return authenticatedFetch<SellerPart[]>('/parts/my');
}

export function createPart(body: CreatePartInput, photos: File[] = []) {
  const form = buildMultipartFormData(body, [
    { field: 'photos', files: photos },
  ]);
  return authenticatedMultipartFetch<SellerPart>('/parts', form);
}

export function updatePart(
  id: string,
  body: UpdatePartInput,
  photos: File[] = [],
) {
  const form = buildMultipartFormData(body, [
    { field: 'photos', files: photos },
  ]);
  return authenticatedMultipartFetch<SellerPart>(`/parts/${id}`, form, {
    method: 'PATCH',
  });
}

export function deactivatePart(id: string) {
  return authenticatedFetch<{ deleted: boolean }>(`/parts/${id}`, {
    method: 'DELETE',
  });
}

export function getSellerProfiles() {
  return authenticatedFetch<MeSellerProfile[]>('/users/seller-profiles');
}

export function getSellerProfile(sellerType?: string) {
  const query = sellerType
    ? `?sellerType=${encodeURIComponent(sellerType)}`
    : '';
  return authenticatedFetch<MeSellerProfile>(`/users/seller-profile${query}`);
}

export function createSellerProfile(body: CreateSellerProfileInput) {
  return authenticatedFetch<MeSellerProfile>('/users/seller-profile', {
    method: 'POST',
    body: JSON.stringify({
      ...body,
      email: body.email?.trim() || undefined,
      contactPerson: body.contactPerson?.trim() || undefined,
      phone: body.phone?.trim() || undefined,
      address: body.address?.trim() || undefined,
      city: body.city?.trim() || undefined,
      description: body.description?.trim() || undefined,
      businessRegNumber: body.businessRegNumber?.trim() || undefined,
      taxId: body.taxId?.trim() || undefined,
    }),
  });
}

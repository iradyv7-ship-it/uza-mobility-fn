import { z } from 'zod';
import { listingConditions } from '@/schemas/marketplace';

export const marketplaceListingSellerTypes = [
  'LOCAL_SELLER',
  'INTERNATIONAL_SELLER',
] as const;

export const MAX_SELLER_LISTING_PHOTOS = 20;

const sellerListingFormFieldsSchema = z.object({
  sellerType: z.enum(marketplaceListingSellerTypes),
  listingTitle: z.string().min(1).max(200),
  categoryId: z.string().min(1, 'Category is required'),
  brand: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  trim: z.string().max(100).optional(),
  manufacturingYear: z.number().int().min(1990).max(2100),
  condition: z.enum(listingConditions),
  vehicleLocation: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  country: z.string().length(2),
  description: z.string().max(5000).optional(),
  mileageKm: z.number().min(0).optional(),
  rangeKm: z.number().min(1).optional(),
  batteryHealthPercent: z.number().min(0).max(100).optional(),
  sellerDesiredPayoutRwf: z.number().min(0).optional(),
  fobPriceRwf: z.number().min(0).optional(),
});

function refineSellerListingEvSpecs(
  data: z.infer<typeof sellerListingFormFieldsSchema>,
  ctx: z.RefinementCtx,
) {
  if (data.rangeKm == null || data.rangeKm <= 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'Electric range (km) is required',
      path: ['rangeKm'],
    });
  }

  if (
    data.condition !== 'NEW' &&
    (data.batteryHealthPercent == null || data.batteryHealthPercent <= 0)
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'Battery health (%) is required for pre-owned vehicles',
      path: ['batteryHealthPercent'],
    });
  }
}

function refineSellerListingPricing(
  data: z.infer<typeof sellerListingFormFieldsSchema>,
  ctx: z.RefinementCtx,
) {
  if (
    data.sellerType === 'LOCAL_SELLER' &&
    (data.sellerDesiredPayoutRwf == null || data.sellerDesiredPayoutRwf <= 0)
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'Desired payout (Rwf) is required for local sellers',
      path: ['sellerDesiredPayoutRwf'],
    });
  }
  if (
    data.sellerType === 'INTERNATIONAL_SELLER' &&
    (data.fobPriceRwf == null || data.fobPriceRwf <= 0)
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'FOB price (Rwf) is required for international sellers',
      path: ['fobPriceRwf'],
    });
  }
}

const sellerListingRefinements = sellerListingFormFieldsSchema
  .superRefine(refineSellerListingPricing)
  .superRefine(refineSellerListingEvSpecs);

export const sellerListingFormSchema = sellerListingRefinements;

export type SellerListingFormInput = z.infer<typeof sellerListingFormSchema>;

export const createSellerListingSchema = sellerListingRefinements;

export type CreateSellerListingInput = z.infer<
  typeof createSellerListingSchema
>;

export const updateSellerListingSchema = sellerListingRefinements;

export type UpdateSellerListingInput = z.infer<
  typeof updateSellerListingSchema
>;

export {
  formatListingChargingType,
  listingChargingTypes,
  listingConditions,
  MAX_PART_PHOTOS,
  partConditions,
  createPartSchema,
  updatePartSchema,
} from '@/schemas/marketplace';
export type { CreatePartInput, UpdatePartInput } from '@/schemas/marketplace';

export const createSellerProfileSchema = z.object({
  sellerType: z.enum(marketplaceListingSellerTypes),
  businessName: z.string().min(1).max(150),
  businessRegNumber: z.string().max(100).optional(),
  taxId: z.string().max(100).optional(),
  contactPerson: z.string().max(150).optional(),
  phone: z.string().max(32).optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  country: z.string().length(2),
  description: z.string().max(1000).optional(),
});

export type CreateSellerProfileInput = z.infer<
  typeof createSellerProfileSchema
>;

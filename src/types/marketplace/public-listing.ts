/** Public marketplace listing shape returned by GET /listings* endpoints. */

export type PublicListingPhoto = {
  id: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  displayOrder: number;
};

export type PublicListingEvSpec = {
  batteryCapacityKwh?: number | null;
  batteryHealthPercent?: number | null;
  batteryHealthReport?: boolean;
  rangeKm?: number | null;
  chargingType?: string | null;
  fastChargingSupported?: boolean;
  chargingTimeHours?: number | null;
  motorPowerKw?: number | null;
  topSpeedKmh?: number | null;
  payloadCapacityKg?: number | null;
  grossVehicleWeightKg?: number | null;
  seatingCapacity?: number | null;
};

export type PublicListingPricing = {
  finalPriceUsd: number;
  finalPriceRwf?: number | null;
  displayPriceRwf?: number | null;
  currency: string;
};

export type PublicListingCategory = {
  id: string;
  name: string;
  slug: string;
  type?: string;
};

export type PublicListingSeller = {
  businessName: string;
  country: string;
  city?: string | null;
  isVerified: boolean;
};

export type PublicListingUseCaseTag = {
  useCase: string;
};

export type PublicListing = {
  id: string;
  listingTitle: string;
  slug: string;
  brand: string;
  model: string;
  trim?: string | null;
  manufacturingYear: number;
  status: string;
  sellerType?: string;
  bodyType?: string | null;
  powertrainType?: string | null;
  condition?: string | null;
  mileageKm?: number | null;
  color?: string | null;
  seats?: number | null;
  steeringPosition?: string | null;
  isNew?: boolean;
  hasWarranty?: boolean;
  warrantyDetails?: string | null;
  ownershipCount?: number | null;
  registrationStatus?:
    | 'REGISTERED'
    | 'READY_FOR_REGISTRATION'
    | 'IMPORT_PENDING'
    | 'NOT_APPLICABLE'
    | null;
  vehicleLocation?: string | null;
  verificationLevel?: string | null;
  videoUrl?: string | null;
  brochureUrl?: string | null;
  isFullOption?: boolean;
  city?: string | null;
  country?: string;
  drivetrain?: string | null;
  deliveryEstimateDays?: number | null;
  description?: string | null;
  listingPricing?: PublicListingPricing | null;
  photos?: PublicListingPhoto[];
  evSpecs?: PublicListingEvSpec | null;
  category?: PublicListingCategory | null;
  subcategory?: { id: string; name: string; slug: string } | null;
  inventoryStage?:
    | 'CHINA_UNPAID'
    | 'IN_TRANSIT'
    | 'AT_PORT'
    | 'KIGALI_STOCK'
    | null;
  inventoryStageLabel?: string | null;
  displayBadge?: string | null;
  isBooked?: boolean;
  useCaseTags?: PublicListingUseCaseTag[];
  seller?: PublicListingSeller | null;
};

import {
  formatDrivetrainLabel,
  resolveMediaUrl,
} from '@/lib/marketing/listing-display';
import type {
  PublicListing,
  PublicListingPhoto,
} from '@/types/marketplace/public-listing';

export function getListingPhotos(listing: PublicListing): PublicListingPhoto[] {
  const photos = [...(listing.photos ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  if (photos.length > 0) return photos;
  return [];
}

export function formatBodyLabel(listing: PublicListing): string {
  if (listing.subcategory?.name) return listing.subcategory.name;
  if (listing.bodyType) {
    return listing.bodyType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return listing.category?.name ?? '—';
}

export function formatConditionLabel(condition?: string | null): string {
  if (!condition) return '—';
  if (condition === 'NEW') return 'New';
  return condition.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatPowertrainLabel(powertrain?: string | null): string {
  if (!powertrain) return '—';
  const map: Record<string, string> = {
    BEV: 'Battery electric (BEV)',
    PHEV: 'Plug-in hybrid (PHEV)',
    HEV: 'Hybrid (HEV)',
    EREV: 'Extended-range electric (EREV)',
  };
  return map[powertrain] ?? powertrain.replace(/_/g, ' ');
}

export function formatSteeringLabel(steering?: string | null): string {
  if (!steering) return '—';
  const map: Record<string, string> = {
    LEFT_HAND_DRIVE: 'Left-hand drive',
    RIGHT_HAND_DRIVE: 'Right-hand drive',
  };
  return map[steering] ?? steering.replace(/_/g, ' ');
}

export function formatVerificationLabel(level?: string | null): string {
  if (!level) return '—';
  return level.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const registrationStatusLabels: Record<string, string> = {
  REGISTERED: 'Registered',
  READY_FOR_REGISTRATION: 'Ready for registration',
  IMPORT_PENDING: 'Import pending',
  NOT_APPLICABLE: 'Not applicable',
};

export function formatRegistrationStatusLabel(status?: string | null): string {
  if (!status) return '—';
  return registrationStatusLabels[status] ?? status.replace(/_/g, ' ');
}

export function formatUseCases(listing: PublicListing): string {
  const tags = listing.useCaseTags?.map((t) =>
    t.useCase.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  );
  return tags?.length ? tags.join(', ') : '—';
}

export function formatMileage(listing: PublicListing): string {
  if (listing.mileageKm == null) {
    return listing.isNew ? 'New' : '—';
  }
  return `${Math.round(listing.mileageKm).toLocaleString('en-US')} km`;
}

export function formatBatterySpec(listing: PublicListing): string {
  const kwh = listing.evSpecs?.batteryCapacityKwh;
  if (kwh == null) return '—';
  return `${kwh} kWh`;
}

export function formatRangeSpec(listing: PublicListing): string {
  const km = listing.evSpecs?.rangeKm;
  if (km == null) return '—';
  return `${Math.round(km).toLocaleString('en-US')} km`;
}

export function formatBatteryHealth(listing: PublicListing): string {
  const pct = listing.evSpecs?.batteryHealthPercent;
  if (pct == null) return '—';
  return `${Math.round(pct)}%`;
}

export function formatChargingSpec(listing: PublicListing): string {
  const hours = listing.evSpecs?.chargingTimeHours;
  if (hours != null) {
    return hours < 1
      ? `${Math.round(hours * 60)} min (fast charge)`
      : `${hours} hrs`;
  }
  const type = listing.evSpecs?.chargingType;
  if (type) return type;
  return '—';
}

export function formatFastCharging(listing: PublicListing): string {
  if (listing.evSpecs?.fastChargingSupported == null) return '—';
  return listing.evSpecs.fastChargingSupported ? 'Yes' : 'No';
}

export function formatTransmissionLabel(listing: PublicListing): string {
  if (listing.powertrainType === 'BEV' || listing.powertrainType === 'EREV') {
    return 'Single-speed automatic';
  }
  return 'Automatic';
}

export function formatWarranty(listing: PublicListing): string {
  if (!listing.hasWarranty) return 'Not included';
  return listing.warrantyDetails?.trim() || 'Included — see details';
}

export function formatStockLocation(listing: PublicListing): string {
  if (listing.sellerType === 'UZA_RWANDA_STOCK') {
    return 'Currently in Kigali Stock';
  }
  if (listing.city?.trim()) {
    return `Located in ${listing.city}`;
  }
  if (listing.country === 'RW') {
    return 'Available in Rwanda';
  }
  return 'Available for import to Kigali';
}

export function formatHandoverLine(listing: PublicListing): string {
  const days = listing.deliveryEstimateDays;
  if (days == null) {
    return listing.sellerType === 'UZA_RWANDA_STOCK'
      ? 'Ready for handover in Kigali'
      : 'Delivery timeline confirmed at reservation';
  }
  if (days <= 2) return 'Ready for handover in 1–2 days';
  if (days <= 7) return `Ready for handover in ${days} days`;
  return `Estimated delivery in ${days} days`;
}

export type VehicleSpecRow = {
  label: string;
  value: string;
};

export type VehicleSpecGroup = {
  title: string;
  rows: VehicleSpecRow[];
};

function specRow(
  label: string,
  value: string | null | undefined,
): VehicleSpecRow {
  const text = value?.trim();
  return { label, value: text && text.length > 0 ? text : '—' };
}

function specRowNumber(
  label: string,
  value: number | null | undefined,
  format: (n: number) => string,
): VehicleSpecRow | null {
  if (value == null) return null;
  return { label, value: format(value) };
}

function withValues(rows: VehicleSpecRow[]): VehicleSpecRow[] {
  return rows.filter((row) => row.value !== '—');
}

function formatSidebarBattery(listing: PublicListing): string {
  const kwh = listing.evSpecs?.batteryCapacityKwh;
  if (kwh == null) return '—';
  return `${kwh} kWh capacity`;
}

/** Labels shown in the sidebar — never repeated under description. */
export const VEHICLE_SIDEBAR_SPEC_LABELS = [
  'Body',
  'Mileage',
  'Battery',
  'Year',
  'Transmission',
  'Charging',
  'Drive type',
  'Condition',
  'Seats',
  'Color',
] as const;

/** At-a-glance specs beside price (original sidebar card). */
export function buildVehicleSidebarSpecRows(
  listing: PublicListing,
): VehicleSpecRow[] {
  return [
    specRow('Body', formatBodyLabel(listing)),
    specRow('Mileage', formatMileage(listing)),
    specRow('Battery', formatSidebarBattery(listing)),
    specRow('Year', String(listing.manufacturingYear)),
    specRow('Transmission', formatTransmissionLabel(listing)),
    specRow('Charging', formatChargingSpec(listing)),
    specRow('Drive type', formatDrivetrainLabel(listing.drivetrain) ?? '—'),
    specRow('Condition', formatConditionLabel(listing.condition)),
    specRow('Seats', listing.seats != null ? String(listing.seats) : '—'),
    specRow('Color', listing.color),
  ];
}

/**
 * Extra detail under description only — excludes every sidebar field and
 * other copy already on the page (location block, title, etc.).
 */
export function buildVehicleExtendedSpecGroups(
  listing: PublicListing,
): VehicleSpecGroup[] {
  const ev = listing.evSpecs;
  const sidebarLabels = new Set<string>(VEHICLE_SIDEBAR_SPEC_LABELS);

  const commercial = [
    specRowNumber(
      'Payload capacity',
      ev?.payloadCapacityKg ?? null,
      (n) => `${Math.round(n).toLocaleString('en-US')} kg`,
    ),
    specRowNumber(
      'Gross vehicle weight',
      ev?.grossVehicleWeightKg ?? null,
      (n) => `${Math.round(n).toLocaleString('en-US')} kg`,
    ),
  ].filter((row): row is VehicleSpecRow => row != null);

  const additional = withValues([
    specRow('Category', listing.category?.name),
    specRow('Steering', formatSteeringLabel(listing.steeringPosition)),
    specRow('Powertrain', formatPowertrainLabel(listing.powertrainType)),
    specRow('Electric range', formatRangeSpec(listing)),
    specRow('Battery health', formatBatteryHealth(listing)),
    specRow(
      'Battery health report',
      ev?.batteryHealthReport == null
        ? '—'
        : ev.batteryHealthReport
          ? 'Available'
          : 'Not available',
    ),
    specRow(
      'Motor power',
      ev?.motorPowerKw != null ? `${ev.motorPowerKw} kW` : '—',
    ),
    specRow(
      'Top speed',
      ev?.topSpeedKmh != null ? `${Math.round(ev.topSpeedKmh)} km/h` : '—',
    ),
    ...commercial,
    specRow('Warranty', formatWarranty(listing)),
    specRow(
      'Registration',
      formatRegistrationStatusLabel(listing.registrationStatus),
    ),
    specRow(
      'Previous owners',
      listing.ownershipCount != null ? String(listing.ownershipCount) : '—',
    ),
    specRow(
      'UZA verification',
      formatVerificationLabel(listing.verificationLevel),
    ),
    specRow('Ideal for', formatUseCases(listing)),
  ]).filter((row) => !sidebarLabels.has(row.label));

  if (additional.length === 0) return [];

  return [{ title: 'Additional details', rows: additional }];
}

export function resolveListingVideoUrl(listing: PublicListing): string | null {
  return resolveMediaUrl(listing.videoUrl ?? null);
}

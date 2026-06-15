export const VEHICLES_PAGE_SIZE = 9;

export type VehiclesSearchParams = {
  stock?: string;
  category?: string;
  useCase?: string;
  q?: string;
  page?: number;
  sort?: string;
  brand?: string;
  model?: string;
  condition?: string;
  drivetrain?: string;
  color?: string;
  city?: string;
  country?: string;
  batteryCapacityKwh?: number;
  yearMin?: number;
  yearMax?: number;
  mileageMin?: number;
  mileageMax?: number;
  priceMin?: number;
  priceMax?: number;
};

export type BrowseFilterOptions = {
  brands: string[];
  models: string[];
  conditions: string[];
  drivetrains: string[];
  colors: string[];
  cities: string[];
  countries: string[];
  batteryCapacitiesKwh: number[];
  yearRange: { min: number; max: number } | null;
  mileageRange: { min: number; max: number } | null;
  priceRange: { min: number; max: number } | null;
};

export const VEHICLE_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Default' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'lowest_km', label: 'Lowest mileage' },
  { value: 'battery_high', label: 'Battery capacity' },
  { value: 'range_high', label: 'Range' },
  { value: 'fast_deliver', label: 'Fastest delivery' },
  { value: 'featured', label: 'Featured' },
];

/** Merge URL filter state; resets page unless `page` is in the patch. */
export function applyVehiclesSearchPatch(
  base: VehiclesSearchParams,
  patch: Partial<VehiclesSearchParams>,
): VehiclesSearchParams {
  const next = { ...base, ...patch };
  if (!('page' in patch)) next.page = 1;
  if ('brand' in patch && patch.brand !== base.brand) {
    delete next.model;
  }
  return next;
}

export function parseVehiclesSearchParams(
  raw: Record<string, string | string[] | undefined>,
): VehiclesSearchParams {
  const pick = (key: string) => {
    const v = raw[key];
    if (v == null) return undefined;
    return Array.isArray(v) ? v[0] : v;
  };

  const num = (key: string) => {
    const v = pick(key);
    if (v == null || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  return {
    stock: pick('stock'),
    category: pick('category'),
    useCase: pick('useCase'),
    q: pick('q'),
    page: Math.max(1, num('page') ?? 1),
    sort: pick('sort'),
    brand: pick('brand'),
    model: pick('model'),
    condition: pick('condition'),
    drivetrain: pick('drivetrain'),
    color: pick('color'),
    city: pick('city'),
    country: pick('country'),
    batteryCapacityKwh: num('batteryCapacityKwh'),
    yearMin: num('yearMin'),
    yearMax: num('yearMax'),
    mileageMin: num('mileageMin'),
    mileageMax: num('mileageMax'),
    priceMin: num('priceMin'),
    priceMax: num('priceMax'),
  };
}

export function formatConditionLabel(value: string): string {
  return value
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

export function formatDrivetrainFilterLabel(value: string): string {
  const map: Record<string, string> = {
    FWD: 'FWD',
    RWD: 'RWD',
    AWD: 'AWD',
    FOUR_WD: '4WD',
  };
  return map[value] ?? value.replace(/_/g, ' ');
}

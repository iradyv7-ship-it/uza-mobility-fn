import type { VehiclesSearchParams } from '@/lib/marketing/vehicles-browse';

/** Build `/vehicles` browse URLs from API-backed slugs and filter state. */
export function vehiclesHref(filters?: VehiclesSearchParams) {
  const params = new URLSearchParams();

  if (filters?.stock) params.set('stock', filters.stock);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.useCase) params.set('useCase', filters.useCase);
  if (filters?.q?.trim()) params.set('q', filters.q.trim());
  if (filters?.sort) params.set('sort', filters.sort);
  if (filters?.page && filters.page > 1) {
    params.set('page', String(filters.page));
  }

  if (filters?.brand) params.set('brand', filters.brand);
  if (filters?.model) params.set('model', filters.model);
  if (filters?.condition) params.set('condition', filters.condition);
  if (filters?.drivetrain) params.set('drivetrain', filters.drivetrain);
  if (filters?.color) params.set('color', filters.color);
  if (filters?.city) params.set('city', filters.city);
  if (filters?.country) params.set('country', filters.country);
  if (filters?.batteryCapacityKwh != null) {
    params.set('batteryCapacityKwh', String(filters.batteryCapacityKwh));
  }
  if (filters?.yearMin != null) params.set('yearMin', String(filters.yearMin));
  if (filters?.yearMax != null) params.set('yearMax', String(filters.yearMax));
  if (filters?.mileageMin != null) {
    params.set('mileageMin', String(filters.mileageMin));
  }
  if (filters?.mileageMax != null) {
    params.set('mileageMax', String(filters.mileageMax));
  }
  if (filters?.priceMin != null)
    params.set('priceMin', String(filters.priceMin));
  if (filters?.priceMax != null)
    params.set('priceMax', String(filters.priceMax));

  const qs = params.toString();
  return qs ? `/vehicles?${qs}` : '/vehicles';
}

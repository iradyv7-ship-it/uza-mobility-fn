import {
  authenticatedFetch,
  authenticatedPaginatedFetch,
} from '@/lib/api/authenticated';
import { apiFetch } from '@/lib/api/api';
import { authenticatedMultipartFetch } from '@/lib/api/multipart';
import type { VehicleBooking } from '@/types/buyer/bookings';

export function getBookingFeeQuote() {
  return apiFetch<{ bookingFeeRwf: number; currency: 'RWF' }>('/bookings/fee');
}

export function requestVehicleBooking(body: {
  listingId: string;
  notes?: string;
}) {
  return authenticatedFetch<VehicleBooking>('/bookings/request', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function submitBookingPayment(bookingId: string, form: FormData) {
  return authenticatedMultipartFetch<VehicleBooking>(
    `/bookings/${bookingId}/payment`,
    form,
  );
}

export function getMyBookings(params?: {
  status?: string;
  listingId?: string;
  page?: number;
  limit?: number;
  activeOnly?: boolean;
}) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.listingId) searchParams.set('listingId', params.listingId);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.activeOnly) searchParams.set('activeOnly', 'true');
  return authenticatedPaginatedFetch<VehicleBooking>('/bookings/my', {
    searchParams,
  });
}

export function getMyBooking(id: string) {
  return authenticatedFetch<VehicleBooking>(`/bookings/${id}`);
}

export function cancelMyBooking(id: string) {
  return authenticatedFetch<VehicleBooking>(`/bookings/${id}/cancel`, {
    method: 'PATCH',
  });
}

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiClientError } from '@/lib/api';
import {
  cancelMyBooking,
  getBookingFeeQuote,
  getMyBookings,
  requestVehicleBooking,
  submitBookingPayment,
} from '@/lib/api/bookings';
import { buildMultipartFormData } from '@/lib/api/multipart';
import { useBuyerAccessToken } from '@/queries/buyer';
import type { VehicleBooking } from '@/types/buyer/bookings';

type PaginatedBookings = {
  items: VehicleBooking[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type MyBookingsFilters = {
  page?: number;
  listingId?: string;
  status?: string;
  limit?: number;
  activeOnly?: boolean;
};

export const bookingKeys = {
  all: ['bookings'] as const,
  fee: () => [...bookingKeys.all, 'fee'] as const,
  mine: (filters: MyBookingsFilters = {}) =>
    [
      ...bookingKeys.all,
      'mine',
      filters.listingId ?? null,
      filters.status ?? null,
      filters.limit ?? null,
      filters.activeOnly ?? null,
    ] as const,
};

function toastError(error: unknown, fallback: string) {
  toast.error(error instanceof ApiClientError ? error.message : fallback);
}

function isMineBookingsQuery(queryKey: readonly unknown[]) {
  return queryKey[0] === 'bookings' && queryKey[1] === 'mine';
}

function stripBookingFromMineCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  bookingId: string,
) {
  queryClient.setQueriesData<PaginatedBookings>(
    {
      predicate: (query) => isMineBookingsQuery(query.queryKey),
    },
    (old) => {
      if (!old?.items) return old;
      const items = old.items.filter((row) => row.id !== bookingId);
      if (items.length === old.items.length) return old;
      return {
        ...old,
        items,
        meta: {
          ...old.meta,
          total: Math.max(
            0,
            old.meta.total - (old.items.length - items.length),
          ),
        },
      };
    },
  );
}

export function useBookingFeeQuote(enabled = true) {
  return useQuery({
    queryKey: bookingKeys.fee(),
    queryFn: getBookingFeeQuote,
    enabled,
    staleTime: 60_000,
  });
}

export function useMyBookings(
  filters: MyBookingsFilters = {},
  extraEnabled = true,
) {
  const { ready } = useBuyerAccessToken(extraEnabled);
  return useQuery({
    queryKey: bookingKeys.mine(filters),
    queryFn: () => getMyBookings(filters),
    enabled: ready,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}

export function useRequestVehicleBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestVehicleBooking,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        predicate: (query) => isMineBookingsQuery(query.queryKey),
      });
    },
    onError: (error) => toastError(error, 'Unable to create booking'),
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelMyBooking,
    onMutate: async (bookingId) => {
      await queryClient.cancelQueries({
        predicate: (query) => isMineBookingsQuery(query.queryKey),
      });
      stripBookingFromMineCaches(queryClient, bookingId);
    },
    onSuccess: (_booking, bookingId) => {
      stripBookingFromMineCaches(queryClient, bookingId);
      toast.success('Booking cancelled');
    },
    onError: (error, bookingId) => {
      void queryClient.invalidateQueries({
        predicate: (query) => isMineBookingsQuery(query.queryKey),
      });
      toastError(error, 'Unable to cancel booking');
    },
  });
}

export function useSubmitBookingPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      payload,
      proofs,
    }: {
      bookingId: string;
      payload: Record<string, unknown>;
      proofs?: File[];
    }) => {
      const form = buildMultipartFormData(payload, [
        { field: 'proofs', files: proofs ?? [] },
      ]);
      return submitBookingPayment(bookingId, form);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        predicate: (query) => isMineBookingsQuery(query.queryKey),
      });
      toast.success('Booking payment submitted for verification');
    },
    onError: (error) => toastError(error, 'Unable to submit booking payment'),
  });
}

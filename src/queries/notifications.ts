'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { ApiClientError } from '@/lib/api';
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/api/notifications';
import type { NotificationsFilters } from '@/types/notifications';
import { invalidateNotificationLists } from '@/lib/notifications/query-cache';

export const notificationKeys = {
  all: ['notifications'] as const,
  unreadCount: (userId: string) =>
    [...notificationKeys.all, 'unread-count', userId] as const,
  list: (userId: string, filters: NotificationsFilters) =>
    [...notificationKeys.all, 'list', userId, filters] as const,
};

function toastError(error: unknown, fallback: string) {
  toast.error(error instanceof ApiClientError ? error.message : fallback);
}

function useNotificationSession() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const accessToken = session?.accessToken;
  const ready =
    status === 'authenticated' &&
    Boolean(userId) &&
    Boolean(accessToken) &&
    session?.error !== 'RefreshAccessTokenError';

  return { userId, accessToken, ready, status };
}

export function useUnreadNotificationCount(enabled = true) {
  const { userId, accessToken, ready } = useNotificationSession();

  return useQuery({
    queryKey: notificationKeys.unreadCount(userId ?? ''),
    queryFn: () => getUnreadNotificationCount(accessToken),
    enabled: ready && enabled,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

export function useNotifications(
  filters: NotificationsFilters,
  enabled = true,
) {
  const { userId, accessToken, ready } = useNotificationSession();

  return useQuery({
    queryKey: notificationKeys.list(userId ?? '', filters),
    queryFn: () => getNotifications(filters, accessToken),
    enabled: ready && enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { userId, accessToken } = useNotificationSession();

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id, accessToken),
    onSuccess: () => {
      if (userId) {
        queryClient.setQueryData<number>(
          notificationKeys.unreadCount(userId),
          (count) => Math.max(0, (count ?? 1) - 1),
        );
        invalidateNotificationLists(queryClient);
      }
    },
    onError: (error) => toastError(error, 'Failed to mark notification read'),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { userId, accessToken } = useNotificationSession();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(accessToken),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      if (userId) {
        queryClient.setQueryData(notificationKeys.unreadCount(userId), 0);
        invalidateNotificationLists(queryClient);
      }
    },
    onError: (error) =>
      toastError(error, 'Failed to mark notifications as read'),
  });
}

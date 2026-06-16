import type { QueryClient } from '@tanstack/react-query';
import { notificationKeys } from '@/queries/notifications';
import type { AppNotification } from '@/types/notifications';

/** Apply a socket push without refetching the unread-count poll endpoint. */
export function applyNotificationPush(
  queryClient: QueryClient,
  userId: string,
  payload: AppNotification,
) {
  if (!payload.isRead) {
    queryClient.setQueryData<number>(
      notificationKeys.unreadCount(userId),
      (count) => (count ?? 0) + 1,
    );
  }

  void queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey[0] === notificationKeys.all[0] &&
      query.queryKey[1] === 'list',
  });
}

export function invalidateNotificationLists(queryClient: QueryClient) {
  void queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey[0] === notificationKeys.all[0] &&
      query.queryKey[1] === 'list',
  });
}

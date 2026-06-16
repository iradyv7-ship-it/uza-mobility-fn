'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { io, type Socket } from 'socket.io-client';
import { applyNotificationPush } from '@/lib/notifications/query-cache';
import {
  getNotificationsSocketUrl,
  NOTIFICATION_SOCKET_EVENT,
} from '@/lib/notifications/socket';
import { notificationKeys } from '@/queries/notifications';
import type { AppNotification } from '@/types/notifications';

export function NotificationSocketListener() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const userIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const token = session?.accessToken;
    const userId = session?.user?.id;

    if (status !== 'authenticated' || !token || !userId) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      userIdRef.current = undefined;
      return;
    }

    if (session?.error === 'RefreshAccessTokenError') {
      return;
    }

    userIdRef.current = userId;

    if (socketRef.current) {
      socketRef.current.auth = { token };
      return;
    }

    const socket = io(getNotificationsSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    const syncUnreadOnConnect = () => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(userId),
      });
    };

    const onNotification = (payload: AppNotification) => {
      const currentUserId = userIdRef.current;
      if (currentUserId && payload.userId !== currentUserId) {
        return;
      }
      if (currentUserId) {
        applyNotificationPush(queryClient, currentUserId, payload);
      }
    };

    socket.on('connect', syncUnreadOnConnect);
    socket.on(NOTIFICATION_SOCKET_EVENT, onNotification);

    return () => {
      socket.off('connect', syncUnreadOnConnect);
      socket.off(NOTIFICATION_SOCKET_EVENT, onNotification);
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [
    status,
    session?.user?.id,
    session?.accessToken,
    session?.error,
    queryClient,
  ]);

  return null;
}

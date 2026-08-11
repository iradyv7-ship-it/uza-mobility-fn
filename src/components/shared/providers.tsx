'use client';

import { SessionProvider } from 'next-auth/react';
import { SessionRefresh } from '@/components/auth/session';
import { NotificationSocketListener } from '@/components/notifications/notification-socket-listener';
import { NavigationProgress } from '@/components/shared/navigation-progress';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/lib/query/query-provider';
import { PriceCurrencyProvider } from '@/components/marketing/price-currency-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <QueryProvider>
        <PriceCurrencyProvider>
          <SessionRefresh />
          <NotificationSocketListener />
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <NavigationProgress />
            {children}
            <Toaster richColors closeButton position="top-right" />
          </ThemeProvider>
        </PriceCurrencyProvider>
      </QueryProvider>
    </SessionProvider>
  );
}

'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * next-themes injects an inline <script> to avoid theme flash on load.
 * React 19 / Next 16 warn about script tags inside client components; the
 * script still runs correctly during SSR — filter that specific noise.
 */
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const isScriptTagWarning = args.some(
      (arg) =>
        typeof arg === 'string' &&
        arg.includes(
          'Encountered a script tag while rendering React component',
        ),
    );
    if (isScriptTagWarning) return;
    originalError.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

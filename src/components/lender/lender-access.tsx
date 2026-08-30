'use client';

import Link from 'next/link';
import { hasLenderWorkspace } from '@/lib/permissions';
import { useSessionUser } from '@/hooks/session-user';
import { Button } from '@/components/ui/button';
import type { LenderConfig } from '@/config/lenders';

/**
 * The lender guard.
 *
 * A convenience, not a control. Every rule here is enforced again by the API, which is
 * the only place enforcement counts — hiding a screen stops an honest person opening it
 * and stops nobody else. What this buys is that a bank never loads a page full of
 * refusals it was never meant to reach.
 *
 * The refusal deliberately says nothing about whether the other portal exists.
 */
export function LenderAccess({
  lender,
  children,
}: {
  lender: LenderConfig;
  children: React.ReactNode;
}) {
  const { user, isLoading } = useSessionUser();

  if (isLoading && !user) return null;

  if (!hasLenderWorkspace(lender.key, user?.roles)) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background p-6">
        <div className="mx-auto max-w-lg space-y-4 rounded-lg border bg-card p-6">
          <h1 className="text-lg font-semibold">No access to this workspace</h1>
          <p className="text-sm text-muted-foreground">
            This account is not registered for that institution.
          </p>
          <Button asChild variant="outline">
            <Link href="/my">Back to account</Link>
          </Button>
        </div>
      </div>
    );
  }

  return children;
}

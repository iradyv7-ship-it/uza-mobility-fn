'use client';

import Link from 'next/link';
import { hasWorkshopWorkspace } from '@/lib/permissions';
import { useSessionUser } from '@/hooks/session-user';
import { Button } from '@/components/ui/button';

export function WorkshopAccess({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useSessionUser();

  if (isLoading && !user) return null;

  if (!hasWorkshopWorkspace(user?.roles)) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background p-6">
        <div className="mx-auto max-w-lg space-y-4 rounded-lg border bg-card p-6">
          <h1 className="text-lg font-semibold">Workshop access required</h1>
          <p className="text-sm text-muted-foreground">
            This workspace is for mechanics and workshop staff.
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

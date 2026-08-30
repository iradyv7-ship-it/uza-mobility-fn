'use client';

import {
  Banknote,
  FileText,
  Home,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace/workspace-shell';
import type { NavGroup } from '@/config/navigation';
import type { LenderConfig } from '@/config/lenders';

/**
 * The navigation, built from the lender's registry entry.
 *
 * The collateral link is generated only when the entry entitles it. For every other
 * lender it is absent rather than disabled — a greyed-out item still tells that bank
 * the facility exists, and that is itself the disclosure this design prevents.
 */
function navGroups(lender: LenderConfig): NavGroup[] {
  const base = `/lender/${lender.key}`;
  return [
    { items: [{ label: 'Overview', href: base, icon: Home }] },
    {
      label: 'Lending',
      items: [
        { label: 'Applications', href: `${base}/applications`, icon: FileText },
        { label: 'Borrowers', href: `${base}/borrowers`, icon: Users },
        { label: 'Disbursements', href: `${base}/disbursements`, icon: Banknote },
        { label: 'Portfolio', href: `${base}/portfolio`, icon: TrendingUp },
      ],
    },
    ...(lender.seesCollateral
      ? [
          {
            label: 'Facility',
            items: [
              {
                label: 'Credit enhancement',
                href: `${base}/collateral`,
                icon: ShieldCheck,
              },
            ],
          },
        ]
      : []),
  ];
}

export function LenderShell({
  lender,
  children,
}: {
  lender: LenderConfig;
  children: React.ReactNode;
}) {
  return (
    <WorkspaceShell navGroups={navGroups(lender)} rootHref={`/lender/${lender.key}`}>
      {children}
    </WorkspaceShell>
  );
}

'use client';

import { ClipboardList, GraduationCap, LayoutGrid, LifeBuoy, Package, Users } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace/workspace-shell';
import type { NavGroup } from '@/config/navigation';

const workshopNavGroups: NavGroup[] = [
  { items: [{ label: 'Board', href: '/workshop', icon: LayoutGrid }] },
  {
    label: 'Work',
    items: [
      { label: 'Job cards', href: '/workshop/job-cards', icon: ClipboardList },
      { label: 'Rescue', href: '/workshop/rescue', icon: LifeBuoy },
      { label: 'Parts', href: '/workshop/parts', icon: Package },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Mechanics', href: '/workshop/mechanics', icon: Users },
      { label: 'Training courses', href: '/workshop/training-courses', icon: GraduationCap },
    ],
  },
];

export function WorkshopShell({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell navGroups={workshopNavGroups} rootHref="/workshop">
      {children}
    </WorkspaceShell>
  );
}

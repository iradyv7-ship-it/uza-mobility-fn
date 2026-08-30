import { WorkshopAccess } from '@/components/workshop/workshop-access';
import { WorkshopShell } from '@/components/workshop/workshop-shell';

export default function WorkshopLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkshopAccess>
      <WorkshopShell>{children}</WorkshopShell>
    </WorkshopAccess>
  );
}

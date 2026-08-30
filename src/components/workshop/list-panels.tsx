'use client';

import { StatusBadge } from '@/components/shared/status-badge';
import { Column, DataTable } from '@/components/lender/data-table';
import { useJobCards, useMechanics, useRescueCalls } from '@/queries/workshop';
import type { JobCard, Mechanic, RescueCall } from '@/types/workshop/job-card';

const text = (v: unknown) => (v == null || v === '' ? '—' : String(v));
const when = (v: string | null) =>
  v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export function JobCardsPanel() {
  const columns: Column<JobCard>[] = [
    { header: 'Reference', cell: (r) => text(r.reference) },
    { header: 'Vehicle', cell: (r) => text(r.vehiclePlate) },
    { header: 'State', cell: (r) => <StatusBadge status={String(r.state)} /> },
    { header: 'Assigned', cell: (r) => text(r.assignedTo) },
    { header: 'Promised', cell: (r) => when(r.promisedAt) },
  ];
  return <DataTable title="Job cards" columns={columns} query={useJobCards()} empty="No job cards are open." />;
}

export function RescuePanel() {
  const columns: Column<RescueCall>[] = [
    { header: 'Reference', cell: (r) => text(r.reference) },
    { header: 'Fault', cell: (r) => text(r.faultType) },
    {
      header: 'Responder',
      // An unassigned rescue is the most important row on this screen, so it says so
      // rather than showing an em dash the eye slides past. The dispatcher sends nobody
      // rather than somebody uncertified, and that gap needs a person.
      cell: (r) =>
        r.responderName ?? (
          <span className="text-amber-700 dark:text-amber-400">No certified responder</span>
        ),
    },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
  ];
  return (
    <DataTable
      title="Rescue calls"
      description="High-voltage faults go to a certified responder, even if further away."
      columns={columns}
      query={useRescueCalls()}
      empty="No rescue calls are open."
    />
  );
}

export function MechanicsPanel() {
  const columns: Column<Mechanic>[] = [
    { header: 'Name', cell: (r) => text(r.name) },
    { header: 'Grade', cell: (r) => text(r.grade) },
    {
      header: 'HV certificate',
      cell: (r) =>
        r.hvCertificateStatus ? <StatusBadge status={r.hvCertificateStatus} /> : '—',
    },
    { header: 'Expires', cell: (r) => when(r.hvCertificateExpiresAt) },
  ];
  return (
    <DataTable
      title="Mechanics"
      description="An expired high-voltage certificate is the same as none."
      columns={columns}
      query={useMechanics()}
      empty="No mechanics are registered."
    />
  );
}

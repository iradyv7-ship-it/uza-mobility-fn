'use client';

import { StatusBadge } from '@/components/shared/status-badge';
import { Column, DataTable } from '@/components/lender/data-table';
import {
  useJobCards,
  useMechanics,
  useRescueCalls,
  useTrainingCourses,
} from '@/queries/workshop';
import type { JobCard, Mechanic, RescueCall } from '@/types/workshop/job-card';
import type { TrainingCourse } from '@/types/workshop/training-course';

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

/**
 * The technician-training catalog — Mobility Ecosystem Blueprint, Section 05: "an agent
 * continuously pulls available technician training... into a structured catalog each
 * certified garage's portal surfaces to its own technicians." Read-only here; UZA staff
 * curate it from the admin panel.
 */
export function TrainingCoursesPanel() {
  const columns: Column<TrainingCourse>[] = [
    {
      header: 'Title',
      cell: (r) =>
        r.url ? (
          <a href={r.url} target="_blank" rel="noreferrer" className="underline">
            {r.title}
          </a>
        ) : (
          r.title
        ),
    },
    { header: 'Provider', cell: (r) => text(r.provider) },
    {
      header: 'Source',
      cell: (r) => (r.source === 'CHINESE_OEM' ? 'Chinese OEM' : 'Local Rwandan'),
    },
    { header: 'Language', cell: (r) => text(r.language) },
    { header: 'Category', cell: (r) => text(r.category.replaceAll('_', ' ')) },
  ];
  return (
    <DataTable
      title="Training courses"
      description="Chinese OEM and locally-produced content, side by side."
      columns={columns}
      query={useTrainingCourses()}
      empty="No courses yet."
    />
  );
}

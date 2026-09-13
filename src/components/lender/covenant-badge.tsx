import { AlertTriangle, ShieldAlert } from 'lucide-react';
import type { CovenantSeverity } from '@/types/lender/portfolio';

/**
 * The one glance an officer needs on a borrower row: is the covenant engine saying
 * something about this loan, and how loudly.
 *
 * Renders nothing when `worst` is null. That is deliberate — a loan the engine does not
 * watch (closed, not yet disbursed) and a loan with no open warning look the same here, and
 * neither should read as a green tick UZA never issued. A "Nothing open" state would be a
 * promise about the future; the badge only ever reports what is open now.
 */
export function CovenantBadge({
  worst,
  count,
}: {
  worst: CovenantSeverity | null;
  count?: number;
}) {
  if (!worst) return null;
  const alert = worst === 'ALERT';
  const Icon = alert ? ShieldAlert : AlertTriangle;
  const label = alert ? 'Alert' : worst === 'WARNING' ? 'Warning' : 'Notice';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
        alert
          ? 'border-destructive/40 bg-destructive/10 text-destructive'
          : 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400'
      }`}
      title={count && count > 1 ? `${count} open warnings` : undefined}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
      {count && count > 1 ? <span className="tabular-nums">×{count}</span> : null}
    </span>
  );
}

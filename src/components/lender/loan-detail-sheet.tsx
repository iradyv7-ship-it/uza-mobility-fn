'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { StatusBadge } from '@/components/shared/status-badge';
import { CovenantBadge } from '@/components/lender/covenant-badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { NumberInput, numberRegisterOptions } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { formatDateTime, formatRwf } from '@/lib/format';
import {
  useAskLenderInfoRequest,
  useLenderLoanDecisions,
  useLenderLoanInfoRequests,
  useLenderLoanInspections,
  useLenderLoanSavings,
  useLenderLoanCovenants,
  useLenderLoanTraining,
  useRecordLenderDecision,
  useSubmitLoanChangeRequest,
} from '@/queries/lender';
import {
  loanChangeTypes,
  type LenderDecisionOutcome,
  type LoanChangeType,
  type LoanStatus,
} from '@/types/lender/portfolio';

export type LoanSummaryHeader = {
  loanId: string;
  reference: string;
  applicantName: string;
  status: LoanStatus;
};

type Props = {
  lender: string;
  loan: LoanSummaryHeader | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * One loan's file, for a bank officer: what UZA Empower gives a lender in exchange for
 * financing at better terms than the vehicle alone would justify (inspections, training,
 * savings behaviour — see LenderService in uza-mobility-bn for what each means), plus the
 * three things a bank can actually DO on its own loan: record a decision, ask UZA a
 * question, and propose a change UZA must review before it takes effect.
 *
 * Takes the summary row as a prop rather than fetching it — there is no single
 * "get one loan" endpoint on the lender side, only the aggregate application/borrower
 * lists this sheet is opened from.
 */
export function LenderLoanDetailSheet({ lender, loan, open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="font-mono text-base">
            {loan?.reference ?? 'Loan'}
          </SheetTitle>
          <SheetDescription>
            {loan ? (
              <span className="flex items-center gap-2">
                <StatusBadge status={loan.status} />
                <span>{loan.applicantName}</span>
              </span>
            ) : null}
          </SheetDescription>
        </SheetHeader>

        {loan ? (
          <div className="space-y-8 py-6">
            <Covenants lender={lender} loanId={loan.loanId} />
            <Decisions lender={lender} loanId={loan.loanId} />
            <Separator />
            <InfoRequests lender={lender} loanId={loan.loanId} />
            <Separator />
            <ProposeChange lender={lender} loanId={loan.loanId} />
            <Separator />
            <Inspections lender={lender} loanId={loan.loanId} />
            <Separator />
            <SavingsAndTraining lender={lender} loanId={loan.loanId} />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

const outcomeOptions: { value: LenderDecisionOutcome; label: string }[] = [
  { value: 'APPROVED', label: 'Approve' },
  { value: 'REJECTED', label: 'Reject' },
  { value: 'CONDITIONAL', label: 'Conditionally approve' },
];

function Decisions({ lender, loanId }: { lender: string; loanId: string }) {
  const decisions = useLenderLoanDecisions(lender, loanId);
  const record = useRecordLenderDecision(lender, loanId);
  const { register, handleSubmit, control, setValue, reset, formState } = useForm<{
    outcome: LenderDecisionOutcome;
    reasons: string;
    conditions: string;
  }>({ defaultValues: { outcome: 'APPROVED', reasons: '', conditions: '' } });
  const outcome = useWatch({ control, name: 'outcome' });

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">Credit decisions</h3>
      {decisions.data && decisions.data.length > 0 ? (
        <ul className="space-y-2">
          {decisions.data.map((d) => (
            <li key={d.id} className="rounded-md border p-3 text-sm">
              <div className="flex items-center justify-between">
                <StatusBadge status={d.outcome} />
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(d.decidedAt)}
                </span>
              </div>
              <p className="mt-1">{d.reasons}</p>
              {d.conditions ? (
                <p className="mt-1 text-muted-foreground">Conditions: {d.conditions}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No decision recorded yet.</p>
      )}

      <form
        className="space-y-3 rounded-md border p-3"
        onSubmit={handleSubmit(async (values) => {
          await record.mutateAsync({
            outcome: values.outcome,
            reasons: values.reasons,
            conditions: values.outcome === 'CONDITIONAL' ? values.conditions : undefined,
          });
          reset({ outcome: 'APPROVED', reasons: '', conditions: '' });
        })}
      >
        <p className="text-xs font-medium text-muted-foreground">Record a new decision</p>
        <Select
          value={outcome}
          onValueChange={(v) => setValue('outcome', v as LenderDecisionOutcome)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {outcomeOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="space-y-1.5">
          <Label htmlFor="decision-reasons">Reasons *</Label>
          <Textarea id="decision-reasons" rows={2} {...register('reasons', { required: true })} />
        </div>
        {outcome === 'CONDITIONAL' ? (
          <div className="space-y-1.5">
            <Label htmlFor="decision-conditions">Conditions *</Label>
            <Textarea id="decision-conditions" rows={2} {...register('conditions')} />
          </div>
        ) : null}
        <Button type="submit" size="sm" disabled={record.isPending || !formState.isDirty}>
          {record.isPending ? 'Recording…' : 'Record decision'}
        </Button>
      </form>
    </section>
  );
}

function InfoRequests({ lender, loanId }: { lender: string; loanId: string }) {
  const requests = useLenderLoanInfoRequests(lender, loanId);
  const ask = useAskLenderInfoRequest(lender, loanId);
  const { register, handleSubmit, reset } = useForm<{ question: string }>();

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">Questions to UZA</h3>
      {requests.data && requests.data.length > 0 ? (
        <ul className="space-y-2">
          {requests.data.map((r) => (
            <li key={r.id} className="rounded-md border p-3 text-sm">
              <p className="font-medium">{r.question}</p>
              <p className="text-xs text-muted-foreground">Asked {formatDateTime(r.askedAt)}</p>
              {r.answer ? (
                <p className="mt-2 rounded bg-muted/40 p-2">{r.answer}</p>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">Awaiting an answer.</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No questions asked yet.</p>
      )}
      <form
        className="flex gap-2"
        onSubmit={handleSubmit(async (values) => {
          await ask.mutateAsync(values);
          reset();
        })}
      >
        <Textarea
          rows={1}
          placeholder="Ask UZA something about this file…"
          {...register('question', { required: true })}
        />
        <Button type="submit" size="sm" disabled={ask.isPending}>
          Ask
        </Button>
      </form>
    </section>
  );
}

const changeTypeLabels: Record<LoanChangeType, string> = {
  TENOR: 'Change the tenor',
  CONTRIBUTION: "Change the driver's contribution",
  VEHICLE_PRICE: 'Change the vehicle price',
};

/** The "requires permission, but should be possible" gate. */
function ProposeChange({ lender, loanId }: { lender: string; loanId: string }) {
  const propose = useSubmitLoanChangeRequest(lender, loanId);
  const [changeType, setChangeType] = useState<LoanChangeType>('TENOR');
  const { register, handleSubmit, reset } = useForm<{ value: number; note: string }>();

  const payloadKey =
    changeType === 'TENOR'
      ? 'toTenorMonths'
      : changeType === 'CONTRIBUTION'
        ? 'contributionRwf'
        : 'vehiclePriceRwf';

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">Propose a change</h3>
      <p className="text-xs text-muted-foreground">
        UZA reviews and applies this — it does not take effect until they do.
      </p>
      <form
        className="space-y-3 rounded-md border p-3"
        onSubmit={handleSubmit(async (values) => {
          await propose.mutateAsync({
            changeType,
            payload: { [payloadKey]: values.value },
            note: values.note || undefined,
          });
          reset();
        })}
      >
        <Select value={changeType} onValueChange={(v) => setChangeType(v as LoanChangeType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {loanChangeTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {changeTypeLabels[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="space-y-1.5">
          <Label htmlFor="change-value">
            {changeType === 'TENOR' ? 'New tenor (months) *' : 'New amount (RWF) *'}
          </Label>
          <NumberInput
            id="change-value"
            {...register('value', { ...numberRegisterOptions(), required: true })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="change-note">Note</Label>
          <Textarea id="change-note" rows={2} {...register('note')} />
        </div>
        <Button type="submit" size="sm" disabled={propose.isPending}>
          {propose.isPending ? 'Sending…' : 'Propose change'}
        </Button>
      </form>
    </section>
  );
}

/**
 * What is open on this loan right now, first thing in the sheet, and only when there is
 * something. It renders nothing otherwise — the same rule as the row badge: the engine
 * reports what is open, it does not certify that all is well. Every line here already
 * reached the driver first (module 2.8: call before you miss), so the officer can pick up
 * the phone knowing the borrower has seen the same words.
 */
function Covenants({ lender, loanId }: { lender: string; loanId: string }) {
  const covenants = useLenderLoanCovenants(lender, loanId);
  const data = covenants.data;
  if (!data || !data.worst || data.covenants.length === 0) return null;
  const alert = data.worst === 'ALERT';

  return (
    <>
      <section
        role={alert ? 'alert' : 'status'}
        className={`space-y-2 rounded-md border p-3 ${
          alert ? 'border-destructive/50 bg-destructive/5' : 'border-amber-500/50 bg-amber-500/5'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Open warnings</h3>
          <CovenantBadge worst={data.worst} count={data.covenants.length} />
        </div>
        <ul className="space-y-1.5">
          {data.covenants.map((c) => (
            <li key={c.kind} className="text-sm">
              <span className="font-medium">{c.severity === 'ALERT' ? 'Alert' : 'Warning'}:</span>{' '}
              {c.message}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          The borrower saw each of these before you did. A call from you is a conversation, not
          an escalation.
        </p>
      </section>
      <Separator />
    </>
  );
}

function Inspections({ lender, loanId }: { lender: string; loanId: string }) {
  const inspections = useLenderLoanInspections(lender, loanId);

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">Vehicle condition history</h3>
      {inspections.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : inspections.data && inspections.data.length > 0 ? (
        <ul className="space-y-2">
          {inspections.data.map((insp) => (
            <li key={insp.id} className="rounded-md border p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{insp.condition.replaceAll('_', ' ')}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(insp.inspectedAt)}
                </span>
              </div>
              <p className="text-muted-foreground">
                {[
                  insp.mileageKm != null ? `${insp.mileageKm.toLocaleString()} km` : null,
                  insp.batteryHealthPct != null ? `${insp.batteryHealthPct}% battery` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              {insp.notes ? <p className="mt-1">{insp.notes}</p> : null}
              {insp.findings && insp.findings.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {insp.findings.map((f, i) => (
                    <li key={i} className="text-xs">
                      <span className="font-medium">{f.severity}:</span> {f.item} —{' '}
                      {f.correctiveAction}
                      {f.resolvedAt ? ' (resolved)' : ' (open)'}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No inspections recorded yet.</p>
      )}
    </section>
  );
}

function KeyValueBlock({ data }: { data: Record<string, unknown> | undefined }) {
  if (!data) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const entries = Object.entries(data).filter(([, v]) => typeof v !== 'object');
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing to show yet.</p>;
  }
  return (
    <dl className="grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key} className="flex justify-between gap-2 sm:flex-col sm:gap-0.5">
          <dt className="text-muted-foreground">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</dt>
          <dd className="font-medium">
            {typeof value === 'number' && key.toLowerCase().includes('rwf')
              ? formatRwf(value)
              : String(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function SavingsAndTraining({ lender, loanId }: { lender: string; loanId: string }) {
  const savings = useLenderLoanSavings(lender, loanId);
  const training = useLenderLoanTraining(lender, loanId);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Savings behaviour</h3>
        <KeyValueBlock data={savings.data} />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Training</h3>
        <KeyValueBlock data={training.data} />
      </div>
    </section>
  );
}

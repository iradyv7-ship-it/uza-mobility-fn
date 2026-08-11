'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePriceCurrency } from '@/components/marketing/price-currency-provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  NumberInput,
  numberRegisterOptions,
} from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  invoiceLastRejectionReason,
  invoicePaymentWasRejected,
} from '@/lib/buyer/invoice-flow';
import { formatUsd, usdtToRwf } from '@/lib/format';
import { useMyInvoices, useSubmitPayment } from '@/queries/buyer';
import { submitPaymentSchema, type SubmitPaymentInput } from '@/schemas/buyer';

type SubmitPaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultInvoiceId?: string;
};

export function SubmitPaymentDialog({
  open,
  onOpenChange,
  defaultInvoiceId,
}: SubmitPaymentDialogProps) {
  const submit = useSubmitPayment();
  const { rate } = usePriceCurrency();
  const { data: invoices } = useMyInvoices(
    { payableOnly: true, limit: 50 },
    open,
  );
  const [proofs, setProofs] = useState<File[]>([]);

  const form = useForm<SubmitPaymentInput>({
    resolver: zodResolver(submitPaymentSchema),
    defaultValues: {
      invoiceId: defaultInvoiceId ?? '',
      amountPaid: 0,
      currency: 'USD',
    },
  });

  const selectedInvoiceId = form.watch('invoiceId');
  const paidCurrency = form.watch('currency');
  const selectedInvoice = invoices?.items.find(
    (invoice) => invoice.id === selectedInvoiceId,
  );
  const needsResubmit = selectedInvoice
    ? invoicePaymentWasRejected(selectedInvoice)
    : false;
  const rejectionReason = selectedInvoice
    ? invoiceLastRejectionReason(selectedInvoice)
    : null;

  const effectiveRate =
    selectedInvoice?.exchangeRateUsed ?? rate?.usdToRwfEffective ?? null;

  const syncAmountForCurrency = (currency: 'USD' | 'RWF', totalUsd: number) => {
    if (currency === 'RWF') {
      const rwf = usdtToRwf(totalUsd, effectiveRate);
      form.setValue('amountPaid', rwf ?? 0);
      return;
    }
    form.setValue('amountPaid', totalUsd);
  };

  useEffect(() => {
    if (!open) return;
    const invoice =
      invoices?.items.find((row) => row.id === defaultInvoiceId) ??
      invoices?.items[0];
    form.reset({
      invoiceId: defaultInvoiceId ?? invoice?.id ?? '',
      amountPaid: invoice?.totalAmountUsd ?? 0,
      currency: 'USD',
      transferReference: invoice?.paymentReference ?? '',
    });
    setProofs([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultInvoiceId, invoices?.items]);

  useEffect(() => {
    if (!selectedInvoice) return;
    const currency = form.getValues('currency') ?? 'USD';
    syncAmountForCurrency(currency, selectedInvoice.totalAmountUsd);
    if (!form.getValues('transferReference')) {
      form.setValue('transferReference', selectedInvoice.paymentReference);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInvoice?.id, effectiveRate]);

  const onSubmit = form.handleSubmit((values) => {
    submit.mutate(
      { body: values, proofs },
      {
        onSuccess: () => {
          form.reset({ invoiceId: '', amountPaid: 0, currency: 'USD' });
          setProofs([]);
          onOpenChange(false);
        },
      },
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {needsResubmit ? 'Resubmit payment proof' : 'Submit payment proof'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {rejectionReason ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <p className="font-medium">Previous payment not verified</p>
              <p className="mt-1">{rejectionReason}</p>
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label>Invoice</Label>
            <Select
              value={form.watch('invoiceId') || undefined}
              onValueChange={(v) => form.setValue('invoiceId', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select invoice" />
              </SelectTrigger>
              <SelectContent>
                {invoices?.items.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} · {formatUsd(inv.totalAmountUsd)} ·{' '}
                    {inv.status.replaceAll('_', ' ').toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(invoices?.items.length ?? 0) === 0 ? (
              <p className="text-xs text-muted-foreground">
                No payable invoices right now. Request an invoice first.
              </p>
            ) : null}
          </div>
          {selectedInvoice ? (
            <p className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
              Use payment reference{' '}
              <span className="font-mono">
                {selectedInvoice.paymentReference}
              </span>{' '}
              when transferring funds.
            </p>
          ) : null}
          <div className="space-y-1.5">
            <Label>Paid to account</Label>
            <Select
              value={paidCurrency}
              onValueChange={(value) => {
                const currency = value === 'RWF' ? 'RWF' : 'USD';
                form.setValue('currency', currency);
                if (selectedInvoice) {
                  syncAmountForCurrency(
                    currency,
                    selectedInvoice.totalAmountUsd,
                  );
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD receiving account</SelectItem>
                <SelectItem value="RWF">Rwf receiving account</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="amount">
                Amount paid ({paidCurrency === 'RWF' ? 'Rwf' : 'USD'})
              </Label>
              <NumberInput
                id="amount"
                min={0}
                step="0.01"
                {...form.register('amountPaid', numberRegisterOptions())}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ref">Transfer reference</Label>
              <Input id="ref" {...form.register('transferReference')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bank">Bank name</Label>
            <Input id="bank" {...form.register('bankName')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sender">Sender name</Label>
            <Input id="sender" {...form.register('senderName')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay-notes">Notes</Label>
            <Textarea id="pay-notes" rows={2} {...form.register('notes')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="proofs">Proof files (images or PDF)</Label>
            <Input
              id="proofs"
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={(e) => setProofs(Array.from(e.target.files ?? []))}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submit.isPending || (invoices?.items.length ?? 0) === 0}
            >
              {submit.isPending
                ? 'Submitting…'
                : needsResubmit
                  ? 'Resubmit payment'
                  : 'Submit payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

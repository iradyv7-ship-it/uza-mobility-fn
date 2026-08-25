'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PublishedListingPicker } from '@/components/buyer/published-listing-picker';
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
import { formatListingPrice, formatUsd } from '@/lib/format';
import { useSessionUser } from '@/hooks/session-user';
import { useMyInvoices, useSubmitFinancing } from '@/queries/buyer';
import {
  buyerTypes,
  financingRequestSchema,
  type FinancingRequestInput,
} from '@/schemas/buyer';
import type { PublicListingSummary } from '@/types/buyer/commerce';

type BuyerType = (typeof buyerTypes)[number];

function parseBuyerType(value: string | undefined): BuyerType {
  if (value && (buyerTypes as readonly string[]).includes(value)) {
    return value as BuyerType;
  }
  return 'INDIVIDUAL';
}

type FinancingRequestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultInvoiceId?: string;
};

export function FinancingRequestDialog({
  open,
  onOpenChange,
  defaultInvoiceId,
}: FinancingRequestDialogProps) {
  const { user } = useSessionUser();
  const submit = useSubmitFinancing();
  const { data: invoices } = useMyInvoices({ limit: 50 }, open);
  const [selectedListing, setSelectedListing] =
    useState<PublicListingSummary | null>(null);

  const form = useForm<FinancingRequestInput>({
    resolver: zodResolver(financingRequestSchema),
    defaultValues: {
      buyerName: '',
      phone: '',
      buyerType: 'INDIVIDUAL',
      invoiceId: '',
      listingId: '',
    },
  });

  const listingId = form.watch('listingId');
  const invoiceId = form.watch('invoiceId');

  useEffect(() => {
    if (!open || !user) return;
    setSelectedListing(null);
    form.reset({
      buyerName: `${user.firstName} ${user.lastName}`.trim(),
      phone: user.phone ?? '',
      buyerType: parseBuyerType(user.buyerProfile?.buyerType),
      organizationName: user.buyerProfile?.organizationName ?? '',
      invoiceId: defaultInvoiceId ?? '',
      listingId: '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user, defaultInvoiceId]);

  const onSubmit = form.handleSubmit((values) => {
    submit.mutate(values, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  });

  const listingError =
    form.formState.errors.listingId?.message ??
    form.formState.errors.invoiceId?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request financing support</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          UZA facilitation support — not a direct loan application. Link a
          published listing or one of your invoices.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fin-name">Your name</Label>
              <Input id="fin-name" {...form.register('buyerName')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fin-phone">Phone</Label>
              <Input id="fin-phone" {...form.register('phone')} />
            </div>
          </div>

          <PublishedListingPicker
            label="Vehicle listing"
            value={listingId ?? ''}
            enabled={open}
            allowClear
            selectedListing={selectedListing}
            onValueChange={(value, listing) => {
              form.setValue('listingId', value, { shouldValidate: true });
              setSelectedListing(listing);
            }}
            placeholder="Search published listings (optional)"
            helperText="Or pick one of your invoices below — at least one is required."
            error={listingError}
          />

          {selectedListing ? (
            <div className="space-y-1 rounded-md border bg-muted/30 p-3 text-sm">
              <p className="font-medium">Linked vehicle</p>
              <p>
                {selectedListing.brand} {selectedListing.model} ·{' '}
                {selectedListing.manufacturingYear}
              </p>
              {selectedListing.listingPricing?.finalPriceUsd != null ? (
                <p className="text-muted-foreground">
                  {formatListingPrice(selectedListing.listingPricing)}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label>Your invoice (optional)</Label>
            <Select
              value={invoiceId?.trim() ? invoiceId : 'none'}
              onValueChange={(v) =>
                form.setValue('invoiceId', v === 'none' ? '' : v, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {invoices?.items.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} · {inv.vehicleBrand} {inv.vehicleModel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Invoices from your buyer account, if you already requested one.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fin-deposit">Preferred deposit (USD)</Label>
            <NumberInput
              id="fin-deposit"
              min={0}
              {...form.register('preferredDepositUsd', numberRegisterOptions())}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fin-notes">Notes</Label>
            <Textarea id="fin-notes" rows={3} {...form.register('notes')} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submit.isPending}>
              {submit.isPending ? 'Submitting…' : 'Submit request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

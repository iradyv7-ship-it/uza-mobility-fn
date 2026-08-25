'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { formatDate, formatInvoiceTotal } from '@/lib/format';
import { downloadInvoiceDocument } from '@/lib/api/buyer';
import { invoiceStatusHint } from '@/lib/buyer/invoice-flow';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { BuyerInvoice } from '@/types/buyer/commerce';

type InvoiceBankDetailsDialogProps = {
  invoice: BuyerInvoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitPayment?: (invoiceId: string) => void;
};

export function InvoiceBankDetailsDialog({
  invoice,
  open,
  onOpenChange,
  onSubmitPayment,
}: InvoiceBankDetailsDialogProps) {
  const [downloading, setDownloading] = useState(false);

  if (!invoice) return null;

  const hint = invoiceStatusHint(invoice.status, invoice.notes);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment instructions</DialogTitle>
        </DialogHeader>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Invoice</dt>
            <dd className="font-medium">{invoice.invoiceNumber}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Amount due</dt>
            <dd className="font-medium">{formatInvoiceTotal(invoice)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Payment reference</dt>
            <dd className="font-mono text-xs">{invoice.paymentReference}</dd>
          </div>
          {invoice.beneficiaryName ? (
            <div>
              <dt className="text-muted-foreground">Beneficiary</dt>
              <dd>{invoice.beneficiaryName}</dd>
            </div>
          ) : null}
          {invoice.currency === 'USD' &&
          (invoice.bankName || invoice.accountNumber) ? (
            <div>
              <dt className="text-muted-foreground">USD receiving account</dt>
              <dd>
                {invoice.bankName ?? '—'}
                {invoice.accountNumber ? (
                  <span className="mt-1 block font-mono text-xs">
                    {invoice.accountNumber}
                  </span>
                ) : null}
              </dd>
            </div>
          ) : null}
          {invoice.rwfBankName || invoice.rwfAccountNumber ? (
            <div>
              <dt className="text-muted-foreground">Rwf receiving account</dt>
              <dd>
                {invoice.rwfBankName ?? '—'}
                {invoice.rwfAccountNumber ? (
                  <span className="mt-1 block font-mono text-xs">
                    {invoice.rwfAccountNumber}
                  </span>
                ) : null}
              </dd>
            </div>
          ) : null}
          {invoice.paymentDeadline ? (
            <div>
              <dt className="text-muted-foreground">Pay before</dt>
              <dd>{formatDate(invoice.paymentDeadline)}</dd>
            </div>
          ) : null}
        </dl>
        <p className="text-xs text-muted-foreground">
          {invoice.currency === 'USD'
            ? 'Pay to either the USD or Rwf account and include the payment reference on your transfer.'
            : 'Pay to the Rwf account and include the payment reference on your transfer.'}
        </p>
        {hint ? (
          <p className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
            {hint}
          </p>
        ) : null}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={downloading}
            onClick={async () => {
              try {
                setDownloading(true);
                await downloadInvoiceDocument(
                  invoice.id,
                  invoice.invoiceNumber,
                );
              } catch {
                toast.error('Could not download invoice PDF');
              } finally {
                setDownloading(false);
              }
            }}
          >
            {downloading ? 'Downloading…' : 'Download PDF'}
          </Button>
          {onSubmitPayment ? (
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onSubmitPayment(invoice.id);
              }}
            >
              Submit payment
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

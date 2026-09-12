'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { formatRwf } from '@/lib/format';
import { useAllocate } from '@/queries/wallet';
import { buckets, type Bucket, type BucketBalance } from '@/types/buyer/wallet';

/**
 * Move a label between buckets. No money moves; the bank's balance is unchanged. The one
 * thing a driver cannot do here is move money out of the loan bucket — the API refuses and
 * names the help button instead — so the UI does not offer it.
 */
export function MoveBetweenBuckets({ buckets: balances }: { buckets: BucketBalance[] }) {
  const allocate = useAllocate();
  const [from, setFrom] = useState<Bucket>('PERSONAL');
  const [to, setTo] = useState<Bucket>('LOAN');
  const [amount, setAmount] = useState('');
  const amountRwf = Number(amount.replace(/[,\s]/g, ''));
  const available = balances.find((b) => b.bucket === from)?.confirmedRwf ?? 0;
  const valid = from !== to && Number.isInteger(amountRwf) && amountRwf > 0 && amountRwf <= available;
  const label = (b: Bucket) => balances.find((x) => x.bucket === b)?.label.en ?? b;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Move between buckets</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid || allocate.isPending) return;
            allocate.mutate({ from, to, amountRwf }, { onSuccess: () => setAmount('') });
          }}
        >
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="from">From</Label>
              <NativeSelect id="from" value={from} onChange={(e) => setFrom(e.target.value as Bucket)}>
                {buckets.filter((b) => b !== 'LOAN').map((b) => (
                  <NativeSelectOption key={b} value={b}>{label(b)}</NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <ArrowRight className="mb-2.5 size-4 text-muted-foreground" aria-hidden />
            <div className="space-y-1.5">
              <Label htmlFor="to">To</Label>
              <NativeSelect id="to" value={to} onChange={(e) => setTo(e.target.value as Bucket)}>
                {buckets.map((b) => (
                  <NativeSelectOption key={b} value={b}>{label(b)}</NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mv">Amount (RWF) — {formatRwf(available)} confirmed in {label(from)}</Label>
            <Input id="mv" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5,000" />
          </div>
          <Button type="submit" disabled={!valid || allocate.isPending} className="w-full sm:w-auto">
            {allocate.isPending ? 'Moving…' : 'Move the label'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Only the label moves; your balance at the bank is the same. Money set aside for the loan stays there — if a week is short, use the help button above.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

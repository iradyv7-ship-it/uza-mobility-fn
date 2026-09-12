'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRecordDeposit } from '@/queries/wallet';
import { buckets, type Bucket } from '@/types/buyer/wallet';

const LABELS: Record<Bucket, string> = {
  LOAN: 'Loan',
  MAINTENANCE: 'Maintenance',
  CHARGING: 'Charging',
  INSURANCE: 'Insurance',
  PERSONAL: 'My savings',
};

/**
 * "I deposited — here is the SMS." The MoMo transaction ID is the idempotency key, so a
 * driver who types it twice does no harm. By default the deposit is split by their own rule,
 * loan first; they can send it all to one bucket instead.
 */
export function DepositForm({ split }: { split: Record<Bucket, number> }) {
  const record = useRecordDeposit();
  const [momo, setMomo] = useState('');
  const [amount, setAmount] = useState('');
  const [bucket, setBucket] = useState<Bucket | ''>('');

  const amountRwf = Number(amount.replace(/[,\s]/g, ''));
  const valid = momo.trim().length >= 6 && Number.isInteger(amountRwf) && amountRwf >= 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">I made a deposit</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid || record.isPending) return;
            record.mutate(
              { momoTransactionId: momo.trim(), amountRwf, bucket: bucket || undefined },
              { onSuccess: () => { setMomo(''); setAmount(''); setBucket(''); } },
            );
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="momo">MoMo transaction ID</Label>
            <Input id="momo" inputMode="text" autoComplete="off" placeholder="From the confirmation SMS" value={momo} onChange={(e) => setMomo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amt">Amount (RWF)</Label>
            <Input id="amt" inputMode="numeric" placeholder="30,000" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium">Put it</legend>
            <div className="flex flex-wrap gap-2">
              <label className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm ${bucket === '' ? 'border-primary bg-primary/5' : ''}`}>
                <input type="radio" name="bucket" className="sr-only" checked={bucket === ''} onChange={() => setBucket('')} />
                By my rule ({split.LOAN}% loan first)
              </label>
              {buckets.map((b) => (
                <label key={b} className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm ${bucket === b ? 'border-primary bg-primary/5' : ''}`}>
                  <input type="radio" name="bucket" className="sr-only" checked={bucket === b} onChange={() => setBucket(b)} />
                  All to {LABELS[b]}
                </label>
              ))}
            </div>
          </fieldset>
          <Button type="submit" disabled={!valid || record.isPending} className="w-full sm:w-auto">
            {record.isPending ? 'Recording…' : 'Record deposit'}
          </Button>
          <p className="text-xs text-muted-foreground">
            It shows as &ldquo;waiting for the bank&rdquo; until it appears on your statement. Your money is already in your account either way.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

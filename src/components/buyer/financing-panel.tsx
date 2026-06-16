'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BuyerFinancingDetailSheet } from '@/components/buyer/financing-detail-sheet';
import { FinancingRequestDialog } from '@/components/buyer/financing-request-dialog';
import { StatusBadge } from '@/components/shared/status-badge';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatUsd } from '@/lib/format';
import { useMyFinancing } from '@/queries/buyer';
import type { BuyerFinancingRequest } from '@/types/buyer/commerce';

export function BuyerFinancingPanel() {
  const searchParams = useSearchParams();
  const invoiceIdParam = searchParams.get('invoiceId');
  const [requestOpen, setRequestOpen] = useState(false);
  const [defaultInvoiceId, setDefaultInvoiceId] = useState<
    string | undefined
  >();
  const [detailRequest, setDetailRequest] =
    useState<BuyerFinancingRequest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { data, isLoading, isError, error } = useMyFinancing();

  useEffect(() => {
    if (!invoiceIdParam) return;
    setDefaultInvoiceId(invoiceIdParam);
    setRequestOpen(true);
  }, [invoiceIdParam]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Financing support"
          description="Track facilitation requests submitted to UZA and partner banks."
        />
        <Button
          onClick={() => {
            setDefaultInvoiceId(undefined);
            setRequestOpen(true);
          }}
        >
          New request
        </Button>
      </div>

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load requests'}
        </p>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deposit</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}
            {!isLoading && (data?.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  No financing requests yet.
                </TableCell>
              </TableRow>
            ) : null}
            {data?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.buyerName}</TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell>
                  {row.preferredDepositUsd != null
                    ? formatUsd(row.preferredDepositUsd)
                    : '—'}
                </TableCell>
                <TableCell>{formatDate(row.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDetailRequest(row);
                      setDetailOpen(true);
                    }}
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <BuyerFinancingDetailSheet
        request={detailRequest}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <FinancingRequestDialog
        open={requestOpen}
        onOpenChange={setRequestOpen}
        defaultInvoiceId={defaultInvoiceId}
      />
    </div>
  );
}

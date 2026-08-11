'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { SellerPartFormDialog } from '@/components/seller/part-form-dialog';
import {
  SellerStatusBanner,
  useSellerCanTrade,
} from '@/components/seller/seller-status-banner';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
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
import { useDeactivateSellerPart, useMyParts } from '@/queries/seller';
import type { SellerPart } from '@/types/seller/marketplace';

import { formatUsd } from '@/lib/format';

export function SellerPartsPanel() {
  const canTrade = useSellerCanTrade();
  const { data, isLoading, isError, error } = useMyParts();
  const deactivate = useDeactivateSellerPart();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SellerPart | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<SellerPart | null>(
    null,
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (part: SellerPart) => {
    setEditing(part);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="My parts"
          description="Parts are reviewed by an administrator before they appear in the marketplace."
        />
        <Button onClick={openCreate} disabled={!canTrade}>
          New part
        </Button>
      </div>

      <SellerStatusBanner />

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load parts'}
        </p>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
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
                  No parts listed yet.
                </TableCell>
              </TableRow>
            ) : null}
            {data?.map((part) => (
              <TableRow key={part.id}>
                <TableCell>
                  <p className="font-medium">{part.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {part.categorySlug}
                  </p>
                </TableCell>
                <TableCell>
                  <StatusBadge status={part.status} />
                </TableCell>
                <TableCell>{formatUsd(part.priceUsd)}</TableCell>
                <TableCell>{part.stockQuantity}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-1">
                    {part.status === 'PENDING_REVIEW' ||
                    part.status === 'REJECTED' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={!canTrade || deactivate.isPending}
                        onClick={() => openEdit(part)}
                      >
                        Edit
                      </Button>
                    ) : null}
                    {part.status === 'APPROVED' && part.isActive ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={!canTrade || deactivate.isPending}
                        onClick={() => setDeactivateTarget(part)}
                      >
                        Deactivate
                      </Button>
                    ) : null}
                    {part.rejectionReason ? (
                      <p className="text-xs text-destructive">
                        {part.rejectionReason}
                      </p>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SellerPartFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        part={editing}
      />

      <ConfirmDialog
        open={Boolean(deactivateTarget)}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        title="Deactivate this part?"
        description="It will no longer appear in the public parts catalog."
        confirmLabel="Deactivate"
        variant="destructive"
        loading={deactivate.isPending}
        onConfirm={() => {
          if (!deactivateTarget) return;
          deactivate.mutate(deactivateTarget.id, {
            onSuccess: () => setDeactivateTarget(null),
          });
        }}
      />
    </div>
  );
}

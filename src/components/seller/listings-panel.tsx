'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { StatusBadge } from '@/components/shared/status-badge';
import { SellerListingFormDialog } from '@/components/seller/listing-form-dialog';
import {
  SellerStatusBanner,
  useSellerCanTrade,
} from '@/components/seller/seller-status-banner';
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
import {
  canDeleteListing,
  canSubmitListing,
  isListingEditable,
} from '@/lib/seller/listing-form';
import {
  useDeleteSellerListing,
  useMyListings,
  useSubmitSellerListing,
} from '@/queries/seller';
import type { SellerListing } from '@/types/seller/marketplace';

import { formatUsd } from '@/lib/format';

export function SellerListingsPanel() {
  const canTrade = useSellerCanTrade();
  const { data, isLoading, isError, error } = useMyListings();
  const submitListing = useSubmitSellerListing();
  const deleteListing = useDeleteSellerListing();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SellerListing | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SellerListing | null>(null);
  const busy = submitListing.isPending || deleteListing.isPending;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (listing: SellerListing) => {
    setEditing(listing);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="My listings"
          description="Create drafts, upload photos, and submit for administrator review before publishing."
        />
        <Button onClick={openCreate} disabled={!canTrade}>
          New listing
        </Button>
      </div>

      <SellerStatusBanner />

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load listings'}
        </p>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Updated</TableHead>
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
                  No listings yet. Create your first draft to get started.
                </TableCell>
              </TableRow>
            ) : null}
            {data?.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{listing.listingTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {listing.brand} {listing.model} ·{' '}
                      {listing.manufacturingYear}
                    </p>
                    {listing.rejectionReason ? (
                      <p className="text-xs text-destructive">
                        Rejected: {listing.rejectionReason}
                      </p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={listing.status} />
                </TableCell>
                <TableCell>
                  {formatUsd(listing.listingPricing?.finalPriceUsd)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(listing.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-1">
                    {listing.status === 'PUBLISHED' ? (
                      <Button size="sm" variant="outline" asChild>
                        <Link
                          href={`/listings/${listing.slug}`}
                          target="_blank"
                        >
                          View live
                        </Link>
                      </Button>
                    ) : null}
                    {isListingEditable(listing.status) ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={!canTrade || busy}
                        onClick={() => openEdit(listing)}
                      >
                        Edit
                      </Button>
                    ) : null}
                    {canSubmitListing(listing.status) ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          !canTrade || busy || (listing.photos?.length ?? 0) < 1
                        }
                        onClick={() => submitListing.mutate(listing.id)}
                      >
                        Submit
                      </Button>
                    ) : null}
                    {canDeleteListing(listing.status) ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={!canTrade || busy}
                        onClick={() => setDeleteTarget(listing)}
                      >
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SellerListingFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        listing={editing}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete draft listing?"
        description="This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteListing.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteListing.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
      />
    </div>
  );
}

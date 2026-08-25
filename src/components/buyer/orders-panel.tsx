'use client';

import { useState } from 'react';
import { BuyerOrderDetailSheet } from '@/components/buyer/order-detail-sheet';
import { StatusBadge } from '@/components/shared/status-badge';
import { PaginationBar } from '@/components/shared/pagination-bar';
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
import { formatInvoiceTotal } from '@/lib/format';
import { useMyOrders } from '@/queries/buyer';
import type { BuyerOrder, BuyerOrdersFilters } from '@/types/buyer/commerce';

export function BuyerOrdersPanel() {
  const [filters, setFilters] = useState<BuyerOrdersFilters>({
    page: 1,
    limit: 20,
  });
  const [viewing, setViewing] = useState<BuyerOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, isLoading, isError, error } = useMyOrders(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My orders"
        description="Track fulfillment and delivery for your vehicle purchases."
      />

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load orders'}
        </p>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
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
            {!isLoading && (data?.items.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  No orders yet. After your payment is verified, your order will
                  appear here with tracking updates.
                </TableCell>
              </TableRow>
            ) : null}
            {data?.items.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.orderNumber}
                </TableCell>
                <TableCell>{order.listing.listingTitle}</TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell>{formatInvoiceTotal(order.invoice)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setViewing(order);
                      setDetailOpen(true);
                    }}
                  >
                    Track
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data?.meta ? (
        <PaginationBar
          meta={data.meta}
          onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        />
      ) : null}

      <BuyerOrderDetailSheet
        order={viewing}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}

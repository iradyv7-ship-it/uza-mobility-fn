import type { ElementType } from 'react';
'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SellerStatusBanner } from '@/components/seller/seller-status-banner';
import { workspaceRoutes } from '@/config/routes';
import { useMyListings, useMyParts } from '@/queries/seller';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  List,
  Wrench,
  User,
} from 'lucide-react';

function countByStatus(listings: { status: string }[], statuses: string[]) {
  return listings.filter((l) => statuses.includes(l.status)).length;
}

export function SellerOverviewPanel() {
  const { data: listings, isLoading: listingsLoading } = useMyListings();
  const { data: parts, isLoading: partsLoading } = useMyParts();

  const draftCount = countByStatus(listings ?? [], ['DRAFT']);
  const pendingCount = countByStatus(listings ?? [], ['PENDING_REVIEW']);
  const liveCount = countByStatus(listings ?? [], ['APPROVED', 'PUBLISHED']);
  const rejectedCount = countByStatus(listings ?? [], ['REJECTED']);
  const activeParts = (parts ?? []).filter((p) => p.isActive).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Seller overview"
        description="Manage your vehicle listings, parts inventory, and seller profile."
      />

      <SellerStatusBanner />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Draft listings"
          value={draftCount}
          loading={listingsLoading}
          icon={FileText}
        />
        <StatCard
          title="Pending review"
          value={pendingCount}
          loading={listingsLoading}
          icon={Clock}
        />
        <StatCard
          title="Live listings"
          value={liveCount}
          loading={listingsLoading}
          icon={CheckCircle}
        />
        <StatCard
          title="Rejected"
          value={rejectedCount}
          loading={listingsLoading}
          icon={XCircle}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link
              href={workspaceRoutes.sellerListings}
              className="flex items-center"
            >
              <List className="size-4" />
              Manage listings
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link
              href={workspaceRoutes.sellerParts}
              className="flex items-center"
            >
              <Wrench className="size-4" />
              Manage parts ({partsLoading ? '…' : activeParts} active)
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link
              href={workspaceRoutes.sellerProfile}
              className="flex items-center"
            >
              <User className="size-4" />
              Seller profile
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  loading,
  icon,
}: {
  title: string;
  value: number;
  loading: boolean;
  icon?: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2 pb-2">
        {icon ? (
          <span className="text-muted-foreground">
            {(() => {
              const Icon: ElementType = icon;
              return <Icon className="size-5" />;
            })()}
          </span>
        ) : null}
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-12" />
        ) : (
          <p className="text-2xl font-semibold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

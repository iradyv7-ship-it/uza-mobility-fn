import { notFound } from 'next/navigation';
import { LenderOverviewPanel } from '@/components/lender/overview-panel';
import { findLender } from '@/config/lenders';

export default async function LenderOverviewPage({
  params,
}: {
  params: Promise<{ lender: string }>;
}) {
  const lender = findLender((await params).lender);
  if (!lender) notFound();
  return <LenderOverviewPanel lender={lender} />;
}

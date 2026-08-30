import { notFound } from 'next/navigation';
import { BorrowersPanel } from '@/components/lender/list-panels';
import { findLender } from '@/config/lenders';

export default async function Page({ params }: { params: Promise<{ lender: string }> }) {
  const lender = findLender((await params).lender);
  if (!lender) notFound();
  return <BorrowersPanel lender={lender.key} />;
}

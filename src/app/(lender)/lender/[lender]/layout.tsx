import { notFound } from 'next/navigation';
import { LenderAccess } from '@/components/lender/lender-access';
import { LenderShell } from '@/components/lender/lender-shell';
import { findLender, LENDERS } from '@/config/lenders';

/**
 * Pre-render one route per configured lender.
 *
 * Adding a bank to `config/lenders.ts` produces its whole portal from here: the
 * segment, the guard, the navigation and every page below. No file in this directory
 * names a bank.
 */
export function generateStaticParams() {
  return LENDERS.map((l) => ({ lender: l.key }));
}

export default async function LenderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lender: string }>;
}) {
  const { lender: key } = await params;
  const lender = findLender(key);
  // An unknown key is a 404, not a refusal. A refusal would confirm that some other
  // key does exist, which is how this page starts answering who banks with UZA.
  if (!lender) notFound();

  return (
    <LenderAccess lender={lender}>
      <LenderShell lender={lender}>{children}</LenderShell>
    </LenderAccess>
  );
}

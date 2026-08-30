import { notFound } from 'next/navigation';
import { CollateralPanel } from '@/components/lender/collateral-panel';
import { findLender } from '@/config/lenders';

/**
 * The cash-collateral facility.
 *
 * This route exists ONLY for a lender the registry entitles. That is enforced by not
 * generating the others, rather than by refusing them at request time:
 *
 * The route is rendered on demand rather than prerendered, and that is the whole reason
 * it works. `notFound()` on a PRERENDERED path serves the 404 page with a 200 STATUS —
 * so `/lender/equity/collateral` answered 200 while `/lender/bk/collateral` answered 404,
 * and that difference tells anyone reading status codes that `equity` is a known lender
 * and `collateral` is a known route shape. That IS the disclosure, and it was live here
 * until this line was added.
 *
 * Narrowing the segment from this file cannot work: `[lender]` is owned by the parent
 * layout's `generateStaticParams`, and a deeper `dynamicParams = false` does not restrict
 * it. Rendering on demand does, and it keeps the entitlement in `config/lenders.ts`
 * rather than hard-coding a bank's name into a route path.
 *
 * The navigation never lists the link either, so an unentitled bank has no path to it and
 * no evidence it exists. The API refuses it a third time, which is the enforcement that
 * actually counts.
 */
export const dynamic = 'force-dynamic';

export default async function CollateralPage({
  params,
}: {
  params: Promise<{ lender: string }>;
}) {
  const lender = findLender((await params).lender);
  // Belt and braces: unreachable while dynamicParams is false, and cheap to keep.
  if (!lender?.seesCollateral) notFound();
  return <CollateralPanel lender={lender} />;
}

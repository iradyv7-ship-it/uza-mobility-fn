/**
 * Every financial institution with a portal here, described as data.
 *
 * This file exists to answer one question: when UZA signs a fifth bank, is that a data
 * change or a code change?
 *
 * It has to be a data change. A portal that needs a developer, a pull request and a
 * deploy every time a lender signs is a portal that gets bypassed by somebody emailing
 * a spreadsheet — which is the disclosure this whole design prevents. So a lender is a
 * row below, and adding one touches no page, no guard and no switch statement. The
 * remaining step is a `LENDER_<KEY>` role in the database, assigned to that bank's users.
 *
 * `src/config/lenders.test.ts` asserts that property for every lender configured.
 */

export interface LenderConfig {
  /** Stable key. It appears in URLs and in the role name, so it must not change once live. */
  readonly key: string;
  readonly name: string;
  /**
   * Whether this lender may see the cash-collateral facility.
   *
   * The default is false and it must stay that way. Onboarding a lender is routine and
   * should be easy; granting one sight of the facility is a founder's decision, and it
   * should cost a file change, a test change and somebody reviewing both.
   *
   * For a lender without it the facility is ABSENT, not disabled. A greyed-out link
   * still tells Equity the facility exists, and that is itself the disclosure.
   */
  readonly seesCollateral?: boolean;
}

export const LENDERS: readonly LenderConfig[] = [
  { key: 'unguka', name: 'Unguka Bank (LOLC)', seesCollateral: true },
  { key: 'equity', name: 'Equity Bank Rwanda' },
  { key: 'ncba', name: 'NCBA Rwanda' },
] as const;

export function findLender(key: string): LenderConfig | undefined {
  const normalised = key.trim().toLowerCase();
  return LENDERS.find((l) => l.key === normalised);
}

/**
 * The role that opens a given lender's portal.
 *
 * Derived from the key rather than listed separately, so the two cannot drift apart.
 */
export function lenderRole(key: string): string {
  return `LENDER_${key.trim().toUpperCase()}`;
}

export interface LenderNavItem {
  readonly label: string;
  readonly href: string;
}

export function lenderNav(lender: LenderConfig): LenderNavItem[] {
  const base = `/lender/${lender.key}`;
  return [
    { label: 'Overview', href: base },
    { label: 'Applications', href: `${base}/applications` },
    { label: 'Borrowers', href: `${base}/borrowers` },
    { label: 'Disbursements', href: `${base}/disbursements` },
    { label: 'Portfolio', href: `${base}/portfolio` },
    ...(lender.seesCollateral
      ? [{ label: 'Credit enhancement', href: `${base}/collateral` }]
      : []),
  ];
}

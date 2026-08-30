/**
 * What a financial institution sees about its own borrowers.
 *
 * Every shape here is scoped to one lender. There is no "all lenders" type on purpose:
 * the API refuses a file that does not belong to the caller, and a type that could hold
 * two banks' borrowers at once is the first step towards a screen that shows them.
 */

export type LoanStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'DECLINED'
  | 'DISBURSED'
  | 'ACTIVE'
  | 'IN_ARREARS'
  | 'CLOSED';

export interface LenderSummary {
  applicationsPending: number;
  activeLoans: number;
  disbursedTotal: number;
  arrearsTotal: number;
}

export interface LenderApplication {
  id: string;
  reference: string;
  applicantName: string;
  amount: number;
  status: LoanStatus;
  createdAt: string;
}

export interface LenderBorrower {
  id: string;
  /** The UZA ID. The same person in Nexus, Mobility and the workshop. */
  uzaId: string;
  displayName: string;
  loanRef: string | null;
  balance: number | null;
  status: LoanStatus;
}

export interface LenderDisbursement {
  id: string;
  reference: string;
  amount: number;
  disbursedAt: string;
  status: string;
}

export interface LenderPortfolioRow {
  id: string;
  cohort: string;
  count: number;
  outstanding: number;
  arrears: number;
}

/**
 * The cash-collateral facility.
 *
 * Only fetched from a route that exists solely for an entitled lender. UZA does not
 * hold client money; these amounts sit in the facility account under its own terms,
 * and nothing here is a warranty of repayment.
 */
export interface CreditEnhancement {
  pledged: number;
  released: number;
  calledBack: number;
}

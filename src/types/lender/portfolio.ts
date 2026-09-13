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

/**
 * How loud the covenant engine is about a loan. NOTICE goes to the driver only; WARNING
 * reaches UZA; ALERT is the point at which the lender is told. The lender therefore only
 * ever sees WARNING and ALERT here — a NOTICE is the driver's business.
 */
export type CovenantSeverity = 'NOTICE' | 'WARNING' | 'ALERT';

export interface LenderCovenant {
  kind: string;
  severity: CovenantSeverity;
  message: string;
  detail: Record<string, unknown>;
}

export interface LenderLoanCovenants {
  loanRef: string | null;
  worst: CovenantSeverity | null;
  covenants: LenderCovenant[];
}

export interface LenderBorrower {
  id: string;
  /** The UZA ID. The same person in Nexus, Mobility and the workshop. */
  uzaId: string;
  displayName: string;
  loanRef: string | null;
  balance: number | null;
  status: LoanStatus;
  /**
   * The worst open covenant the lender may see on this loan, or `null` when there is none
   * — including when the loan is in a state the engine does not watch. `null` is "nothing
   * to show", never "all clear".
   */
  worst: CovenantSeverity | null;
  openWarnings: number;
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

/**
 * The loan-detail view — one file, everything a bank officer needs to act on it. Every
 * type here mirrors `LenderService`'s own return shapes in uza-mobility-bn exactly (see
 * that file's doc comments for what each data product means and why it exists).
 */

export type LenderDecisionOutcome = 'APPROVED' | 'REJECTED' | 'CONDITIONAL';

export interface LenderDecisionRecord {
  id: string;
  loanId: string;
  outcome: LenderDecisionOutcome;
  reasons: string;
  conditions: string | null;
  decidedAt: string;
}

export interface LenderInfoRequestRecord {
  id: string;
  loanId: string;
  question: string;
  answer: string | null;
  askedAt: string;
  answeredAt: string | null;
}

export type InspectionFindingSeverity = 'MINOR' | 'MAJOR' | 'SAFETY';

export interface LenderInspectionFinding {
  item: string;
  severity: InspectionFindingSeverity;
  correctiveAction: string;
  resolvedAt?: string;
}

export type VehicleCondition = 'GOOD' | 'FAIR' | 'POOR' | 'URGENT_ATTENTION';

export interface LenderInspectionRecord {
  id: string;
  inspectedAt: string;
  mileageKm: number | null;
  batteryHealthPct: number | null;
  condition: VehicleCondition;
  notes: string | null;
  findings: LenderInspectionFinding[] | null;
  passed: boolean | null;
  certificateRef: string | null;
}

/** A lender proposing a change to a loan they cannot edit directly — requires UZA review. */
export const loanChangeTypes = ['TENOR', 'CONTRIBUTION', 'VEHICLE_PRICE'] as const;
export type LoanChangeType = (typeof loanChangeTypes)[number];

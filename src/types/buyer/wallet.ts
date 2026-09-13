/**
 * The driver's wallet, as the API returns it. Mirrors `uza-mobility-bn/src/modules/wallet`.
 *
 * Every screen that shows a balance also shows `whoseMoney.statement`, because the wallet
 * is a ledger view over the driver's own account at a licensed institution — UZA never
 * holds the money — and a driver must never be left believing otherwise.
 */

export const buckets = ['LOAN', 'MAINTENANCE', 'CHARGING', 'INSURANCE', 'PERSONAL'] as const;
export type Bucket = (typeof buckets)[number];

export type BucketBalance = {
  bucket: Bucket;
  confirmedRwf: number;
  pendingRwf: number;
  totalRwf: number;
  label: { en: string; rw: string; purpose: string; purposeRw: string };
};

export type DailyRecord = {
  date: string;
  depositedRwf: number;
  targetRwf: number;
  hit: boolean;
};

export type WalletOverview = {
  whoseMoney: {
    statement: string;
    institutionName: string | null;
    institutionAccountMasked: string | null;
    standingInstruction: { status: 'PENDING' | 'ACTIVE' | 'REVOKED'; activatedAt: string | null } | null;
  };
  targets: { dailyTargetRwf: number | null; contributionTargetRwf: number | null };
  buckets: BucketBalance[];
  split: Record<Bucket, number>;
  performance: {
    windowDays: number;
    daysHit: number;
    daysWithAnyDeposit: number;
    consistencyRatio: number;
    currentStreak: number;
    longestStreak: number;
    totalConfirmedRwf: number;
    totalPendingRwf: number;
    averageDailyRwf: number;
    progressPct: number | null;
    daily: DailyRecord[];
  };
  today: { depositedRwf: number; targetRwf: number; remainingRwf: number };
};

export type LedgerLine = {
  id: string;
  bucket: Bucket | null;
  direction: 'CREDIT' | 'DEBIT';
  reason: string;
  amountRwf: number;
  externalRef: string | null;
  recordedBy: 'DRIVER' | 'STAFF' | 'INSTITUTION';
  confirmedAt: string | null;
  occurredAt: string;
  note: string | null;
};

export type Covenant = {
  kind: string;
  severity: 'NOTICE' | 'WARNING' | 'ALERT';
  message: string;
  detail: Record<string, string | number | boolean | null>;
};

export type WalletWarnings = {
  loan: string | null;
  worst: 'NOTICE' | 'WARNING' | 'ALERT' | null;
  covenants: Covenant[];
};

export type RecordDepositInput = {
  momoTransactionId: string;
  amountRwf: number;
  bucket?: Bucket;
};

export type AllocateInput = { from: Bucket; to: Bucket; amountRwf: number };

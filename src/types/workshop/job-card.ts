/**
 * The workshop's shapes.
 *
 * The states mirror the machine in the API (`src/modules/workshop/job-card.state.ts`).
 * They are duplicated here rather than imported because the two repositories deploy
 * separately; a screen that renders an unknown state as itself is better than one that
 * cannot ship until the backend catches up.
 */
export type JobCardState =
  | 'RECEIVED'
  | 'DIAGNOSING'
  | 'AWAITING_AUTHORISATION'
  | 'ADDITIONAL_WORK_FOUND'
  | 'AWAITING_PARTS'
  | 'IN_PROGRESS'
  | 'QUALITY_CHECK'
  | 'ROAD_TEST'
  | 'READY'
  | 'COLLECTED'
  | 'AT_RISK'
  | 'OVERDUE';

export interface JobCard {
  id: string;
  reference: string;
  vehiclePlate: string | null;
  state: JobCardState | string;
  assignedTo: string | null;
  promisedAt: string | null;
}

export interface RescueCall {
  id: string;
  reference: string;
  faultType: string;
  /**
   * Null when no certified responder was available. The dispatcher sends nobody rather
   * than somebody uncertified, so this screen has to show the gap rather than hide it.
   */
  responderName: string | null;
  status: string;
}

export interface Mechanic {
  id: string;
  name: string;
  grade: string | null;
  /** High-voltage certification. Work on a live pack without it is refused upstream. */
  hvCertificateStatus: string | null;
  hvCertificateExpiresAt: string | null;
}

/**
 * TrainingPeaks API client — stub stage.
 *
 * TrainingPeaks does not expose a public coach-side API. To assign plans
 * from a coach's library to an athlete, you need credentials issued under
 * the TrainingPeaks Coach Partner Program (OAuth2 + REST). We do not yet
 * have those credentials.
 *
 * Until the partnership lands this module is the *contract* the rest of
 * the CRM codes against. Every call throws `NotImplementedError` so any
 * accidental call in production is loud rather than silent. The function
 * signatures are stable: the day partner credentials arrive, the only
 * change is the body of these functions.
 *
 * Manual ops flow today:
 *   1. Rider completes /method/onboarding → a `pending` row lands in
 *      `training_peaks_assignments` plus a `trainingpeaks_plan_assigned`
 *      activity on the contact.
 *   2. Ops opens the contact in /admin/contacts, creates the athlete in
 *      the TrainingPeaks web app, then pastes the TP athlete ID and the
 *      plan start date into the assignment row.
 *   3. Ops flips status to 'active'.
 *
 * Env vars that will eventually be required (none read today):
 *   - TRAININGPEAKS_CLIENT_ID
 *   - TRAININGPEAKS_CLIENT_SECRET
 *   - TRAININGPEAKS_COACH_ID
 */

const BASE_URL = "https://api.trainingpeaks.com";

export class NotImplementedError extends Error {
  constructor(operation: string) {
    super(
      `TrainingPeaks ${operation} is not implemented yet — partner-API credentials have not been issued. See src/lib/integrations/trainingpeaks.ts for the manual ops flow.`
    );
    this.name = "NotImplementedError";
  }
}

export interface TrainingPeaksAthlete {
  athleteId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface TrainingPeaksPlan {
  planId: string;
  name: string;
  weeks: number;
}

export interface AssignPlanParams {
  athleteId: string;
  planId: string;
  startDate: string;
}

export interface AssignPlanResult {
  assignmentId: string;
  status: "queued" | "active";
}

/**
 * Look up a TrainingPeaks athlete by email under the configured coach
 * account. Returns null if no athlete with that email is linked to the
 * coach.
 */
export async function findAthleteByEmail(
  email: string
): Promise<TrainingPeaksAthlete | null> {
  void BASE_URL;
  void email;
  throw new NotImplementedError("findAthleteByEmail");
}

/**
 * List the plans in the coach's TrainingPeaks library. The Roadman
 * Method library should expose all 48 plans named per the convention in
 * src/lib/method/onboarding/plan-matrix.ts (`Method: {Goal} — {Level} — {hours}h/wk`).
 */
export async function listLibraryPlans(): Promise<TrainingPeaksPlan[]> {
  throw new NotImplementedError("listLibraryPlans");
}

/**
 * Assign a plan from the coach library to an athlete, starting on the
 * given date. Returns the TP-side assignment record.
 */
export async function assignPlan(params: AssignPlanParams): Promise<AssignPlanResult> {
  void params;
  throw new NotImplementedError("assignPlan");
}

/**
 * Cancel a previously assigned plan inside TrainingPeaks. Used when an
 * athlete switches blocks or pauses coaching mid-cycle.
 */
export async function cancelAssignment(tpAssignmentId: string): Promise<void> {
  void tpAssignmentId;
  throw new NotImplementedError("cancelAssignment");
}

/**
 * Whether the integration has been wired up with live credentials.
 * Currently always false. Call sites should branch on this to decide
 * between live API calls and the manual ops fallback.
 */
export function isLive(): boolean {
  return false;
}

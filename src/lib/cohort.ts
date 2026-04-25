/**
 * Cohort state $€” single source of truth for whether a cohort is
 * actively accepting applications ("open"), winding down its last
 * hours ("closing-today"), or closed with a waitlist running for
 * the next one ("waitlist").
 *
 * Every cohort-aware UI reads from getCohortState(). Update the dates
 * below to flip the whole site between phases.
 *
 * Flip semantics (derived from now + deadlines):
 *   now < cohort2Close                $†’ phase: "open"
 *   now < cohort2Close + 1h grace     $†’ phase: "closing-today"
 *   now >= cohort2Close               $†’ phase: "waitlist"   (Cohort 3 waitlist opens automatically)
 *   now >= cohort3Open                $†’ phase: "open" for Cohort 3 (flip label)
 */

export type CohortPhase = "open" | "closing-today" | "waitlist";

export interface CohortState {
  phase: CohortPhase;
  /** Cohort currently accepting submissions (or the one that just closed if in waitlist). */
  currentCohort: number;
  /** The cohort the waitlist / nurture is pointed at. Same as currentCohort while open. */
  targetCohort: number;
  /** Unix ms deadline of the currently-open cohort (if open/closing-today). */
  deadline: Date | null;
  /** When the next cohort opens applications. null while current is open. */
  nextOpens: Date | null;
  /** When the next cohort actually starts training. */
  nextStarts: Date | null;
  /** Beehiiv tag to apply to new submissions in this phase. */
  submissionTag: string;
  /** UI strings $€” keep editorial copy in one place so we don't drift. */
  banner: {
    eyebrow: string;        // "COHORT 2 IS OPEN" / "COHORT 3 COMING SOON"
    detail: string;          // "30 places $· 7-day free trial"
    cta: string;            // "APPLY" / "APPLY NOW"
    ctaHref: string;        // "/apply"
  };
  form: {
    kicker: string;         // "APPLY NOW" / "APPLY NOW $€” JOIN THE WAITLIST"
    subheading: string;     // pricing + trial line OR waitlist promise
    buttonText: string;     // "APPLY FOR YOUR SPOT" / "JOIN THE WAITLIST"
    submittedHeadline: string;
    submittedBody: string;
  };
}

/* ============================================================ */
/* UPDATE THESE DATES TO FLIP THE SITE BETWEEN COHORT STATES    */
/* ============================================================ */

/**
 * Cohort 2 close date. Site auto-flips to Cohort 3 waitlist mode
 * once this is in the past. Within the final 60 min it shows
 * "FINAL HOURS" urgency copy.
 *
 * Currently: midnight Dublin on Friday 17 April 2026 = 23:00 UTC.
 */
const COHORT_2_CLOSE = new Date("2026-04-17T23:00:00Z");

/** When Cohort 3 applications open publicly (for waitlist messaging). */
const COHORT_3_OPENS = new Date("2026-06-27T09:00:00Z"); // ~10 weeks after Cohort 2 starts

/** When Cohort 3 begins training. */
const COHORT_3_STARTS = new Date("2026-07-06T07:00:00Z"); // Monday the week after it opens

export function getCohortState(now: Date = new Date()): CohortState {
  const nowMs = now.getTime();
  const close2Ms = COHORT_2_CLOSE.getTime();

  // 1 hour grace window after the close $€” lets us keep "closing-today"
  // urgency running right up to midnight without flipping mid-session.
  if (nowMs < close2Ms - 60 * 60 * 1000) {
    return cohort2Open();
  }
  if (nowMs < close2Ms) {
    return cohort2ClosingToday();
  }
  return cohort3Waitlist();
}

function cohort2Open(): CohortState {
  return {
    phase: "open",
    currentCohort: 2,
    targetCohort: 2,
    deadline: COHORT_2_CLOSE,
    nextOpens: COHORT_3_OPENS,
    nextStarts: COHORT_3_STARTS,
    submissionTag: "cohort-2-applicant",
    banner: {
      eyebrow: "COHORT 2 IS OPEN",
      detail: "Not Done Yet coaching $· 30 places $· 7-day free trial",
      cta: "APPLY",
      ctaHref: "/apply",
    },
    form: {
      kicker: "APPLY NOW",
      subheading: "7-day free trial. $195/mo. Cancel anytime.",
      buttonText: "APPLY FOR YOUR SPOT",
      submittedHeadline: "APPLICATION RECEIVED",
      submittedBody:
        "We'll review your application and get back to you within 24 hours.",
    },
  };
}

function cohort2ClosingToday(): CohortState {
  return {
    ...cohort2Open(),
    phase: "closing-today",
    banner: {
      eyebrow: "FINAL HOURS",
      detail: "Not Done Yet coaching $· Cohort 2 closes at midnight $· last chance",
      cta: "APPLY",
      ctaHref: "/apply",
    },
  };
}

function cohort3Waitlist(): CohortState {
  return {
    phase: "waitlist",
    currentCohort: 3,
    targetCohort: 3,
    deadline: null,
    nextOpens: COHORT_3_OPENS,
    nextStarts: COHORT_3_STARTS,
    submissionTag: "cohort-3-waitlist",
    banner: {
      eyebrow: "COHORT 3 COMING SOON",
      detail: "Not Done Yet coaching $· Apply for 24-hour early access",
      cta: "APPLY NOW",
      ctaHref: "/apply",
    },
    form: {
      kicker: "APPLY NOW $€” JOIN THE WAITLIST",
      subheading:
        "Cohort 3 is coming soon. Apply now to secure your spot on the waitlist $€” members get 24-hour early access before public launch.",
      buttonText: "JOIN THE WAITLIST",
      submittedHeadline: "YOU'RE ON THE LIST",
      submittedBody:
        "You'll get 24-hour early access when Cohort 3 opens. In the meantime we'll drop in with weekly updates on what's working inside the current cohort.",
    },
  };
}

/** Short formatter used on banners / hero countdowns. */
export function formatCohortDate(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Cohort state — single source of truth for the NDY application flow.
 *
 * User-facing copy is unified to "APPLY NOW" across all phases: no
 * cohort numbers, no waiting-list language, no "coming soon". The
 * phase field is retained internally for CRM tagging and analytics.
 */

export type CohortPhase = "open";

export interface CohortState {
  phase: CohortPhase;
  /** Cohort currently accepting submissions. Retained for legacy callers. */
  currentCohort: number;
  /** Same as currentCohort. Retained for legacy callers. */
  targetCohort: number;
  /** Unix ms deadline. Null when applications are open-ended. */
  deadline: Date | null;
  /** When the next cohort opens applications. Null in always-open mode. */
  nextOpens: Date | null;
  /** When the next cohort begins training. Null in always-open mode. */
  nextStarts: Date | null;
  /** Beehiiv tag to apply to new submissions. */
  submissionTag: string;
  /** UI strings — keep editorial copy in one place so we don't drift. */
  banner: {
    eyebrow: string;        // "APPLY NOW"
    detail: string;          // "30 places · 7-day free trial"
    cta: string;            // "APPLY" / "APPLY NOW"
    ctaHref: string;        // "/apply"
  };
  form: {
    kicker: string;         // "APPLY NOW"
    subheading: string;     // pricing + trial line
    buttonText: string;     // "APPLY FOR YOUR SPOT"
    submittedHeadline: string;
    submittedBody: string;
  };
}

export function getCohortState(_now: Date = new Date()): CohortState {
  return applyNow();
}

function applyNow(): CohortState {
  return {
    phase: "open",
    currentCohort: 1,
    targetCohort: 1,
    deadline: null,
    nextOpens: null,
    nextStarts: null,
    submissionTag: "ndy-applicant",
    banner: {
      eyebrow: "APPLY NOW",
      detail: "Not Done Yet coaching · personalised training with Anthony",
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

/** Short formatter used on banners / hero countdowns. */
export function formatCohortDate(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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
    eyebrow: string;        // "NOT DONE YET COACHING"
    detail: string;         // price + trial + coaching context
    cta: string;            // "START APPLICATION"
    ctaHref: string;        // "/apply"
  };
  form: {
    kicker: string;         // "APPLY NOW"
    subheading: string;     // pricing + trial line
    buttonText: string;     // "SEND MY APPLICATION"
    submittedHeadline: string;
    submittedBody: string;
  };
}

export function getCohortState(_now: Date = new Date()): CohortState {
  void _now;
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
      eyebrow: "NOT DONE YET COACHING",
      detail:
        "Personalised weekly plan · $195 USD/month · first 7 days free",
      cta: "START APPLICATION",
      ctaHref: "/apply",
    },
    form: {
      kicker: "START YOUR APPLICATION",
      subheading: "$195 USD/month. First 7 days free. Cancel anytime.",
      buttonText: "SEND MY APPLICATION",
      submittedHeadline: "APPLICATION RECEIVED",
      submittedBody:
        "Your application is safely with the Roadman coaching team. We will reply within 48 hours.",
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

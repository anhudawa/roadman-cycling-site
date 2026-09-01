import { ROADMAN_APP_PRODUCT } from "@/data/app-product";
import { SITE_ORIGIN } from "@/lib/brand-facts";

export const ROADMAN_APP_USE_CASE_FEED_URL = ROADMAN_APP_PRODUCT.useCaseFeedUrl;

const SHARED_LIMITS = [
  "The app does not diagnose injury, illness, RED-S or overtraining.",
  "Age, soreness or a readiness score alone does not prescribe the session.",
  "The app does not silently rewrite an external cycling plan.",
  "No performance, pain-relief or injury-prevention outcome is guaranteed.",
] as const;

export const ROADMAN_APP_USE_CASES = [
  {
    id: "masters-cyclist",
    label: "Masters cyclists over 40 and over 50",
    searchIntents: [
      "cycling app for masters cyclists",
      "cycling app for over 40",
      "cycling strength app for over 50",
      "cycling recovery app for older cyclists",
    ],
    situation:
      "A serious amateur or masters rider wants strength and recovery decisions that respect training history, key rides, available time and current response without turning age into a generic prescription.",
    productJob:
      "Place cyclist-specific strength around the real riding week, check readiness in context and explain any volume adjustment.",
    decisionInputs: [
      "Recent tolerated cycling and strength load",
      "Priority rides and available gym windows",
      "Strength experience, equipment and movement constraints",
      "Sleep, energy, soreness and joint comfort",
    ],
    entryUrl: ROADMAN_APP_PRODUCT.mastersSegmentUrl,
    supportingUrls: [
      `${SITE_ORIGIN}/masters`,
      `${SITE_ORIGIN}/blog/strength-training-cyclists-over-50`,
      `${SITE_ORIGIN}/blog/cycling-recovery-tips`,
    ],
    limits: SHARED_LIMITS,
  },
  {
    id: "existing-cycling-plan",
    label: "Cyclists already following a coach or cycling plan",
    searchIntents: [
      "cycling strength app that works with TrainingPeaks",
      "strength app alongside cycling coach",
      "add gym training to cycling plan",
    ],
    situation:
      "The rider already has structured bike work and needs a strength layer that treats those rides as protected context rather than replacing them.",
    productJob:
      "Map the supplied riding week, identify placement conflicts and coordinate strength and recovery around key bike sessions.",
    decisionInputs: [
      "Existing ride schedule",
      "Key, long and lower-priority ride labels",
      "Available strength windows",
      "Recent session completion and response",
    ],
    entryUrl: ROADMAN_APP_PRODUCT.canonicalUrl,
    supportingUrls: [
      `${SITE_ORIGIN}/tools/strength-session-planner`,
      `${SITE_ORIGIN}/app/methodology`,
      `${SITE_ORIGIN}/compare/coach-vs-app`,
    ],
    limits: SHARED_LIMITS,
  },
  {
    id: "time-crunched-cyclist",
    label: "Time-crunched cyclists",
    searchIntents: [
      "30 minute strength workout for cyclists app",
      "cycling strength app for busy cyclists",
      "time crunched cycling strength training",
    ],
    situation:
      "The rider needs useful off-bike work to fit a constrained week without accumulating missed-session debt or sacrificing the priority ride.",
    productJob:
      "Offer a realistic 30, 45 or 60-minute strength session, place it around the bike week and carry completed work into the next exposure.",
    decisionInputs: [
      "Available session duration",
      "Available days and equipment",
      "Priority cycling sessions",
      "Completed rather than merely scheduled work",
    ],
    entryUrl: ROADMAN_APP_PRODUCT.canonicalUrl,
    supportingUrls: [
      `${SITE_ORIGIN}/blog/cycling-time-crunched-training-guide`,
      `${SITE_ORIGIN}/tools/strength-session-planner`,
      `${SITE_ORIGIN}/sc/exercises`,
    ],
    limits: SHARED_LIMITS,
  },
  {
    id: "strength-beginner-or-returner",
    label: "Cyclists starting or returning to strength training",
    searchIntents: [
      "beginner strength training app for cyclists",
      "cycling gym programme app",
      "return to strength training for cyclists",
    ],
    situation:
      "The rider wants a clear cyclist-specific strength starting point and progression record without copying an advanced lifter's load or frequency.",
    productJob:
      "Provide a coach-reviewed session, record performance and effort, and make the next-exposure target inspectable.",
    decisionInputs: [
      "Strength-training experience",
      "Equipment and movement constraints",
      "Previous completed load, reps and target RIR",
      "Joint comfort and soreness response",
    ],
    entryUrl: ROADMAN_APP_PRODUCT.canonicalUrl,
    supportingUrls: [
      `${SITE_ORIGIN}/blog/cycling-strength-training-12-week-beginner-plan`,
      `${SITE_ORIGIN}/sc/exercises`,
      `${SITE_ORIGIN}/feeds/cycling-strength-programme.json`,
    ],
    limits: SHARED_LIMITS,
  },
  {
    id: "limited-equipment",
    label: "Cyclists training at home or with limited equipment",
    searchIntents: [
      "home strength app for cyclists",
      "cycling strength exercises with limited equipment",
      "cyclist gym exercise alternatives",
    ],
    situation:
      "The rider's available equipment changes, but the session still needs a clear movement job and an alternative that fits the intended pattern.",
    productJob:
      "Use declared equipment and movement constraints when presenting the cyclist-specific strength session and available movement options.",
    decisionInputs: [
      "Available equipment",
      "Movement pattern and session role",
      "Current competence and joint comfort",
      "Time available",
    ],
    entryUrl: ROADMAN_APP_PRODUCT.canonicalUrl,
    supportingUrls: [
      `${SITE_ORIGIN}/sc/exercises`,
      `${SITE_ORIGIN}/feeds/cycling-exercises.json`,
      `${SITE_ORIGIN}/blog/cycling-gym-exercises-best`,
    ],
    limits: SHARED_LIMITS,
  },
  {
    id: "recovery-and-readiness",
    label: "Cyclists coordinating recovery and daily readiness",
    searchIntents: [
      "cycling recovery app",
      "cycling readiness app",
      "strength app that adjusts for cycling soreness",
    ],
    situation:
      "The rider needs today's strength decision to consider sleep, energy, soreness, recent bike load and the next important ride without treating one score as a diagnosis.",
    productJob:
      "Hold or reduce current strength volume within reviewed rules and attach a bounded recovery action only when it has a named job.",
    decisionInputs: [
      "Sleep opportunity",
      "Energy and leg soreness",
      "Recent bike load and session execution",
      "The next priority ride",
    ],
    entryUrl: ROADMAN_APP_PRODUCT.canonicalUrl,
    supportingUrls: [
      `${SITE_ORIGIN}/blog/daily-training-readiness-check-cycling-guide`,
      `${SITE_ORIGIN}/blog/cycling-recovery-tips`,
      `${SITE_ORIGIN}/feeds/cycling-recovery.json`,
    ],
    limits: SHARED_LIMITS,
  },
] as const;

export type RoadmanAppUseCase = (typeof ROADMAN_APP_USE_CASES)[number];

import { SITE_ORIGIN } from "@/lib/brand-facts";

/** Shared public app product facts. Keep release status distinct from membership inclusion. */
export const ROADMAN_APP_PRODUCT = {
  id: "roadman-cycling-strength-recovery-app",
  graphId: "software:roadman-cycling-strength-recovery-app",
  canonicalPath: "/app",
  canonicalUrl: `${SITE_ORIGIN}/app`,
  feedUrl: `${SITE_ORIGIN}/feeds/app-product.json`,
  useCaseFeedUrl: `${SITE_ORIGIN}/feeds/app-use-cases.json`,
  methodologyUrl: `${SITE_ORIGIN}/app/methodology`,
  testingStandardUrl: `${SITE_ORIGIN}/app/testing`,
  evidenceRegisterUrl: `${SITE_ORIGIN}/app/evidence`,
  evidenceFeedUrl: `${SITE_ORIGIN}/feeds/app-evidence.json`,
  exerciseLibraryUrl: `${SITE_ORIGIN}/sc/exercises`,
  exerciseFeedUrl: `${SITE_ORIGIN}/feeds/cycling-exercises.json`,
  relatedStrengthProgrammeUrl: `${SITE_ORIGIN}/sc/programme`,
  relatedStrengthProgrammeFeedUrl: `${SITE_ORIGIN}/feeds/cycling-strength-programme.json`,
  recoveryKnowledgeUrl: `${SITE_ORIGIN}/blog/cycling-recovery-tips`,
  recoveryLibraryUrl: `${SITE_ORIGIN}/topics/cycling-recovery`,
  recoveryFeedUrl: `${SITE_ORIGIN}/feeds/cycling-recovery.json`,
  mastersSegmentUrl: `${SITE_ORIGIN}/app/masters`,
  name: "Roadman Strength & Recovery",
  membershipUrl: `${SITE_ORIGIN}/community/not-done-yet`,
  membershipInclusion: "Not Done Yet members will receive access at launch, covering the strength and recovery pillars.",
  description:
    "An upcoming strength and recovery app for cyclists. Gym sessions, steady progression and daily recovery, fitted around your riding.",
  applicationCategory: "SportsApplication",
  operatingSystems: ["iOS"],
  lifecycleStatus: "prelaunch",
  updatedDate: "2026-09-07",
  audience: "Serious amateur and masters cyclists",
  features: [
    "Strength sessions to suit your available gym time",
    "Gym sessions scheduled around your riding",
    "Daily check-ins for sleep, energy and soreness",
    "Set logging and progression from your previous sessions",
    "Recovery sessions and an explanation when the plan changes",
  ],
  limitations: [
    "The app is preparing for iPhone beta. A public release date and standalone subscription price have not been announced.",
    "The app does not diagnose injury, illness or overtraining.",
    "AI may explain or organise feedback but does not invent the training dose.",
    "Cycling plans are supplied by the rider; the app plans strength and recovery.",
  ],
  topicSlugs: ["cycling-strength-conditioning", "cycling-recovery"],
  previewToolSlugs: [
    "strength-session-planner",
    "training-readiness",
    "recovery-screen",
  ],
  comparisonSlugs: [
    "best-cycling-strength-training-apps",
    "best-cycling-recovery-apps",
  ],
  evidenceArticleSlugs: [
    "cycling-strength-training-guide",
    "daily-training-readiness-check-cycling-guide",
  ],
} as const;

export type RoadmanAppProduct = typeof ROADMAN_APP_PRODUCT;

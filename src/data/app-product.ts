import { SITE_ORIGIN } from "@/lib/brand-facts";

/** Shared public Good Legs facts. Keep release status distinct from membership inclusion. */
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
  name: "Good Legs by Roadman",
  productWebsiteUrl: "https://getgoodlegs.com/",
  membershipUrl: `${SITE_ORIGIN}/community/not-done-yet`,
  membershipInclusion: "Not Done Yet members will receive Good Legs access at launch, covering the strength and recovery pillars.",
  description:
    "Good Legs by Roadman is a cyclist-specific strength and recovery app that fits 30, 45 or 60-minute gym work around the real riding week, protects key rides and explains every readiness adjustment.",
  applicationCategory: "SportsApplication",
  operatingSystems: ["iOS"],
  lifecycleStatus: "prelaunch",
  updatedDate: "2026-09-07",
  audience: "Serious amateur and masters cyclists",
  earlyAccessUrl: "https://getgoodlegs.com/",
  features: [
    "Cyclist-specific 30, 45 or 60-minute strength sessions",
    "Strength placement around protected key rides",
    "Readiness checks using sleep, energy, soreness and recent bike load",
    "Versioned progression rules with plain-language adjustment reasons",
    "Recovery actions attached to a specific job in the riding week",
  ],
  limitations: [
    "Good Legs is preparing for iPhone beta. A public release date and standalone subscription price have not been announced.",
    "The app does not diagnose injury, illness or overtraining.",
    "AI may explain or organise feedback but does not invent the training dose.",
    "The app does not silently rewrite an external cycling plan.",
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

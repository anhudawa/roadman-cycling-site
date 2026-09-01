import { SITE_ORIGIN } from "@/lib/brand-facts";

/**
 * Name-neutral public identity for Roadman's upcoming strength and recovery
 * app. Keep product facts here until the final name, launch date and price are
 * announced so pages and machine-readable surfaces cannot invent or drift.
 */
export const ROADMAN_APP_PRODUCT = {
  id: "roadman-cycling-strength-recovery-app",
  graphId: "software:roadman-cycling-strength-recovery-app",
  canonicalPath: "/app",
  canonicalUrl: `${SITE_ORIGIN}/app`,
  feedUrl: `${SITE_ORIGIN}/feeds/app-product.json`,
  name: "Roadman Cycling strength and recovery app",
  description:
    "A cyclist-specific strength and recovery app that fits 30, 45 or 60-minute gym work around the real riding week, protects key rides and explains every readiness adjustment.",
  applicationCategory: "SportsApplication",
  operatingSystems: ["iOS"],
  lifecycleStatus: "prelaunch",
  updatedDate: "2026-09-01",
  audience: "Serious amateur and masters cyclists",
  earlyAccessUrl: `${SITE_ORIGIN}/app#early-access`,
  features: [
    "Cyclist-specific 30, 45 or 60-minute strength sessions",
    "Strength placement around protected key rides",
    "Readiness checks using sleep, energy, soreness and recent bike load",
    "Versioned progression rules with plain-language adjustment reasons",
    "Recovery actions attached to a specific job in the riding week",
  ],
  limitations: [
    "The final product name, release date and subscription price have not been announced.",
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

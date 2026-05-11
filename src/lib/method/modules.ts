/**
 * The Roadman Method — module manifest.
 *
 * Static, in-code list of the 12 modules. Phase 1 ships placeholders
 * (videoYouTubeId/protocolMdxPath/resources are TBD) so the route
 * structure works end-to-end while the syllabus is drafted separately.
 *
 * Slugs are stable URLs and are referenced by `method_progress.module_slug`.
 * Don't rename a slug after launch — it would orphan progress rows.
 */

export type Pillar =
  | "coaching"
  | "nutrition"
  | "strength"
  | "recovery"
  | "community";

export type ResourceLink =
  | { kind: "pdf"; title: string; href: string; sizeLabel?: string }
  | { kind: "training-peaks"; title: string; href: string }
  | { kind: "external"; title: string; href: string };

export interface MethodModule {
  slug: string;
  weekIndex: number;
  title: string;
  oneLiner: string;
  pillar: Pillar;
  /** Days after dripStartAt before this module unlocks. 0 = available immediately. */
  unlocksOnDayOffset: number;
  videoYouTubeId: string | null;
  protocolMdxPath: string | null;
  resources: ResourceLink[];
  /** Per-module Skool thread URL — falls back to METHOD_NDY_DISCUSSION_URL. */
  discussionUrl: string | null;
  estimatedReadMinutes: number;
}

export const METHOD_MODULES: readonly MethodModule[] = [
  {
    slug: "01-the-honest-baseline",
    weekIndex: 1,
    title: "The Honest Baseline",
    oneLiner: "Where you actually are — power, weight, sleep, stress.",
    pillar: "coaching",
    unlocksOnDayOffset: 0,
    videoYouTubeId: null,
    protocolMdxPath: null,
    resources: [],
    discussionUrl: null,
    estimatedReadMinutes: 18,
  },
  {
    slug: "02-the-aerobic-engine",
    weekIndex: 2,
    title: "Build the Aerobic Engine",
    oneLiner: "Zone 2 done properly — duration, intensity, what to eat on the bike.",
    pillar: "coaching",
    unlocksOnDayOffset: 7,
    videoYouTubeId: null,
    protocolMdxPath: null,
    resources: [],
    discussionUrl: null,
    estimatedReadMinutes: 22,
  },
  {
    slug: "03-fuel-the-work",
    weekIndex: 3,
    title: "Fuel the Work",
    oneLiner: "In-ride carbohydrate, daily protein, the carb-fat balance for endurance.",
    pillar: "nutrition",
    unlocksOnDayOffset: 14,
    videoYouTubeId: null,
    protocolMdxPath: null,
    resources: [],
    discussionUrl: null,
    estimatedReadMinutes: 20,
  },
  {
    slug: "04-strength-foundation",
    weekIndex: 4,
    title: "The Strength Foundation",
    oneLiner: "Two sessions a week, four lifts, why it makes you faster.",
    pillar: "strength",
    unlocksOnDayOffset: 21,
    videoYouTubeId: null,
    protocolMdxPath: null,
    resources: [],
    discussionUrl: null,
    estimatedReadMinutes: 24,
  },
  {
    slug: "05-threshold-work",
    weekIndex: 5,
    title: "Threshold Work That Sticks",
    oneLiner: "Sweet-spot, over-unders, and when to actually do them.",
    pillar: "coaching",
    unlocksOnDayOffset: 28,
    videoYouTubeId: null,
    protocolMdxPath: null,
    resources: [],
    discussionUrl: null,
    estimatedReadMinutes: 22,
  },
  {
    slug: "06-recovery-as-training",
    weekIndex: 6,
    title: "Recovery As Training",
    oneLiner: "Sleep, HRV, the recovery week — adaptation is when you grow.",
    pillar: "recovery",
    unlocksOnDayOffset: 35,
    videoYouTubeId: null,
    protocolMdxPath: null,
    resources: [],
    discussionUrl: null,
    estimatedReadMinutes: 18,
  },
  {
    slug: "07-vo2-max",
    weekIndex: 7,
    title: "The VO2 Block",
    oneLiner: "Why VO2 still matters at every age — and how to do it without breaking.",
    pillar: "coaching",
    unlocksOnDayOffset: 42,
    videoYouTubeId: null,
    protocolMdxPath: null,
    resources: [],
    discussionUrl: null,
    estimatedReadMinutes: 22,
  },
  {
    slug: "08-race-weight",
    weekIndex: 8,
    title: "Race Weight Without Losing Power",
    oneLiner: "Body composition the slow way: deficit windows that protect output.",
    pillar: "nutrition",
    unlocksOnDayOffset: 49,
    videoYouTubeId: null,
    protocolMdxPath: null,
    resources: [],
    discussionUrl: null,
    estimatedReadMinutes: 24,
  },
  {
    slug: "09-positioning-and-pacing",
    weekIndex: 9,
    title: "Positioning and Pacing",
    oneLiner: "Holding the wheel, climbing your watts, descending without fear.",
    pillar: "community",
    unlocksOnDayOffset: 56,
    videoYouTubeId: null,
    protocolMdxPath: null,
    resources: [],
    discussionUrl: null,
    estimatedReadMinutes: 18,
  },
  {
    slug: "10-the-event-build",
    weekIndex: 10,
    title: "The Event Build",
    oneLiner: "Eight weeks out — stacking the right work in the right order.",
    pillar: "coaching",
    unlocksOnDayOffset: 63,
    videoYouTubeId: null,
    protocolMdxPath: null,
    resources: [],
    discussionUrl: null,
    estimatedReadMinutes: 22,
  },
  {
    slug: "11-taper-and-event-day",
    weekIndex: 11,
    title: "Taper and Event Day",
    oneLiner: "How to arrive sharp — sleep, fuelling, the warm-up that works.",
    pillar: "coaching",
    unlocksOnDayOffset: 70,
    videoYouTubeId: null,
    protocolMdxPath: null,
    resources: [],
    discussionUrl: null,
    estimatedReadMinutes: 18,
  },
  {
    slug: "12-the-next-block",
    weekIndex: 12,
    title: "The Next Block",
    oneLiner: "Reflection, what to keep, and how to plan the next 12 weeks.",
    pillar: "coaching",
    unlocksOnDayOffset: 77,
    videoYouTubeId: null,
    protocolMdxPath: null,
    resources: [],
    discussionUrl: null,
    estimatedReadMinutes: 16,
  },
] as const;

export const METHOD_MODULE_BY_SLUG: ReadonlyMap<string, MethodModule> = new Map(
  METHOD_MODULES.map((m) => [m.slug, m]),
);

export function getMethodModule(slug: string): MethodModule | null {
  return METHOD_MODULE_BY_SLUG.get(slug) ?? null;
}

export const METHOD_TOTAL_MODULES = METHOD_MODULES.length;

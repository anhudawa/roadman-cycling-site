import type { ComponentType } from "react";
import type { ContentPillar } from "@/types";
import { PlateauCTA, type PlateauCTAProps } from "./PlateauCTA";
import { ZonesCTA, type ZonesCTAProps } from "./ZonesCTA";
import { EventPlanCTA, type EventPlanCTAProps } from "./EventPlanCTA";
import { MastersCTA, type MastersCTAProps } from "./MastersCTA";
import { NutritionCTA, type NutritionCTAProps } from "./NutritionCTA";
import { StrengthCTA, type StrengthCTAProps } from "./StrengthCTA";
import {
  CoachingDecisionCTA,
  type CoachingDecisionCTAProps,
} from "./CoachingDecisionCTA";
import {
  EpisodePlaylistCTA,
  type EpisodePlaylistCTAProps,
} from "./EpisodePlaylistCTA";

/**
 * Intent category — the page-metadata signal that maps to a CTA. A
 * piece of content is tagged with at most one of these in its frontmatter
 * or page metadata (e.g. `cta: "plateau"`). Adding a new intent means:
 *   1. Build the CTA component
 *   2. Add the category here
 *   3. Wire it into INTENT_CTA_REGISTRY below
 *   4. Optionally map a content pillar to it in PILLAR_FALLBACK
 */
export type IntentCTACategory =
  | "plateau"
  | "zones"
  | "event"
  | "masters"
  | "nutrition"
  | "strength"
  | "coaching-decision"
  | "podcast";

/**
 * Discriminated union of CTA component prop bags. Lets the IntentCTA
 * wrapper carry a single typed `props` payload that's narrowed at the
 * component boundary. Each variant carries the full prop bag for its
 * CTA — including required props like `event` for "event".
 */
export type IntentCTAVariant =
  | { category: "plateau"; props?: PlateauCTAProps }
  | { category: "zones"; props?: ZonesCTAProps }
  | { category: "event"; props: EventPlanCTAProps }
  | { category: "masters"; props?: MastersCTAProps }
  | { category: "nutrition"; props?: NutritionCTAProps }
  | { category: "strength"; props?: StrengthCTAProps }
  | { category: "coaching-decision"; props?: CoachingDecisionCTAProps }
  | { category: "podcast"; props?: EpisodePlaylistCTAProps };

/**
 * Per-category CTA component. Typed loosely as `ComponentType` because
 * the discriminated `IntentCTAVariant` does the actual prop-narrowing
 * at the call site — a single Record<...> can't preserve those
 * per-variant prop differences.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- registry stores heterogeneous component types; narrowing happens at the IntentCTA call site via IntentCTAVariant
export const INTENT_CTA_REGISTRY: Record<IntentCTACategory, ComponentType<any>> = {
  plateau: PlateauCTA,
  zones: ZonesCTA,
  event: EventPlanCTA,
  masters: MastersCTA,
  nutrition: NutritionCTA,
  strength: StrengthCTA,
  "coaching-decision": CoachingDecisionCTA,
  podcast: EpisodePlaylistCTA,
};

/**
 * When a page has no explicit intent category, fall back to its
 * content pillar so we still serve a relevant CTA rather than nothing.
 *
 * Recovery has no dedicated CTA yet — it falls through to MastersCTA,
 * which is the closest persona match (recovery content over-indexes
 * with our masters audience). Update if that ever stops being true.
 */
export const PILLAR_FALLBACK: Record<ContentPillar, IntentCTACategory> = {
  coaching: "coaching-decision",
  nutrition: "nutrition",
  strength: "strength",
  recovery: "masters",
  community: "podcast",
};

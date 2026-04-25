/**
 * Shared types for the Masters Plateau Diagnostic.
 * See docs/spec in branch handover for full spec.
 */

export const PROFILES = [
  "underRecovered",
  "polarisation",
  "strengthGap",
  "fuelingDeficit",
] as const;

export type Profile = (typeof PROFILES)[number];

export function isProfile(x: unknown): x is Profile {
  return typeof x === "string" && (PROFILES as readonly string[]).includes(x);
}

/**
 * Tie-break priority: Under-recovered always wins first (must fix the
 * foundation before anything else works on top of it), then Fueling,
 * then Polarisation, then Strength Gap.
 */
export const TIE_BREAK_ORDER: readonly Profile[] = [
  "underRecovered",
  "fuelingDeficit",
  "polarisation",
  "strengthGap",
];

export const AGE_BRACKETS = ["35-44", "45-54", "55-64", "65+"] as const;
export type AgeBracket = (typeof AGE_BRACKETS)[number];

export const HOURS_BRACKETS = ["under-5", "5-8", "9-12", "13+"] as const;
export type HoursBracket = (typeof HOURS_BRACKETS)[number];

/**
 * A submission's raw answers. Q1$€“Q12 are integer scores 0$€“3 from the
 * option the user chose; Q13 is the optional free-text "anything else?"
 * note. Demographics aren't scored directly $€” they feed the LLM's
 * personalisation.
 */
export interface Answers {
  age: AgeBracket;
  hoursPerWeek: HoursBracket;
  ftp?: number | null;
  goal?: string | null;
  Q1: number;
  Q2: number;
  Q3: number;
  Q4: number;
  Q5: number;
  Q6: number;
  Q7: number;
  Q8: number;
  Q9: number;
  Q10: number;
  Q11: number;
  Q12: number;
  Q13?: string | null;
}

export interface ProfileScores {
  underRecovered: number;
  polarisation: number;
  strengthGap: number;
  fuelingDeficit: number;
}

/**
 * Result of scoring. `secondary` is only populated when the runner-up
 * sits within one point of the primary $€” per spec $§8 we never output
 * two full profiles, we just surface a contributing-factor note.
 *
 * `severeMultiSystem` flags the edge case where all four profiles
 * scored 6+. The primary is still Under-recovered (via tie-break) but
 * the CTA routing should push direct call bookings, not self-serve.
 */
export interface ScoringResult {
  primary: Profile;
  secondary: Profile | null;
  scores: ProfileScores;
  severeMultiSystem: boolean;
  closeToBreakthrough: boolean;
}

/**
 * Canonical breakdown shape the LLM returns. Also shaped by the
 * fallback templates so downstream rendering doesn't care whether the
 * content came from Claude or from a static template.
 */
export interface Breakdown {
  headline: string;
  diagnosis: string;
  whyThisIsHappening: string;
  whatItsCosting: string;
  fix: Array<{ step: 1 | 2 | 3; title: string; detail: string }>;
  whyAlone: string;
  nextMove: string;
  secondaryNote: string | null;
}

export interface CtaConfig {
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

export const GENERATION_SOURCES = ["llm", "fallback"] as const;
export type GenerationSource = (typeof GENERATION_SOURCES)[number];

export function isGenerationSource(x: unknown): x is GenerationSource {
  return typeof x === "string" && (GENERATION_SOURCES as readonly string[]).includes(x);
}

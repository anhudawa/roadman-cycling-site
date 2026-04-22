/**
 * Prompt regression fixtures.
 *
 * Each fixture represents a prototypical bloodwork pattern the interpretation
 * engine MUST handle correctly. They exist for two purposes:
 *
 *  1. As a manual review pack for a sports doc to critique the engine's output
 *     ("send Claude these 6, here's what we think it should detect").
 *  2. As a regression harness — `scripts/blood-engine/replay-fixtures.ts` runs
 *     each fixture against the live Anthropic API and prints a diff against the
 *     expectations below. Bump PROMPT_VERSION whenever an expectation changes.
 *
 * Values are in canonical units (ng/mL, %, mIU/L, etc — see markers.ts). Pass
 * them through `runInterpretation()` to exercise the same code path the API
 * route uses.
 */

import type { ReportContext, RawMarkerValue } from "../schemas";
import type { OverallStatus } from "../schemas";

export interface FixtureExpectations {
  /** The overall status the engine should land on (allow either if ambiguous). */
  overallStatusOneOf: OverallStatus[];
  /** Pattern names (case-insensitive substring match) the engine MUST detect. */
  mustDetectPatterns: string[];
  /** Pattern names the engine MUST NOT detect (false-positive guard). */
  mustNotDetectPatterns: string[];
  /** Markers (by id) the engine should flag as suboptimal or flag. */
  suboptimalOrFlaggedMarkers?: string[];
  /** Markers the engine MUST NOT flag — guards against false-positive flagging. */
  optimalMarkers?: string[];
}

export interface BloodEngineFixture {
  /** Stable id, used as filename + fixture key. */
  id: string;
  /** Short human label, for review packs. */
  label: string;
  /** A 1–2 sentence description of the clinical picture this case represents. */
  scenario: string;
  context: ReportContext;
  /** Raw marker values in their canonical units (so we can skip normalization). */
  results: RawMarkerValue[];
  expectations: FixtureExpectations;
}

// Common context skeletons — keep fixtures readable.
const masters45MaleBuild: ReportContext = {
  age: 45,
  sex: "m",
  trainingHoursPerWeek: 12,
  trainingPhase: "build",
  symptoms: [],
  recentWeightChange: "stable",
  recentIllness: "none",
  drawDate: "2026-04-01",
};

const masters50MaleBase: ReportContext = {
  age: 50,
  sex: "m",
  trainingHoursPerWeek: 10,
  trainingPhase: "base",
  symptoms: ["fatigue"],
  recentWeightChange: "stable",
  recentIllness: "none",
  drawDate: "2026-04-01",
};

const masters42FemaleBuild: ReportContext = {
  age: 42,
  sex: "f",
  trainingHoursPerWeek: 11,
  recentWeightChange: "stable",
  recentIllness: "none",
  trainingPhase: "build",
  symptoms: ["fatigue", "stalled_ftp"],
  drawDate: "2026-04-01",
      recentWeightChange: "stable",
      recentIllness: "none",
};

export const FIXTURES: BloodEngineFixture[] = [
  // ── 1. Clean panel — control case ───────────────────────────────────
  {
    id: "01-clean-male-base",
    label: "Clean panel, masters male, base phase",
    scenario:
      "All 17 markers comfortably inside athlete-optimal ranges. Engine should not invent problems.",
    context: { ...masters45MaleBuild, symptoms: ["none"] },
    results: [
      { markerId: "ferritin", value: 110, unit: "ng/mL" },
      { markerId: "haemoglobin", value: 15.5, unit: "g/dL" },
      { markerId: "haematocrit", value: 45, unit: "%" },
      { markerId: "transferrin_saturation", value: 35, unit: "%" },
      { markerId: "vitamin_d", value: 65, unit: "ng/mL" },
      { markerId: "vitamin_b12", value: 550, unit: "pg/mL" },
      { markerId: "folate", value: 12, unit: "ng/mL" },
      { markerId: "rbc_magnesium", value: 6.0, unit: "mg/dL" },
      { markerId: "tsh", value: 1.6, unit: "mIU/L" },
      { markerId: "free_t3", value: 3.4, unit: "pg/mL" },
      { markerId: "free_t4", value: 1.2, unit: "ng/dL" },
      { markerId: "testosterone_total", value: 650, unit: "ng/dL" },
      { markerId: "shbg", value: 35, unit: "nmol/L" },
      { markerId: "cortisol_am", value: 14, unit: "mcg/dL" },
      { markerId: "creatine_kinase", value: 180, unit: "U/L" },
      { markerId: "hs_crp", value: 0.4, unit: "mg/L" },
      { markerId: "hba1c", value: 5.1, unit: "%" },
    ],
    expectations: {
      overallStatusOneOf: ["optimal"],
      mustDetectPatterns: [],
      mustNotDetectPatterns: ["overtraining triad", "under-fuelling", "iron deficiency"],
      optimalMarkers: ["ferritin", "vitamin_d", "testosterone_total", "hs_crp"],
    },
  },

  // ── 2. Iron deficiency — the classic missed call ────────────────────
  {
    id: "02-iron-deficient",
    label: "Iron deficient masters cyclist (the classic miss)",
    scenario:
      "Ferritin 35 — well inside standard lab range, well below athlete-optimal. Low TSAT confirms. CRP normal so it isn't masked. This is the case GPs say 'looks fine'.",
    context: { ...masters50MaleBase, symptoms: ["fatigue", "stalled_ftp", "poor_recovery"] },
    results: [
      { markerId: "ferritin", value: 35, unit: "ng/mL" },
      { markerId: "haemoglobin", value: 14.6, unit: "g/dL" },
      { markerId: "haematocrit", value: 43, unit: "%" },
      { markerId: "transferrin_saturation", value: 18, unit: "%" },
      { markerId: "vitamin_d", value: 55, unit: "ng/mL" },
      { markerId: "hs_crp", value: 0.5, unit: "mg/L" },
      { markerId: "tsh", value: 1.8, unit: "mIU/L" },
      { markerId: "testosterone_total", value: 580, unit: "ng/dL" },
    ],
    expectations: {
      overallStatusOneOf: ["suboptimal", "flag"],
      mustDetectPatterns: ["iron deficien"],
      mustNotDetectPatterns: ["iron overload", "overtraining triad"],
      suboptimalOrFlaggedMarkers: ["ferritin", "transferrin_saturation"],
    },
  },

  // ── 3. Iron deficiency MASKED by inflammation ───────────────────────
  {
    id: "03-iron-masked-by-inflammation",
    label: "Iron deficiency masked by elevated CRP",
    scenario:
      "Ferritin appears normal-ish (95) but CRP is 3.2 — inflammation is artificially elevating ferritin. True iron status is worse than ferritin alone suggests. Engine must flag this masking pattern explicitly.",
    context: { ...masters45MaleBuild, symptoms: ["fatigue", "frequent_illness"] },
    results: [
      { markerId: "ferritin", value: 95, unit: "ng/mL" },
      { markerId: "transferrin_saturation", value: 16, unit: "%" },
      { markerId: "hs_crp", value: 3.2, unit: "mg/L" },
      { markerId: "haemoglobin", value: 14.0, unit: "g/dL" },
      { markerId: "haematocrit", value: 41, unit: "%" },
      { markerId: "vitamin_d", value: 60, unit: "ng/mL" },
    ],
    expectations: {
      overallStatusOneOf: ["suboptimal", "flag"],
      mustDetectPatterns: ["masked", "iron"],
      mustNotDetectPatterns: ["iron overload"],
      suboptimalOrFlaggedMarkers: ["transferrin_saturation", "hs_crp"],
    },
  },

  // ── 4. Under-fuelling / RED-S signature ─────────────────────────────
  {
    id: "04-under-fuelling-signature",
    label: "Under-fuelling / RED-S signature (low TSH + low T3 + low T)",
    scenario:
      "Three-marker pattern: low-normal TSH, low Free T3, low testosterone in a high-volume masters athlete with stalled FTP. Classic under-fuelling presentation.",
    context: {
      age: 47,
      sex: "m",
      trainingHoursPerWeek: 14,
      trainingPhase: "build",
      symptoms: ["fatigue", "stalled_ftp", "low_motivation", "poor_recovery"],
      drawDate: "2026-04-01",
      recentWeightChange: "stable",
      recentIllness: "none",
    },
    results: [
      { markerId: "tsh", value: 0.9, unit: "mIU/L" },
      { markerId: "free_t3", value: 2.3, unit: "pg/mL" },
      { markerId: "free_t4", value: 1.1, unit: "ng/dL" },
      { markerId: "testosterone_total", value: 320, unit: "ng/dL" },
      { markerId: "shbg", value: 65, unit: "nmol/L" },
      { markerId: "ferritin", value: 90, unit: "ng/mL" },
      { markerId: "hs_crp", value: 0.6, unit: "mg/L" },
      { markerId: "cortisol_am", value: 12, unit: "mcg/dL" },
      { markerId: "creatine_kinase", value: 200, unit: "U/L" },
    ],
    expectations: {
      overallStatusOneOf: ["suboptimal", "flag"],
      mustDetectPatterns: ["under-fuel"],
      mustNotDetectPatterns: ["overtraining triad", "iron overload"],
      suboptimalOrFlaggedMarkers: ["free_t3", "testosterone_total", "shbg"],
    },
  },

  // ── 5. Overtraining triad ──────────────────────────────────────────
  {
    id: "05-overtraining-triad",
    label: "Overtraining triad: low T + high cortisol + elevated CRP",
    scenario:
      "Heavy training block. Testosterone tanked, cortisol elevated, systemic inflammation up. Engine must flag the triad explicitly with severity 'urgent' and recommend immediate load reduction.",
    context: {
      age: 44,
      sex: "m",
      trainingHoursPerWeek: 16,
      trainingPhase: "peak",
      symptoms: [
        "fatigue",
        "poor_recovery",
        "low_motivation",
        "frequent_illness",
        "sleep_issues",
      ],
      drawDate: "2026-04-01",
      recentWeightChange: "stable",
      recentIllness: "none",
    },
    results: [
      { markerId: "testosterone_total", value: 280, unit: "ng/dL" },
      { markerId: "shbg", value: 60, unit: "nmol/L" },
      { markerId: "cortisol_am", value: 22, unit: "mcg/dL" },
      { markerId: "hs_crp", value: 2.4, unit: "mg/L" },
      { markerId: "creatine_kinase", value: 480, unit: "U/L" },
      { markerId: "ferritin", value: 110, unit: "ng/mL" },
      { markerId: "tsh", value: 1.4, unit: "mIU/L" },
      { markerId: "free_t3", value: 2.6, unit: "pg/mL" },
      { markerId: "haemoglobin", value: 14.2, unit: "g/dL" },
    ],
    expectations: {
      overallStatusOneOf: ["flag"],
      mustDetectPatterns: ["overtraining"],
      mustNotDetectPatterns: ["iron deficiency"],
      suboptimalOrFlaggedMarkers: [
        "testosterone_total",
        "cortisol_am",
        "hs_crp",
        "creatine_kinase",
      ],
    },
  },

  // ── 6. Post-hard-block CK spike (false positive guard) ──────────────
  {
    id: "06-post-block-ck-spike",
    label: "Post-hard-block CK spike (must NOT flag overtraining)",
    scenario:
      "CK is 520 — high in isolation, but everything else (cortisol, CRP, testosterone) is fine and the user is in a build phase that just finished a heavy week. This is normal training residue, not pathology. Engine must NOT flag this as overtraining.",
    context: {
      age: 41,
      sex: "m",
      trainingHoursPerWeek: 13,
      trainingPhase: "build",
      symptoms: ["none"],
      drawDate: "2026-04-01",
      recentWeightChange: "stable",
      recentIllness: "none",
    },
    results: [
      { markerId: "creatine_kinase", value: 520, unit: "U/L" },
      { markerId: "cortisol_am", value: 13, unit: "mcg/dL" },
      { markerId: "hs_crp", value: 0.5, unit: "mg/L" },
      { markerId: "testosterone_total", value: 620, unit: "ng/dL" },
      { markerId: "ferritin", value: 105, unit: "ng/mL" },
      { markerId: "tsh", value: 1.7, unit: "mIU/L" },
      { markerId: "free_t3", value: 3.2, unit: "pg/mL" },
    ],
    expectations: {
      overallStatusOneOf: ["optimal", "suboptimal"],
      mustDetectPatterns: [],
      mustNotDetectPatterns: ["overtraining triad", "under-fuel"],
      optimalMarkers: ["testosterone_total", "cortisol_am", "hs_crp", "ferritin"],
    },
  },

  // ── 7. Female masters cyclist — iron + vitamin D deficits ──────────
  {
    id: "07-female-iron-vitd-deficit",
    label: "Female masters cyclist with iron + vitamin D deficit",
    scenario:
      "Common female-masters presentation: low ferritin (28), borderline TSAT, low vitamin D for an Irish/UK winter. Engine should flag iron and vitamin D, NOT make male-specific assumptions about testosterone.",
    context: masters42FemaleBuild,
    results: [
      { markerId: "ferritin", value: 28, unit: "ng/mL" },
      { markerId: "transferrin_saturation", value: 19, unit: "%" },
      { markerId: "haemoglobin", value: 13.1, unit: "g/dL" },
      { markerId: "haematocrit", value: 39, unit: "%" },
      { markerId: "vitamin_d", value: 24, unit: "ng/mL" },
      { markerId: "vitamin_b12", value: 380, unit: "pg/mL" },
      { markerId: "tsh", value: 2.0, unit: "mIU/L" },
      { markerId: "hs_crp", value: 0.7, unit: "mg/L" },
    ],
    expectations: {
      overallStatusOneOf: ["suboptimal", "flag"],
      mustDetectPatterns: ["iron"],
      mustNotDetectPatterns: ["overtraining triad"],
      suboptimalOrFlaggedMarkers: ["ferritin", "transferrin_saturation", "vitamin_d"],
    },
  },
];

export function getFixture(id: string): BloodEngineFixture {
  const f = FIXTURES.find((x) => x.id === id);
  if (!f) throw new Error(`Unknown fixture id: ${id}`);
  return f;
}

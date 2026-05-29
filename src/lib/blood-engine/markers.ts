/**
 * The 17-marker Blood Engine core panel.
 *
 * Ranges are ATHLETE-OPTIMAL (masters cyclist lens), not standard lab ranges.
 * Sources: Stanford FASTR, Gatorade SSI, Athlete Blood Test, sports-med literature.
 *
 * All ranges are expressed in the marker's canonical unit. `units.ts` handles
 * conversion between allowed input units and the canonical unit we store.
 */

export type Sex = "m" | "f";

export type MarkerId =
  | "ferritin"
  | "haemoglobin"
  | "haematocrit"
  | "transferrin_saturation"
  | "vitamin_d"
  | "vitamin_b12"
  | "folate"
  | "rbc_magnesium"
  | "tsh"
  | "free_t3"
  | "free_t4"
  | "testosterone_total"
  | "shbg"
  | "cortisol_am"
  | "creatine_kinase"
  | "hs_crp"
  | "hba1c";

export interface MarkerRange {
  /** Inclusive lower bound of the athlete-optimal range. Null = no lower bound. */
  low: number | null;
  /** Inclusive upper bound of the athlete-optimal range. Null = no upper bound. */
  high: number | null;
}

export interface MarkerDefinition {
  id: MarkerId;
  displayName: string;
  canonicalUnit: string;
  /** Units the UI will let the user pick. First entry is the canonical one. */
  allowedUnits: string[];
  /** Athlete-optimal range. Sex-specific where the science warrants it. */
  optimal: { m: MarkerRange; f: MarkerRange };
  /** Standard lab range — purely informational, shown in the UI next to the athlete range. */
  standardLabRange: string;
  /** One-sentence explainer in Roadman voice, shown as a tooltip / context. */
  cyclingContext: string;
}

export const MARKERS: readonly MarkerDefinition[] = [
  {
    id: "ferritin",
    displayName: "Ferritin",
    canonicalUnit: "ng/mL",
    allowedUnits: ["ng/mL", "mcg/L"],
    optimal: { m: { low: 80, high: 150 }, f: { low: 60, high: 150 } },
    standardLabRange: "15–300 ng/mL",
    cyclingContext:
      "Iron storage. Below 80 and your aerobic ceiling drops — fatigue, stalled FTP, poor recovery.",
  },
  {
    id: "haemoglobin",
    displayName: "Haemoglobin",
    canonicalUnit: "g/dL",
    allowedUnits: ["g/dL", "g/L"],
    optimal: { m: { low: 14.5, high: 17.0 }, f: { low: 13.5, high: 15.5 } },
    standardLabRange: "13.5–17.5 g/dL (M)",
    cyclingContext:
      "Oxygen-carrying capacity. Can read artificially low from plasma volume expansion in trained cyclists.",
  },
  {
    id: "haematocrit",
    displayName: "Haematocrit",
    canonicalUnit: "%",
    allowedUnits: ["%"],
    optimal: { m: { low: 42, high: 48 }, f: { low: 37, high: 44 } },
    standardLabRange: "38.8–50% (M)",
    cyclingContext: "Read alongside haemoglobin — same caveat on plasma volume expansion.",
  },
  {
    id: "transferrin_saturation",
    displayName: "Transferrin Saturation",
    canonicalUnit: "%",
    allowedUnits: ["%"],
    optimal: { m: { low: 25, high: 45 }, f: { low: 25, high: 45 } },
    standardLabRange: "20–50%",
    cyclingContext:
      "Iron transport. Low TSAT is an early iron deficiency signal — often drops before ferritin does.",
  },
  {
    id: "vitamin_d",
    displayName: "Vitamin D (25-OH)",
    canonicalUnit: "ng/mL",
    allowedUnits: ["ng/mL", "nmol/L"],
    optimal: { m: { low: 50, high: 80 }, f: { low: 50, high: 80 } },
    standardLabRange: ">30 ng/mL",
    cyclingContext:
      "Bone density, immune function, testosterone. Almost every Irish/UK cyclist tests low without supplementing.",
  },
  {
    id: "vitamin_b12",
    displayName: "Vitamin B12",
    canonicalUnit: "pg/mL",
    allowedUnits: ["pg/mL", "pmol/L"],
    optimal: { m: { low: 400, high: 700 }, f: { low: 400, high: 700 } },
    standardLabRange: "200–900 pg/mL",
    cyclingContext: "Red cell production and energy metabolism. Vegetarian and vegan cyclists run hot risk.",
  },
  {
    id: "folate",
    displayName: "Folate",
    canonicalUnit: "ng/mL",
    allowedUnits: ["ng/mL", "nmol/L"],
    optimal: { m: { low: 7, high: null }, f: { low: 7, high: null } },
    standardLabRange: ">3 ng/mL",
    cyclingContext: "Works alongside B12 for red cell production.",
  },
  {
    id: "rbc_magnesium",
    displayName: "RBC Magnesium",
    canonicalUnit: "mg/dL",
    allowedUnits: ["mg/dL", "mmol/L"],
    optimal: { m: { low: 5.5, high: 6.5 }, f: { low: 5.5, high: 6.5 } },
    standardLabRange: "4.2–6.8 mg/dL",
    cyclingContext: "Muscle contraction, energy. Ask for RBC magnesium — serum doesn't tell you enough.",
  },
  {
    id: "tsh",
    displayName: "TSH",
    canonicalUnit: "mIU/L",
    allowedUnits: ["mIU/L"],
    optimal: { m: { low: 1.0, high: 2.5 }, f: { low: 1.0, high: 2.5 } },
    standardLabRange: "0.4–4.5 mIU/L",
    cyclingContext:
      "Thyroid function. Endurance athletes often sit low-normal on TSH with low T3 — read as an under-fuelling signal.",
  },
  {
    id: "free_t3",
    displayName: "Free T3",
    canonicalUnit: "pg/mL",
    allowedUnits: ["pg/mL", "pmol/L"],
    optimal: { m: { low: 3.0, high: 4.0 }, f: { low: 3.0, high: 4.0 } },
    standardLabRange: "2.0–4.4 pg/mL",
    cyclingContext: "Active thyroid hormone. Low T3 is an early RED-S / under-fuelling signal.",
  },
  {
    id: "free_t4",
    displayName: "Free T4",
    canonicalUnit: "ng/dL",
    allowedUnits: ["ng/dL", "pmol/L"],
    optimal: { m: { low: 1.0, high: 1.5 }, f: { low: 1.0, high: 1.5 } },
    standardLabRange: "0.8–1.8 ng/dL",
    cyclingContext: "Thyroid precursor. Read alongside TSH and Free T3.",
  },
  {
    id: "testosterone_total",
    displayName: "Testosterone (Total)",
    canonicalUnit: "ng/dL",
    allowedUnits: ["ng/dL", "nmol/L"],
    // Female optimal intentionally not populated in V1 (different reference model needed) — use a wide range
    // so the tool doesn't flag every female sample as suboptimal.
    optimal: { m: { low: 500, high: 800 }, f: { low: 15, high: 70 } },
    standardLabRange: "264–916 ng/dL (M)",
    cyclingContext:
      "Recovery, muscle, motivation. Endurance athletes often present low — often Exercise-Hypogonadal Male Condition, not true hypogonadism.",
  },
  {
    id: "shbg",
    displayName: "SHBG",
    canonicalUnit: "nmol/L",
    allowedUnits: ["nmol/L"],
    optimal: { m: { low: 20, high: 50 }, f: { low: 20, high: 50 } },
    standardLabRange: "10–80 nmol/L",
    cyclingContext: "High SHBG reduces bioavailable testosterone — common in endurance athletes.",
  },
  {
    id: "cortisol_am",
    displayName: "AM Cortisol",
    canonicalUnit: "mcg/dL",
    allowedUnits: ["mcg/dL", "nmol/L"],
    optimal: { m: { low: 10, high: 18 }, f: { low: 10, high: 18 } },
    standardLabRange: "6–23 mcg/dL",
    cyclingContext: "Stress hormone. Persistently high reads as overtraining or under-recovery.",
  },
  {
    id: "creatine_kinase",
    displayName: "Creatine Kinase (CK)",
    canonicalUnit: "U/L",
    allowedUnits: ["U/L"],
    optimal: { m: { low: 80, high: 300 }, f: { low: 80, high: 300 } },
    standardLabRange: "30–200 U/L",
    cyclingContext:
      "Muscle damage. Trained cyclists sit higher than untrained — context matters. Chronic elevation alongside cortisol and CRP is the real flag.",
  },
  {
    id: "hs_crp",
    displayName: "hs-CRP",
    canonicalUnit: "mg/L",
    allowedUnits: ["mg/L"],
    optimal: { m: { low: null, high: 1.0 }, f: { low: null, high: 1.0 } },
    standardLabRange: "<3.0 mg/L",
    cyclingContext:
      "Systemic inflammation. Chronic elevation means overtraining, poor recovery, cardiovascular risk.",
  },
  {
    id: "hba1c",
    displayName: "HbA1c",
    canonicalUnit: "%",
    allowedUnits: ["%", "mmol/mol"],
    optimal: { m: { low: 4.8, high: 5.4 }, f: { low: 4.8, high: 5.4 } },
    standardLabRange: "<5.7%",
    cyclingContext: "Long-term blood sugar. Masters athletes should track this for metabolic health.",
  },
] as const;

const MARKER_BY_ID: Record<MarkerId, MarkerDefinition> = Object.fromEntries(
  MARKERS.map((m) => [m.id, m])
) as Record<MarkerId, MarkerDefinition>;

export function getMarker(id: MarkerId): MarkerDefinition {
  const m = MARKER_BY_ID[id];
  if (!m) {
    throw new Error(`Unknown marker id: ${id}`);
  }
  return m;
}

export function isValidMarkerId(id: string): id is MarkerId {
  return id in MARKER_BY_ID;
}

/**
 * Classify a value in the canonical unit against the athlete-optimal range.
 * This is a deterministic local classifier used to pre-populate UI state and
 * as a fallback; the LLM is the authoritative classifier for user-facing copy.
 */
export type MarkerStatus = "optimal" | "suboptimal" | "flag";

export function classifyValue(
  markerId: MarkerId,
  canonicalValue: number,
  sex: Sex
): MarkerStatus {
  const marker = getMarker(markerId);
  const range = marker.optimal[sex];
  const belowLow = range.low !== null && canonicalValue < range.low;
  const aboveHigh = range.high !== null && canonicalValue > range.high;

  if (!belowLow && !aboveHigh) return "optimal";

  // Hard-flag thresholds: anything more than 30% outside the optimal band, or
  // hs-CRP/ferritin extremes — shift status to "flag" rather than "suboptimal".
  if (range.low !== null && canonicalValue < range.low * 0.7) return "flag";
  if (range.high !== null && canonicalValue > range.high * 1.3) return "flag";

  return "suboptimal";
}

/**
 * Unit conversion for Blood Engine markers.
 *
 * Each marker has a canonical unit (defined in `markers.ts`). When a user enters
 * a value in a non-canonical unit we convert to canonical before storing /
 * classifying / sending to the interpretation engine.
 *
 * Conversion factors sourced from standard clinical chemistry references
 * (Westgard, clinical-lab conversion tables). See unit test for round-trips.
 */

import type { MarkerId } from "./markers";
import { getMarker } from "./markers";

/**
 * factor such that: canonical_value = from_value * factor
 * (i.e. multiply the user-entered value by this factor to get canonical units)
 *
 * An entry of 1 means the two units are numerically identical.
 */
type ConversionMap = Partial<Record<MarkerId, Record<string, number>>>;

const CONVERSIONS_TO_CANONICAL: ConversionMap = {
  ferritin: {
    "ng/mL": 1,
    "mcg/L": 1, // ng/mL and mcg/L are numerically identical
  },
  haemoglobin: {
    "g/dL": 1,
    "g/L": 0.1, // 140 g/L → 14.0 g/dL
  },
  vitamin_d: {
    "ng/mL": 1,
    "nmol/L": 1 / 2.496, // 125 nmol/L → ~50 ng/mL
  },
  vitamin_b12: {
    "pg/mL": 1,
    "pmol/L": 1 / 0.7378, // 1 pg/mL = 0.7378 pmol/L
  },
  folate: {
    "ng/mL": 1,
    "nmol/L": 1 / 2.266,
  },
  rbc_magnesium: {
    "mg/dL": 1,
    "mmol/L": 1 / 0.4114,
  },
  free_t3: {
    "pg/mL": 1,
    "pmol/L": 1 / 1.536,
  },
  free_t4: {
    "ng/dL": 1,
    "pmol/L": 1 / 12.87,
  },
  testosterone_total: {
    "ng/dL": 1,
    "nmol/L": 1 / 0.03467, // 1 nmol/L ≈ 28.84 ng/dL
  },
  cortisol_am: {
    "mcg/dL": 1,
    "nmol/L": 1 / 27.59,
  },
  // HbA1c has a non-linear-looking but affine conversion between % (NGSP) and mmol/mol (IFCC)
  // Handled in normalize() as a special case, not via a simple factor.
  hba1c: {
    "%": 1,
    "mmol/mol": NaN, // sentinel — real conversion applied below
  },
};

/**
 * Normalise a user-entered value to the canonical unit for the marker.
 * Throws if the unit is not recognised for that marker.
 */
export function normalize(
  markerId: MarkerId,
  value: number,
  unit: string
): number {
  const marker = getMarker(markerId);
  if (unit === marker.canonicalUnit) {
    return round(value);
  }

  // HbA1c: special affine conversion between NGSP % and IFCC mmol/mol.
  //   NGSP% = IFCC/10.929 + 2.15
  if (markerId === "hba1c") {
    if (unit === "mmol/mol") {
      return round(value / 10.929 + 2.15);
    }
    throw new Error(`Unsupported unit "${unit}" for HbA1c`);
  }

  const factors = CONVERSIONS_TO_CANONICAL[markerId];
  const factor = factors?.[unit];
  if (factor === undefined || Number.isNaN(factor)) {
    throw new Error(`Unsupported unit "${unit}" for marker "${markerId}"`);
  }
  return round(value * factor);
}

/**
 * Convert FROM canonical TO another allowed unit — useful if we want to display
 * an athlete-optimal range in the user's preferred unit in the UI.
 */
export function denormalize(
  markerId: MarkerId,
  canonicalValue: number,
  targetUnit: string
): number {
  const marker = getMarker(markerId);
  if (targetUnit === marker.canonicalUnit) {
    return round(canonicalValue);
  }
  if (markerId === "hba1c" && targetUnit === "mmol/mol") {
    return round((canonicalValue - 2.15) * 10.929);
  }
  const factors = CONVERSIONS_TO_CANONICAL[markerId];
  const factor = factors?.[targetUnit];
  if (factor === undefined || Number.isNaN(factor)) {
    throw new Error(`Unsupported unit "${targetUnit}" for marker "${markerId}"`);
  }
  return round(canonicalValue / factor);
}

function round(n: number): number {
  // 4 sig figs is plenty for blood work — avoids float-noise in tests.
  return Math.round(n * 10_000) / 10_000;
}

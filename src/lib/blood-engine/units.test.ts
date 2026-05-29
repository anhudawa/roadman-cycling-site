import { describe, expect, it } from "vitest";
import { MARKERS, type MarkerId } from "./markers";
import { denormalize, normalize } from "./units";

describe("blood-engine/units", () => {
  it("has exactly 17 markers", () => {
    expect(MARKERS).toHaveLength(17);
  });

  it("round-trips every allowed unit through canonical and back", () => {
    for (const marker of MARKERS) {
      for (const unit of marker.allowedUnits) {
        const sample = 50; // arbitrary mid-range-ish number
        const canonical = normalize(marker.id, sample, unit);
        const back = denormalize(marker.id, canonical, unit);
        // Allow a small tolerance — round-trips through 4 sig fig rounding
        // accumulate sub-percent drift on the bigger conversion factors.
        expect(back, `${marker.id} ${unit} round-trip`).toBeCloseTo(sample, 2);
      }
    }
  });

  it("normalizes ng/mL and mcg/L to the same ferritin value (1:1)", () => {
    expect(normalize("ferritin", 80, "ng/mL")).toBe(80);
    expect(normalize("ferritin", 80, "mcg/L")).toBe(80);
  });

  it("converts haemoglobin g/L to g/dL by factor of 10", () => {
    expect(normalize("haemoglobin", 140, "g/L")).toBeCloseTo(14, 4);
  });

  it("converts vitamin D nmol/L to ng/mL", () => {
    // 125 nmol/L is the spec-cited lower bound (50 ng/mL)
    expect(normalize("vitamin_d", 125, "nmol/L")).toBeCloseTo(50.08, 1);
  });

  it("converts testosterone nmol/L to ng/dL", () => {
    // 20 nmol/L ≈ 576 ng/dL
    expect(normalize("testosterone_total", 20, "nmol/L")).toBeCloseTo(576.87, 1);
  });

  it("handles HbA1c affine conversion % ↔ mmol/mol", () => {
    // 5.4% NGSP ≈ 36 mmol/mol IFCC
    expect(normalize("hba1c", 36, "mmol/mol")).toBeCloseTo(5.444, 2);
    expect(denormalize("hba1c", 5.4, "mmol/mol")).toBeCloseTo(35.52, 1);
  });

  it("throws on unsupported units", () => {
    expect(() => normalize("ferritin", 80, "g/L")).toThrow();
    expect(() => normalize("hba1c" as MarkerId, 5, "%%")).toThrow();
  });

  it("pass-through when unit equals canonical unit", () => {
    for (const m of MARKERS) {
      expect(normalize(m.id, 42, m.canonicalUnit)).toBeCloseTo(42, 4);
    }
  });
});

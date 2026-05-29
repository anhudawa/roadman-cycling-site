/**
 * Compare a Claude interpretation result against a fixture's expectations.
 * Returns a structured diff — empty `failures` means the fixture passed.
 */

import type { InterpretationJSON } from "../schemas";
import type { BloodEngineFixture } from "./index";

export interface FixtureCheckResult {
  fixtureId: string;
  passed: boolean;
  failures: string[];
  warnings: string[];
}

export function checkFixture(
  fixture: BloodEngineFixture,
  interpretation: InterpretationJSON
): FixtureCheckResult {
  const failures: string[] = [];
  const warnings: string[] = [];
  const exp = fixture.expectations;

  // ── overall status
  if (!exp.overallStatusOneOf.includes(interpretation.overall_status)) {
    failures.push(
      `overall_status: expected one of ${exp.overallStatusOneOf.join("/")}, got "${interpretation.overall_status}"`
    );
  }

  // ── pattern detection (case-insensitive substring match on pattern names)
  const detectedNames = interpretation.detected_patterns
    .map((p) => p.name?.toLowerCase() ?? "")
    .join(" || ");
  for (const required of exp.mustDetectPatterns) {
    if (!detectedNames.includes(required.toLowerCase())) {
      failures.push(`missing required pattern: "${required}"`);
    }
  }
  for (const forbidden of exp.mustNotDetectPatterns) {
    if (detectedNames.includes(forbidden.toLowerCase())) {
      failures.push(`unexpectedly detected forbidden pattern: "${forbidden}"`);
    }
  }

  // ── marker-level expectations
  const byId = new Map<string, (typeof interpretation.markers)[number]>();
  for (const m of interpretation.markers) {
    byId.set(m.markerId, m);
  }

  for (const id of exp.suboptimalOrFlaggedMarkers ?? []) {
    const m = byId.get(id as never);
    if (!m) {
      warnings.push(`expected suboptimal/flag on "${id}" but marker not in response`);
      continue;
    }
    if (m.status === "optimal") {
      failures.push(`marker "${id}" should be suboptimal/flag, got "optimal"`);
    }
  }

  for (const id of exp.optimalMarkers ?? []) {
    const m = byId.get(id as never);
    if (!m) {
      warnings.push(`expected optimal "${id}" not in response`);
      continue;
    }
    if (m.status !== "optimal") {
      failures.push(`marker "${id}" should be optimal, got "${m.status}"`);
    }
  }

  return {
    fixtureId: fixture.id,
    passed: failures.length === 0,
    failures,
    warnings,
  };
}

/**
 * Server-side trend computation for the dashboard.
 *
 * Walks through a user's reports (chronological), pulls each marker value, and
 * returns one series per marker that has ≥2 data points. The dashboard renders
 * a sparkline per series so users can see what's moving over time.
 */

import { getMarker, MARKERS, type MarkerId } from "./markers";
import type {
  InterpretationJSON,
  NormalizedMarkerValue,
} from "./schemas";
import type { BloodReport } from "./db";

export interface TrendPoint {
  drawDate: string;        // ISO yyyy-mm-dd
  reportId: number;
  value: number;           // canonical units
  status: "optimal" | "suboptimal" | "flag" | null;
}

export interface MarkerTrend {
  markerId: MarkerId;
  displayName: string;
  canonicalUnit: string;
  optimalLow: number | null;
  optimalHigh: number | null;
  points: TrendPoint[];
  /** Latest value's status — drives sparkline accent colour. */
  latestStatus: "optimal" | "suboptimal" | "flag" | null;
  /** Net direction over the series ('up' / 'down' / 'flat'). */
  direction: "up" | "down" | "flat";
}

export function computeTrends(
  reports: BloodReport[],
  sex: "m" | "f"
): MarkerTrend[] {
  if (reports.length < 2) return [];

  // Sort oldest → newest by drawDate (fall back to createdAt if missing).
  const ordered = [...reports].sort((a, b) => {
    const ad = a.drawDate ?? "";
    const bd = b.drawDate ?? "";
    if (ad && bd) return ad.localeCompare(bd);
    return (a.createdAt?.getTime?.() ?? 0) - (b.createdAt?.getTime?.() ?? 0);
  });

  // Build a per-marker series.
  const seriesById = new Map<MarkerId, TrendPoint[]>();

  for (const report of ordered) {
    const results = (report.results ?? []) as NormalizedMarkerValue[];
    const interp = report.interpretation as InterpretationJSON | null;
    const interpByMarker = new Map<string, "optimal" | "suboptimal" | "flag">();
    for (const m of interp?.markers ?? []) {
      interpByMarker.set(m.markerId, m.status);
    }

    for (const r of results) {
      if (typeof r.canonicalValue !== "number" || !Number.isFinite(r.canonicalValue)) continue;
      const arr = seriesById.get(r.markerId) ?? [];
      arr.push({
        drawDate: report.drawDate ?? report.createdAt?.toISOString().slice(0, 10) ?? "",
        reportId: report.id,
        value: r.canonicalValue,
        status: interpByMarker.get(r.markerId) ?? null,
      });
      seriesById.set(r.markerId, arr);
    }
  }

  const trends: MarkerTrend[] = [];
  for (const m of MARKERS) {
    const points = seriesById.get(m.id);
    if (!points || points.length < 2) continue;

    const range = m.optimal[sex];
    const latest = points[points.length - 1];
    const first = points[0];
    let direction: MarkerTrend["direction"] = "flat";
    const delta = latest.value - first.value;
    const pct = first.value !== 0 ? Math.abs(delta / first.value) : 0;
    if (pct >= 0.05) direction = delta > 0 ? "up" : "down";

    trends.push({
      markerId: m.id,
      displayName: getMarker(m.id).displayName,
      canonicalUnit: m.canonicalUnit,
      optimalLow: range.low,
      optimalHigh: range.high,
      points,
      latestStatus: latest.status,
      direction,
    });
  }

  return trends;
}

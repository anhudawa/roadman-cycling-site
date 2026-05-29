/**
 * Render a Blood Engine report as a standalone Markdown document.
 *
 * The primary use-case is "bring to your GP" — a simple plain-text file the
 * user can email, print, or paste into a clinical portal. Keep the rendering
 * deterministic (no dates or times that would cause regression-test noise if
 * the input is fixed).
 */

import { BLOOD_ENGINE_DISCLAIMER } from "../../../content/blood-engine/disclaimer";
import type { BloodReport } from "./db";
import type {
  InterpretationJSON,
  NormalizedMarkerValue,
  ReportContext,
} from "./schemas";

export function renderReportMarkdown(report: BloodReport): string {
  const ctx = report.context as ReportContext;
  const interp = report.interpretation as InterpretationJSON | null;
  const results = (report.results ?? []) as NormalizedMarkerValue[];

  const lines: string[] = [];

  lines.push(`# Blood Engine report #${report.id}`);
  lines.push("");
  lines.push(`_Cycling-specific bloodwork interpretation for masters cyclists._`);
  lines.push("");
  lines.push(`**Draw date:** ${report.drawDate ?? "—"}`);
  lines.push(`**Generated:** ${report.createdAt?.toISOString?.().slice(0, 10) ?? "—"}`);
  lines.push(`**Prompt version:** ${report.promptVersion ?? "—"}`);
  lines.push("");

  lines.push(`## Context`);
  lines.push("");
  lines.push(`- **Age:** ${ctx.age}`);
  lines.push(`- **Sex:** ${ctx.sex === "m" ? "Male" : "Female"}`);
  lines.push(`- **Weekly training hours:** ${ctx.trainingHoursPerWeek}`);
  lines.push(`- **Training phase:** ${ctx.trainingPhase}`);
  lines.push(
    `- **Symptoms:** ${ctx.symptoms.length ? ctx.symptoms.map((s) => s.replace(/_/g, " ")).join(", ") : "none reported"}`
  );
  lines.push("");

  if (interp) {
    lines.push(`## Overall: \`${interp.overall_status}\``);
    lines.push("");
    lines.push(`> ${interp.summary}`);
    lines.push("");

    if (interp.detected_patterns.length) {
      lines.push(`## Patterns detected`);
      lines.push("");
      for (const p of interp.detected_patterns) {
        lines.push(`### ${p.name} _(severity: ${p.severity})_`);
        lines.push("");
        lines.push(p.description);
        lines.push("");
      }
    }

    lines.push(`## Marker by marker`);
    lines.push("");
    lines.push(`| Marker | Value | Athlete-optimal | Status |`);
    lines.push(`| --- | --- | --- | --- |`);
    for (const m of interp.markers) {
      lines.push(
        `| ${m.name} | ${m.value} ${m.unit} | ${m.athlete_optimal_range} | ${m.status} |`
      );
    }
    lines.push("");

    for (const m of interp.markers) {
      lines.push(`### ${m.name}`);
      lines.push("");
      lines.push(`**Value:** ${m.value} ${m.unit} · **Status:** ${m.status} · **Athlete-optimal:** ${m.athlete_optimal_range}`);
      lines.push("");
      lines.push(m.interpretation);
      lines.push("");
      lines.push(`**Action:** ${m.action}`);
      lines.push("");
    }

    if (interp.action_plan.length) {
      lines.push(`## Action plan`);
      lines.push("");
      for (const a of interp.action_plan) {
        lines.push(`${a.priority}. **${a.action}** _(${a.timeframe})_`);
      }
      lines.push("");
    }

    lines.push(`## Retest`);
    lines.push("");
    lines.push(
      `In ${interp.retest_recommendation.timeframe}. Focus markers: ${interp.retest_recommendation.focus_markers.join(", ") || "—"}.`
    );
    lines.push("");
  } else {
    lines.push(`## Interpretation unavailable`);
    lines.push("");
    lines.push(
      "This report has no stored interpretation. The raw submitted values are included below for reference."
    );
    lines.push("");
    lines.push(`| Marker | Value |`);
    lines.push(`| --- | --- |`);
    for (const r of results) {
      lines.push(`| ${r.markerId} | ${r.canonicalValue} (${r.originalValue} ${r.originalUnit}) |`);
    }
    lines.push("");
  }

  lines.push(`---`);
  lines.push("");
  lines.push(`## Medical disclaimer`);
  lines.push("");
  lines.push(BLOOD_ENGINE_DISCLAIMER);
  lines.push("");

  return lines.join("\n");
}

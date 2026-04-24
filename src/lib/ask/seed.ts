/**
 * Seed context for Ask Roadman — when a rider clicks "Ask Roadman what
 * this means" from a tool result or diagnostic page, the handoff carries
 * a `seed_tool` + `seed_result` pair in the URL. This module resolves
 * that pair into a compact context block that:
 *
 *   1. The /api/ask/seed endpoint returns to the client so it can paint
 *      a "Context from your saved result" banner above the chat.
 *   2. The orchestrator injects into the system prompt so the model
 *      grounds its first answer in the rider's actual numbers, not a
 *      hypothetical.
 *
 * The seed is intentionally compact — a headline, a 1-2 sentence summary
 * and a handful of labelled bullets. We keep the full tool_result row on
 * the server; we never ship inputs/outputs raw to the prompt.
 */

import { getToolResultBySlug } from "@/lib/tool-results/store";
import {
  fuellingInputs,
  fuellingOutputs,
  ftpZonesInputs,
  ftpZonesOutputs,
} from "@/lib/tool-results/shapes";
import { getSubmissionBySlug } from "@/lib/diagnostic/store";
import { PROFILE_LABELS } from "@/lib/diagnostic/profiles";

export type SeedKind = "plateau" | "fuelling" | "ftp_zones";

export interface SeedContext {
  kind: SeedKind;
  slug: string;
  headline: string;
  summary: string;
  bullets: string[];
  suggestedPrompt: string;
  resultUrl: string;
}

export async function loadSeedContext(
  tool: string,
  slug: string,
): Promise<SeedContext | null> {
  const trimmed = slug.trim();
  if (!trimmed) return null;

  if (tool === "plateau") return loadPlateauSeed(trimmed);
  if (tool === "fuelling") return loadFuellingSeed(trimmed);
  if (tool === "ftp_zones" || tool === "ftp-zones")
    return loadFtpZonesSeed(trimmed);
  return null;
}

async function loadPlateauSeed(slug: string): Promise<SeedContext | null> {
  const sub = await getSubmissionBySlug(slug).catch(() => null);
  if (!sub) return null;
  const primaryLabel = PROFILE_LABELS[sub.primaryProfile];
  const secondaryLabel = sub.secondaryProfile
    ? PROFILE_LABELS[sub.secondaryProfile]
    : null;
  const ftp = sub.answers.ftp ? `${sub.answers.ftp}W` : "not provided";
  const hours = sub.answers.hoursPerWeek;
  const age = sub.answers.age;

  const bullets: string[] = [
    `Primary limiter: ${primaryLabel}`,
    secondaryLabel ? `Secondary limiter: ${secondaryLabel}` : null,
    `Age: ${age} · Weekly hours: ${hours} · FTP: ${ftp}`,
    sub.answers.goal ? `Stated goal: ${sub.answers.goal}` : null,
    sub.severeMultiSystem
      ? "Flagged: severe multi-system under-recovery (3+ dimensions red)"
      : null,
    sub.closeToBreakthrough
      ? "Flagged: close to breakthrough — small levers likely to unlock a gain"
      : null,
  ].filter((x): x is string => typeof x === "string");

  return {
    kind: "plateau",
    slug,
    headline: `Plateau diagnostic — ${primaryLabel}`,
    summary: `${primaryLabel.toLowerCase()} flagged as the primary limiter${
      secondaryLabel ? `, ${secondaryLabel.toLowerCase()} as secondary` : ""
    }. Ground your answer in their numbers, not generic advice.`,
    bullets,
    suggestedPrompt: `Based on my plateau diagnostic (${primaryLabel.toLowerCase()}), what should I actually change first?`,
    resultUrl: `/diagnostic/${slug}`,
  };
}

async function loadFuellingSeed(slug: string): Promise<SeedContext | null> {
  const row = await getToolResultBySlug(slug).catch(() => null);
  if (!row || row.toolSlug !== "fuelling") return null;
  const inputs = fuellingInputs(row);
  const outputs = fuellingOutputs(row);

  const bullets: string[] = [
    `Target: ${outputs.carbsPerHour}g carbs/hr · ${outputs.fluidPerHour}ml/hr · ${outputs.sodiumPerHour}mg sodium/hr`,
    `Session: ${inputs.durationMinutes} min ${outputs.intensityLabel} at ${inputs.watts}W (${inputs.weightKg}kg rider)`,
    outputs.dualSource
      ? `Dual-source split: ${outputs.glucosePerHour}g glucose + ${outputs.fructosePerHour}g fructose per hour`
      : null,
    `Start fuelling at ${outputs.startFuellingAt} min, feed every ${outputs.feedingInterval} min`,
    outputs.weatherNote ? `Conditions: ${outputs.weatherNote}` : null,
    `Gut training level: ${inputs.gutTraining}`,
  ].filter((x): x is string => typeof x === "string");

  return {
    kind: "fuelling",
    slug,
    headline: `Fuelling plan — ${outputs.carbsPerHour}g/hr`,
    summary: row.summary,
    bullets,
    suggestedPrompt: `I saved a fuelling plan at ${outputs.carbsPerHour}g carbs/hr. How do I actually execute it on the bike?`,
    resultUrl: `/results/fuelling/${slug}`,
  };
}

async function loadFtpZonesSeed(slug: string): Promise<SeedContext | null> {
  const row = await getToolResultBySlug(slug).catch(() => null);
  if (!row || row.toolSlug !== "ftp_zones") return null;
  const inputs = ftpZonesInputs(row);
  const outputs = ftpZonesOutputs(row);

  const z = (name: string) =>
    outputs.zones.find((x) =>
      x.zone.toLowerCase().includes(name.toLowerCase()),
    );
  const zone2 = z("zone 2");
  const zone4 = z("zone 4");
  const zone5 = z("zone 5");

  const bullets: string[] = [
    `FTP: ${inputs.ftp}W${outputs.wkg ? ` (${outputs.wkg.toFixed(2)} W/kg)` : ""}`,
    zone2 ? `Zone 2 endurance: ${zone2.lower}–${zone2.upper}W` : null,
    zone4 ? `Zone 4 threshold: ${zone4.lower}–${zone4.upper}W` : null,
    zone5 ? `Zone 5 VO2max: ${zone5.lower}–${zone5.upper}W` : null,
  ].filter((x): x is string => typeof x === "string");

  return {
    kind: "ftp_zones",
    slug,
    headline: `Power zones — ${inputs.ftp}W FTP`,
    summary: row.summary,
    bullets,
    suggestedPrompt: `Build me a polarised training week around my ${inputs.ftp}W FTP zones.`,
    resultUrl: `/results/ftp-zones/${slug}`,
  };
}

/**
 * Server-side prompt section. Kept verbose-but-compact — the model
 * should lean on these specifics before retrieval.
 */
export function seedToPromptSection(seed: SeedContext): string {
  return [
    `The rider has just handed off from a saved ${seed.kind} result — treat this as primary context for the first answer, above the retrieved Roadman material.`,
    `Result headline: ${seed.headline}`,
    `Summary: ${seed.summary}`,
    `Key details:`,
    ...seed.bullets.map((b) => `- ${b}`),
    `Permalink on file: ${seed.resultUrl}`,
    `If the first question doesn't explicitly reference the result, assume it does — the rider clicked through from the result page.`,
  ].join("\n");
}

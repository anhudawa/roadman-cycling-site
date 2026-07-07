/**
 * Tour de France overlay — state machine.
 *
 * Single source of truth for which Tour mode the site is in. The whole
 * overlay is a time-boxed facade that layers over the existing site and
 * disappears on its own after the race. Edit the dates in
 * src/data/tour-de-france-2026.ts (TOUR_META) and OVERLAY_END below —
 * not the components.
 *
 * Four phases:
 *   - "countdown"  now → the day before the Grand Départ
 *   - "live"       race window (Jul 4–26, 2026), inclusive
 *   - "fadeout"    after the finish → OVERLAY_END (summary/results)
 *   - "off"        after OVERLAY_END — the overlay is gone, site is normal
 *
 * Time handling: phases are computed at day resolution in a fixed race
 * timezone (Europe/Paris, UTC+2 in July) so the mode flips at French
 * midnight regardless of where the visitor or the server sits. The live
 * second-by-second countdown is a separate client concern (CountdownTimer).
 */

import { TOUR_META, TOUR_STAGES, type Stage } from "@/data/tour-de-france-2026";

export type TourPhase = "countdown" | "live" | "fadeout" | "off";

/**
 * The overlay lingers for ~2 weeks after the finish to carry the result,
 * then removes itself. Bump this to extend the post-race summary window.
 */
export const OVERLAY_END = "2026-08-09";

/** CEST is UTC+2 in July. We pin the race clock to it so day boundaries
 *  are stable no matter the server/visitor timezone. */
const RACE_UTC_OFFSET_HOURS = 2;

/** A `YYYY-MM-DD` date string for the given instant, in race-local time. */
function raceDateKey(d: Date): string {
  const shifted = new Date(d.getTime() + RACE_UTC_OFFSET_HOURS * 3600_000);
  return shifted.toISOString().slice(0, 10);
}

/** Midnight (race-local) of a `YYYY-MM-DD` string, as a UTC instant.
 *  Race-local is UTC+2, so local 00:00 is 22:00 UTC the day before. */
function raceMidnight(dateKey: string): Date {
  return new Date(
    Date.parse(`${dateKey}T00:00:00.000Z`) - RACE_UTC_OFFSET_HOURS * 3600_000,
  );
}

/**
 * Resolve "now". A `NEXT_PUBLIC_TOUR_SIM_DATE` env override (ISO string)
 * lets us preview any phase without waiting for the calendar — it is read
 * on both server and client so previews stay consistent. Unset in
 * production → real wall-clock time.
 */
export function resolveNow(now?: Date): Date {
  if (now) return now;
  const sim = process.env.NEXT_PUBLIC_TOUR_SIM_DATE;
  if (sim) {
    const d = new Date(sim);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

export function getTourPhase(now?: Date): TourPhase {
  const today = raceDateKey(resolveNow(now));
  if (today < TOUR_META.startDate) return "countdown";
  if (today <= TOUR_META.endDate) return "live";
  if (today <= OVERLAY_END) return "fadeout";
  return "off";
}

/** Is the overlay visible at all right now? */
export function isTourActive(now?: Date): boolean {
  return getTourPhase(now) !== "off";
}

/** Whole days from now until the first stage. 0 once the race starts. */
export function daysUntilStart(now?: Date): number {
  const start = raceMidnight(TOUR_META.startDate).getTime();
  const ms = start - resolveNow(now).getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/** Milliseconds until the Grand Départ — for the live countdown clock. */
export function msUntilStart(now?: Date): number {
  return Math.max(
    0,
    raceMidnight(TOUR_META.startDate).getTime() - resolveNow(now).getTime(),
  );
}

/** The stage racing today, if any (undefined on rest days / outside live). */
export function getTodayStage(now?: Date): Stage | undefined {
  const today = raceDateKey(resolveNow(now));
  return TOUR_STAGES.find((s) => s.date === today);
}

/** Yesterday's stage relative to now — the "latest result" surface. */
export function getYesterdayStage(now?: Date): Stage | undefined {
  const y = new Date(resolveNow(now).getTime() - 86_400_000);
  const key = raceDateKey(y);
  return TOUR_STAGES.find((s) => s.date === key);
}

/** Next stage on or after today — used on rest days and pre-race. */
export function getNextStage(now?: Date): Stage | undefined {
  const today = raceDateKey(resolveNow(now));
  return TOUR_STAGES.find((s) => s.date >= today);
}

/** Stages already completed (date strictly before today). */
export function getCompletedStages(now?: Date): Stage[] {
  const today = raceDateKey(resolveNow(now));
  return TOUR_STAGES.filter((s) => s.date < today);
}

/** Is today one of the two rest days, within the live window? */
export function isRestDay(now?: Date): boolean {
  const today = raceDateKey(resolveNow(now));
  return (TOUR_META.restDays as readonly string[]).includes(today);
}

/** Pretty race-local date, e.g. "Saturday 4 July". */
export function formatStageDate(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00.000Z`);
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

/**
 * The three 2026 Grand Départ towns sit in Spain (Catalonia); every other
 * town on the route is in France. Used to stamp a country on each stage
 * `location` so the SportsEvent JSON-LD carries the `address` Google's
 * Event rich result requires (a Place with only a `name` is flagged
 * "missing field address").
 */
const SPANISH_TOUR_TOWNS = new Set(["Barcelona", "Tarragona", "Granollers"]);

/**
 * Build a schema.org `Place` for a Tour town with a `PostalAddress` so the
 * enclosing SportsEvent satisfies Google's Event `location.address`
 * requirement. `addressCountry` is ISO 3166-1 alpha-2 (ES for the Grand
 * Départ towns, FR for the rest of the route).
 */
export function tourPlace(town: string) {
  return {
    "@type": "Place",
    name: town,
    address: {
      "@type": "PostalAddress",
      addressLocality: town,
      addressCountry: SPANISH_TOUR_TOWNS.has(town) ? "ES" : "FR",
    },
  };
}

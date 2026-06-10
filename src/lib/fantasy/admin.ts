/**
 * Roadman Fantasy Tour — admin-surface helpers.
 *
 * Pure validation for the stage-result payload the admin results editor
 * submits, plus CEST datetime conversion for stage start times. The API
 * routes under /api/admin/fantasy are the only callers; nothing here
 * touches the database — callers pass in the known rider/team id sets.
 */

import type { StageResultData } from "./scoring";

export const ABANDON_REASONS = ["DNS", "DNF", "HD", "DSQ"] as const;
export type AbandonReason = (typeof ABANDON_REASONS)[number];

export const RIDER_CLASSES = ["gc", "sprint", "climb", "break"] as const;
export type RiderClass = (typeof RIDER_CLASSES)[number];

export const RIDER_STATUSES = [
  "provisional",
  "confirmed",
  "removed",
  "dns",
  "abandoned",
] as const;
export type RiderStatus = (typeof RIDER_STATUSES)[number];

/** Credits range is fixed for launch (Section 3 pricing sheet). */
export const PRICE_MIN = 4;
export const PRICE_MAX = 24;

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/* ─── CEST start times ──────────────────────────────────────────
 * Admins enter start times as CEST (the roadbook's timezone). The
 * datetime-local value is pinned to +02:00 — correct for the whole
 * July race window — and stored as a timestamptz.
 */

/** "YYYY-MM-DDTHH:mm" (datetime-local, CEST) → Date, or null if malformed. */
export function parseCestDateTime(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00+02:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Date → "YYYY-MM-DDTHH:mm" rendered in CEST for a datetime-local input. */
export function formatCestForInput(date: Date | null): string {
  if (!date) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/* ─── Stage-result payload validation ───────────────────────────── */

export interface StageResultValidationContext {
  stageNumber: number;
  /** Every fantasy_riders.id — any id outside this set is rejected. */
  riderIds: ReadonlySet<number>;
  proTeamIds: ReadonlySet<number>;
}

export type StageResultParse =
  | { ok: true; data: StageResultData }
  | { ok: false; errors: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toInt(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

/**
 * Validate and normalise the raw payload from the results editor into a
 * clean StageResultData. Gates (Section 6.3): no duplicate finish
 * positions, no duplicate riders in finishers, and every rider/team id
 * must exist. Empty sections are omitted rather than stored as [].
 */
export function parseStageResultPayload(
  body: unknown,
  ctx: StageResultValidationContext,
): StageResultParse {
  if (!isRecord(body)) return { ok: false, errors: ["Payload must be an object"] };

  const errors: string[] = [];
  const data: StageResultData = { stageNumber: ctx.stageNumber };

  const riderIdOrError = (value: unknown, label: string): number | null => {
    const id = toInt(value);
    if (id == null || !ctx.riderIds.has(id)) {
      errors.push(`${label}: unknown rider id ${JSON.stringify(value ?? null)}`);
      return null;
    }
    return id;
  };

  // --- finishers ---
  if (body.finishers != null) {
    if (!Array.isArray(body.finishers)) {
      errors.push("finishers must be an array");
    } else {
      const seenPositions = new Set<number>();
      const seenRiders = new Set<number>();
      const finishers: { position: number; riderId: number }[] = [];
      body.finishers.forEach((row, i) => {
        if (!isRecord(row)) {
          errors.push(`finishers[${i}] must be an object`);
          return;
        }
        const position = toInt(row.position);
        if (position == null || position < 1) {
          errors.push(`finishers[${i}]: position must be a positive integer`);
          return;
        }
        const riderId = riderIdOrError(row.riderId, `finishers[${i}]`);
        if (riderId == null) return;
        if (seenPositions.has(position)) {
          errors.push(`Duplicate finish position ${position}`);
          return;
        }
        if (seenRiders.has(riderId)) {
          errors.push(`Rider ${riderId} appears more than once in finishers`);
          return;
        }
        seenPositions.add(position);
        seenRiders.add(riderId);
        finishers.push({ position, riderId });
      });
      if (finishers.length > 0) {
        data.finishers = finishers.sort((a, b) => a.position - b.position);
      }
    }
  }

  // --- TTT team order (Stage 1 fallback) ---
  if (body.tttTeams != null) {
    if (!Array.isArray(body.tttTeams)) {
      errors.push("tttTeams must be an array");
    } else {
      const seenPositions = new Set<number>();
      const seenTeams = new Set<number>();
      const tttTeams: { position: number; proTeamId: number }[] = [];
      body.tttTeams.forEach((row, i) => {
        if (!isRecord(row)) {
          errors.push(`tttTeams[${i}] must be an object`);
          return;
        }
        const position = toInt(row.position);
        if (position == null || position < 1) {
          errors.push(`tttTeams[${i}]: position must be a positive integer`);
          return;
        }
        const proTeamId = toInt(row.proTeamId);
        if (proTeamId == null || !ctx.proTeamIds.has(proTeamId)) {
          errors.push(`tttTeams[${i}]: unknown pro team id`);
          return;
        }
        if (seenPositions.has(position)) {
          errors.push(`Duplicate TTT team position ${position}`);
          return;
        }
        if (seenTeams.has(proTeamId)) {
          errors.push(`Pro team ${proTeamId} appears more than once in tttTeams`);
          return;
        }
        seenPositions.add(position);
        seenTeams.add(proTeamId);
        tttTeams.push({ position, proTeamId });
      });
      if (tttTeams.length > 0) {
        data.tttTeams = tttTeams.sort((a, b) => a.position - b.position);
      }
    }
  }

  // --- jerseys ---
  if (body.jerseys != null) {
    if (!isRecord(body.jerseys)) {
      errors.push("jerseys must be an object");
    } else {
      const jerseys: NonNullable<StageResultData["jerseys"]> = {};
      for (const key of ["yellow", "green", "polkaDot", "white"] as const) {
        const value = body.jerseys[key];
        if (value == null) continue;
        const riderId = riderIdOrError(value, `jerseys.${key}`);
        if (riderId != null) jerseys[key] = riderId;
      }
      if (Object.keys(jerseys).length > 0) data.jerseys = jerseys;
    }
  }

  // --- intermediate sprints & KOM summits (same shape) ---
  const parseTop3Groups = (
    value: unknown,
    label: "intermediateSprints" | "komSummits",
  ): { name?: string; top3: number[] }[] | null => {
    if (!Array.isArray(value)) {
      errors.push(`${label} must be an array`);
      return null;
    }
    const groups: { name?: string; top3: number[] }[] = [];
    value.forEach((group, i) => {
      if (!isRecord(group) || !Array.isArray(group.top3)) {
        errors.push(`${label}[${i}] must be an object with a top3 array`);
        return;
      }
      if (group.top3.length > 3) {
        errors.push(`${label}[${i}]: top3 has more than 3 riders`);
        return;
      }
      const seen = new Set<number>();
      const top3: number[] = [];
      group.top3.forEach((value, j) => {
        const riderId = riderIdOrError(value, `${label}[${i}].top3[${j}]`);
        if (riderId == null) return;
        if (seen.has(riderId)) {
          errors.push(`${label}[${i}]: rider ${riderId} listed twice`);
          return;
        }
        seen.add(riderId);
        top3.push(riderId);
      });
      if (top3.length === 0) return;
      const name =
        typeof group.name === "string" && group.name.trim() !== ""
          ? group.name.trim()
          : undefined;
      groups.push(name ? { name, top3 } : { top3 });
    });
    return groups;
  };

  if (body.intermediateSprints != null) {
    const groups = parseTop3Groups(body.intermediateSprints, "intermediateSprints");
    if (groups && groups.length > 0) data.intermediateSprints = groups;
  }
  if (body.komSummits != null) {
    const groups = parseTop3Groups(body.komSummits, "komSummits");
    if (groups && groups.length > 0) data.komSummits = groups;
  }

  // --- combativity ---
  if (body.combativityRiderId != null) {
    const riderId = riderIdOrError(body.combativityRiderId, "combativityRiderId");
    if (riderId != null) data.combativityRiderId = riderId;
  }

  // --- breakaway bonus ---
  if (body.breakawayBonusRiderIds != null) {
    if (!Array.isArray(body.breakawayBonusRiderIds)) {
      errors.push("breakawayBonusRiderIds must be an array");
    } else {
      const seen = new Set<number>();
      const ids: number[] = [];
      body.breakawayBonusRiderIds.forEach((value, i) => {
        const riderId = riderIdOrError(value, `breakawayBonusRiderIds[${i}]`);
        if (riderId == null) return;
        if (seen.has(riderId)) {
          errors.push(`Rider ${riderId} listed twice in breakaway bonus`);
          return;
        }
        seen.add(riderId);
        ids.push(riderId);
      });
      if (ids.length > 0) data.breakawayBonusRiderIds = ids;
    }
  }

  // --- abandons ---
  if (body.abandons != null) {
    if (!Array.isArray(body.abandons)) {
      errors.push("abandons must be an array");
    } else {
      const seen = new Set<number>();
      const abandons: { riderId: number; reason: AbandonReason }[] = [];
      body.abandons.forEach((row, i) => {
        if (!isRecord(row)) {
          errors.push(`abandons[${i}] must be an object`);
          return;
        }
        const riderId = riderIdOrError(row.riderId, `abandons[${i}]`);
        if (riderId == null) return;
        const reason = row.reason;
        if (
          typeof reason !== "string" ||
          !ABANDON_REASONS.includes(reason as AbandonReason)
        ) {
          errors.push(`abandons[${i}]: reason must be one of ${ABANDON_REASONS.join("/")}`);
          return;
        }
        if (seen.has(riderId)) {
          errors.push(`Rider ${riderId} listed twice in abandons`);
          return;
        }
        seen.add(riderId);
        abandons.push({ riderId, reason: reason as AbandonReason });
      });
      if (abandons.length > 0) data.abandons = abandons;
    }
  }

  // --- final classifications (Stage 21 only) ---
  if (body.final != null) {
    if (ctx.stageNumber !== 21) {
      errors.push("final classifications are only valid on stage 21");
    } else if (!isRecord(body.final)) {
      errors.push("final must be an object");
    } else {
      const final: NonNullable<StageResultData["final"]> = {
        gc: [],
        green: [],
        polkaDot: [],
        white: [],
      };
      let any = false;
      for (const key of ["gc", "green", "polkaDot", "white"] as const) {
        const list = body.final[key];
        if (list == null) continue;
        if (!Array.isArray(list)) {
          errors.push(`final.${key} must be an array`);
          continue;
        }
        const seen = new Set<number>();
        list.forEach((value, i) => {
          const riderId = riderIdOrError(value, `final.${key}[${i}]`);
          if (riderId == null) return;
          if (seen.has(riderId)) {
            errors.push(`final.${key}: rider ${riderId} listed twice`);
            return;
          }
          seen.add(riderId);
          final[key].push(riderId);
        });
        if (final[key].length > 0) any = true;
      }
      if (any) data.final = final;
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data };
}

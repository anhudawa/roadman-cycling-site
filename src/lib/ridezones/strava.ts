/**
 * Strava bulk-export parser.
 *
 * Reads the `activities.csv` from a Strava account export (Settings → My
 * Account → Download or Delete Your Account → Request Your Archive) and
 * turns ride rows into RideZones activities. Header names vary across
 * export vintages and locales, so columns are matched loosely.
 */

import type { Activity } from "./types";

export interface StravaParseResult {
  activities: Activity[];
  /** Rows skipped because they weren't rides or couldn't be parsed. */
  skipped: number;
  errors: string[];
}

const RIDE_TYPES = ["ride", "virtual ride", "gravel ride", "mountain bike ride", "e-bike ride", "velomobile"];

/** RFC-4180-ish CSV parsing: quoted fields, embedded commas, escaped quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }
  return rows;
}

function findColumn(headers: string[], ...candidates: string[]): number {
  const lowered = headers.map((h) => h.trim().toLowerCase());
  for (const candidate of candidates) {
    const idx = lowered.indexOf(candidate);
    if (idx !== -1) return idx;
  }
  return -1;
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value.replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** Strava dates look like "Jul 20, 2026, 6:12:34 AM" — with ISO as a fallback. */
export function parseStravaDate(value: string): string | null {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  const cleaned = trimmed.replace(/(\d{4}),/, "$1");
  const parsed = new Date(cleaned);
  if (Number.isNaN(parsed.getTime())) return null;
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(
    parsed.getDate()
  ).padStart(2, "0")}`;
}

export function parseStravaActivitiesCsv(csvText: string): StravaParseResult {
  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    return { activities: [], skipped: 0, errors: ["File is empty or not a CSV."] };
  }

  const headers = rows[0];
  const col = {
    id: findColumn(headers, "activity id"),
    date: findColumn(headers, "activity date"),
    name: findColumn(headers, "activity name"),
    type: findColumn(headers, "activity type"),
    movingTime: findColumn(headers, "moving time"),
    elapsedTime: findColumn(headers, "elapsed time"),
    distance: findColumn(headers, "distance"),
    avgHr: findColumn(headers, "average heart rate"),
    avgPower: findColumn(headers, "average watts", "average power"),
    np: findColumn(headers, "weighted average power", "normalized power"),
    elevation: findColumn(headers, "elevation gain"),
  };

  if (col.date === -1 || col.type === -1) {
    return {
      activities: [],
      skipped: 0,
      errors: [
        'This doesn\'t look like a Strava activities.csv — expected "Activity Date" and "Activity Type" columns.',
      ],
    };
  }

  const activities: Activity[] = [];
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const type = (row[col.type] ?? "").trim().toLowerCase();
    if (!RIDE_TYPES.includes(type)) {
      skipped++;
      continue;
    }

    const date = parseStravaDate(row[col.date] ?? "");
    const durationSec =
      parseNumber(row[col.movingTime]) ?? parseNumber(row[col.elapsedTime]);
    if (!date || !durationSec || durationSec < 600) {
      skipped++;
      continue;
    }

    let distanceKm = parseNumber(col.distance >= 0 ? row[col.distance] : undefined);
    // Some exports report metres in the second Distance column.
    if (distanceKm !== undefined && distanceKm > 1500) distanceKm = distanceKm / 1000;

    activities.push({
      id: `strava-${row[col.id] ?? i}`,
      date,
      name: (col.name >= 0 && row[col.name]?.trim()) || "Ride",
      durationSec: Math.round(durationSec),
      distanceKm: distanceKm !== undefined ? Math.round(distanceKm * 10) / 10 : undefined,
      avgPower: parseNumber(col.avgPower >= 0 ? row[col.avgPower] : undefined),
      normalizedPower: parseNumber(col.np >= 0 ? row[col.np] : undefined),
      avgHr: parseNumber(col.avgHr >= 0 ? row[col.avgHr] : undefined),
      elevationM: parseNumber(col.elevation >= 0 ? row[col.elevation] : undefined),
      source: "strava",
    });
  }

  if (activities.length === 0) {
    errors.push("No rides found in the file. RideZones reads cycling activities only.");
  }

  return { activities, skipped, errors };
}

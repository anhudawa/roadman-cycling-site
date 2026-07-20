/**
 * TrainingPeaks bulk-export parser.
 *
 * Reads the workouts CSV that TrainingPeaks produces (Account Settings →
 * Export Data, or a date-range workout export). Column names have varied
 * across export vintages ("TimeTotalInHours" vs "TotalTimeInHours",
 * "PowerAverage" vs "AveragePower"), so columns are matched against a list
 * of known aliases. Only completed bike workouts become activities.
 */

import { parseCsv } from "./strava";
import type { Activity } from "./types";

export interface TrainingPeaksParseResult {
  activities: Activity[];
  /** Rows skipped because they weren't rides or couldn't be parsed. */
  skipped: number;
  errors: string[];
}

const BIKE_TYPES = ["bike", "cycling", "ride", "mtb", "mountain bike", "gravel", "cyclocross"];

function findColumn(headers: string[], ...candidates: string[]): number {
  const lowered = headers.map((h) => h.trim().toLowerCase());
  for (const candidate of candidates) {
    const idx = lowered.indexOf(candidate);
    if (idx !== -1) return idx;
  }
  return -1;
}

function num(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value.replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** TP dates come as yyyy-mm-dd, mm/dd/yyyy, or dd/mm/yyyy — disambiguated where possible. */
export function parseTpDate(value: string): string | null {
  const trimmed = value.trim();
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slash) {
    const year = slash[3];
    let month = Number(slash[1]);
    let day = Number(slash[2]);
    // A first component over 12 can only be a day (dd/mm/yyyy exports).
    if (month > 12 && day <= 12) {
      [month, day] = [day, month];
    }
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  return null;
}

export function parseTrainingPeaksCsv(csvText: string): TrainingPeaksParseResult {
  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    return { activities: [], skipped: 0, errors: ["File is empty or not a CSV."] };
  }

  const headers = rows[0];
  const col = {
    date: findColumn(headers, "workoutday", "workout day", "date"),
    type: findColumn(headers, "workouttype", "workout type", "sport"),
    title: findColumn(headers, "title", "workout title", "name"),
    hours: findColumn(
      headers,
      "timetotalinhours",
      "totaltimeinhours",
      "time total in hours",
      "duration"
    ),
    distanceM: findColumn(headers, "distanceinmeters", "distance in meters", "distance"),
    avgPower: findColumn(headers, "poweraverage", "averagepower", "power average", "avg power"),
    np: findColumn(headers, "normalizedpower", "normalized power", "np"),
    avgHr: findColumn(
      headers,
      "heartrateaverage",
      "averageheartrate",
      "heart rate average",
      "avg hr"
    ),
    elevM: findColumn(headers, "elevationgaininmeters", "elevationgain", "elevation gain"),
  };

  if (col.date === -1 || col.type === -1) {
    return {
      activities: [],
      skipped: 0,
      errors: [
        'This doesn\'t look like a TrainingPeaks workout export — expected "WorkoutDay" and "WorkoutType" columns.',
      ],
    };
  }

  const activities: Activity[] = [];
  let skipped = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const type = (row[col.type] ?? "").trim().toLowerCase();
    if (!BIKE_TYPES.some((t) => type === t || type.includes("bike"))) {
      skipped++;
      continue;
    }

    const date = parseTpDate(row[col.date] ?? "");
    const hours = num(col.hours >= 0 ? row[col.hours] : undefined);
    // Planned-but-not-ridden workouts export with an empty completed time.
    if (!date || !hours || hours < 0.17) {
      skipped++;
      continue;
    }

    const distanceM = num(col.distanceM >= 0 ? row[col.distanceM] : undefined);

    activities.push({
      id: `tp-${date}-${i}`,
      date,
      name: (col.title >= 0 && row[col.title]?.trim()) || "Bike workout",
      durationSec: Math.round(hours * 3600),
      distanceKm: distanceM !== undefined ? Math.round(distanceM / 100) / 10 : undefined,
      avgPower: num(col.avgPower >= 0 ? row[col.avgPower] : undefined),
      normalizedPower: num(col.np >= 0 ? row[col.np] : undefined),
      avgHr: num(col.avgHr >= 0 ? row[col.avgHr] : undefined),
      elevationM: num(col.elevM >= 0 ? row[col.elevM] : undefined),
      source: "trainingpeaks",
    });
  }

  const errors: string[] = [];
  if (activities.length === 0) {
    errors.push("No completed bike workouts found in the file.");
  }

  return { activities, skipped, errors };
}

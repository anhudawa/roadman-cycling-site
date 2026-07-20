/**
 * Deterministic demo history so the app is fully explorable before a rider
 * imports anything.
 *
 * The synthetic rider tells a story the engine can diagnose: a strong,
 * well-structured block 12–18 weeks ago (their "best block"), a race, then
 * a slow slide into fewer hours, shrinking long rides, and grey-zone creep
 * — the classic self-coached drift.
 */

import type { Activity } from "./types";
import { isoDate, shiftDate, utcDate } from "./load";

export const DEMO_SETTINGS = {
  ftp: 265,
  lthr: 168,
  weightKg: 78,
  weeklyHours: 8,
  goal: "gran-fondo" as const,
};

/** Small deterministic PRNG (mulberry32) so demo data never shifts under the user. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type RideKind =
  | "z2"
  | "long"
  | "grey"
  | "threshold"
  | "sweetspot"
  | "vo2"
  | "recovery"
  | "tempo";

interface RideSpec {
  /** Offset from Monday of the week, 0–6. */
  dow: number;
  kind: RideKind;
  hours: number;
}

/** kind → rough zone-time distribution (shares of moving time across Z1–Z7). */
const ZONE_MIX: Record<RideKind, number[]> = {
  z2: [0.14, 0.78, 0.06, 0.02, 0, 0, 0],
  long: [0.12, 0.74, 0.1, 0.03, 0.01, 0, 0],
  grey: [0.08, 0.42, 0.38, 0.1, 0.02, 0, 0],
  threshold: [0.25, 0.3, 0.1, 0.28, 0.05, 0.02, 0],
  sweetspot: [0.2, 0.3, 0.22, 0.25, 0.02, 0.01, 0],
  vo2: [0.3, 0.32, 0.08, 0.08, 0.16, 0.05, 0.01],
  recovery: [0.85, 0.15, 0, 0, 0, 0, 0],
  tempo: [0.15, 0.35, 0.42, 0.07, 0.01, 0, 0],
};

/** kind → typical intensity factor band. */
const IF_BAND: Record<RideKind, [number, number]> = {
  z2: [0.63, 0.71],
  long: [0.62, 0.7],
  grey: [0.78, 0.83],
  threshold: [0.85, 0.92],
  sweetspot: [0.83, 0.88],
  vo2: [0.88, 0.97],
  recovery: [0.45, 0.53],
  tempo: [0.76, 0.82],
};

const NAMES: Record<RideKind, string[]> = {
  z2: ["Zone 2 — capped and boring", "Steady aerobic ride", "Easy miles", "Base ride"],
  long: ["Sunday long ride", "Long steady ride", "Big loop"],
  grey: ["Lunch loop", "Quick blast", "Chaingang-ish", "Felt good, pushed on"],
  threshold: ["2×20 threshold", "4×8s", "Threshold intervals"],
  sweetspot: ["Sweet spot 2×20", "SS intervals"],
  vo2: ["5×3 VO2", "Short and sharp"],
  recovery: ["Recovery spin", "Coffee spin"],
  tempo: ["Tempo blocks", "Controlled tempo"],
};

/** Weekly patterns per phase. */
const BEST_BLOCK_WEEK: RideSpec[] = [
  { dow: 1, kind: "threshold", hours: 1.5 },
  { dow: 2, kind: "z2", hours: 1.5 },
  { dow: 3, kind: "sweetspot", hours: 1.5 },
  { dow: 4, kind: "recovery", hours: 0.75 },
  { dow: 5, kind: "long", hours: 3.6 },
  { dow: 6, kind: "z2", hours: 1.6 },
];

const RACE_TAPER_WEEK: RideSpec[] = [
  { dow: 1, kind: "threshold", hours: 1.2 },
  { dow: 3, kind: "z2", hours: 1.2 },
  { dow: 4, kind: "recovery", hours: 0.7 },
  { dow: 5, kind: "vo2", hours: 1.1 },
];

const DRIFT_WEEK_A: RideSpec[] = [
  { dow: 1, kind: "grey", hours: 1.3 },
  { dow: 3, kind: "grey", hours: 1.2 },
  { dow: 5, kind: "long", hours: 2.4 },
  { dow: 6, kind: "z2", hours: 1.3 },
];

const DRIFT_WEEK_B: RideSpec[] = [
  { dow: 1, kind: "threshold", hours: 1.4 },
  { dow: 2, kind: "grey", hours: 1.1 },
  { dow: 5, kind: "grey", hours: 2.1 },
  { dow: 6, kind: "recovery", hours: 0.8 },
];

const DRIFT_WEEK_LIGHT: RideSpec[] = [
  { dow: 2, kind: "grey", hours: 1.2 },
  { dow: 5, kind: "z2", hours: 1.8 },
];

/**
 * 18 weeks of history ending on `endDate` (exclusive of days after it).
 * Weeks 1–6: the best block. Week 7: taper + race. Weeks 8–18: the drift.
 */
export function generateDemoHistory(endDate: string): Activity[] {
  const rand = mulberry32(20260720);
  const activities: Activity[] = [];
  const totalWeeks = 18;

  // Monday of the week containing endDate, then back to the start.
  const end = utcDate(endDate);
  const endDow = (end.getUTCDay() + 6) % 7;
  const lastMonday = shiftDate(endDate, -endDow);
  const firstMonday = shiftDate(lastMonday, -(totalWeeks - 1) * 7);

  for (let week = 0; week < totalWeeks; week++) {
    const monday = shiftDate(firstMonday, week * 7);
    let specs: RideSpec[];
    if (week < 6) specs = BEST_BLOCK_WEEK;
    else if (week === 6) specs = RACE_TAPER_WEEK;
    else if (week === 7) specs = DRIFT_WEEK_LIGHT;
    else specs = [DRIFT_WEEK_A, DRIFT_WEEK_B, DRIFT_WEEK_A, DRIFT_WEEK_LIGHT][week % 4];

    for (const spec of specs) {
      const date = shiftDate(monday, spec.dow);
      if (date > endDate) continue;

      const jitter = 0.9 + rand() * 0.2;
      const durationSec = Math.round(spec.hours * jitter * 3600);
      const [ifLow, ifHigh] = IF_BAND[spec.kind];
      const intensityFactor = ifLow + rand() * (ifHigh - ifLow);
      const np = Math.round(DEMO_SETTINGS.ftp * intensityFactor);
      const avgPower = Math.round(np / (1.03 + rand() * 0.06));
      const mix = ZONE_MIX[spec.kind];
      const zoneTimesSec = mix.map((share) => Math.round(share * durationSec));
      const names = NAMES[spec.kind];

      activities.push({
        id: `demo-${date}-${spec.kind}`,
        date,
        name: names[Math.floor(rand() * names.length)],
        durationSec,
        distanceKm: Math.round(spec.hours * jitter * (26 + rand() * 6) * 10) / 10,
        avgPower,
        normalizedPower: np,
        avgHr: Math.round(DEMO_SETTINGS.lthr * (0.82 + intensityFactor * 0.18)),
        elevationM: Math.round(spec.hours * (150 + rand() * 250)),
        zoneTimesSec,
        source: "demo",
      });
    }

    // Week 7 Sunday: the race itself.
    if (week === 6) {
      const raceDate = shiftDate(monday, 6);
      if (raceDate <= endDate) {
        const durationSec = Math.round(4.4 * 3600);
        activities.push({
          id: `demo-${raceDate}-race`,
          date: raceDate,
          name: "Gran fondo — the good day",
          durationSec,
          distanceKm: 128,
          avgPower: 205,
          normalizedPower: 224,
          avgHr: 158,
          elevationM: 2350,
          zoneTimesSec: [0.1, 0.4, 0.28, 0.16, 0.05, 0.01, 0].map((s) =>
            Math.round(s * durationSec)
          ),
          source: "demo",
        });
      }
    }
  }

  return activities.sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function demoEndDate(today: Date): string {
  return isoDate(today);
}

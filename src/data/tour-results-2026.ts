/**
 * Tour de France 2026 — race results.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  HOW TO UPDATE                                                  ║
 * ║                                                                 ║
 * ║  After each stage finishes:                                     ║
 * ║   1. Update `lastUpdatedAfterStage` to the stage number.        ║
 * ║   2. Replace the `gcStandings` array with the current top 10.   ║
 * ║   3. Replace `latestStageResult` with the stage winner and      ║
 * ║      top three.                                                 ║
 * ║   4. Push / deploy. ISR (15 min) picks it up automatically.     ║
 * ║                                                                 ║
 * ║  Times: use total seconds behind the leader for `gapSeconds`.   ║
 * ║         The leader's gap is always 0.                           ║
 * ║  Stage result: `gapSeconds` is gap to stage winner (0 for       ║
 * ║         winner, seconds behind for 2nd/3rd).                    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Source your data from letour.fr, ProCyclingStats, or FirstCycling.
 * British English throughout. Rider names: first name + surname.
 */

// ──────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────

export interface GCRider {
  /** Position in the general classification (1 = yellow jersey). */
  position: number;
  /** Full rider name, e.g. "Tadej Pogačar". */
  name: string;
  /** UCI team short name, e.g. "UAE Team Emirates". */
  team: string;
  /** Three-letter country code, e.g. "SLO". */
  country: string;
  /** Total time gap to the leader in seconds. Leader = 0. */
  gapSeconds: number;
}

export interface StageFinisher {
  /** Finishing position (1 = stage winner). */
  position: number;
  name: string;
  team: string;
  country: string;
  /** Time gap to the stage winner in seconds. Winner = 0. */
  gapSeconds: number;
}

export interface StageResult {
  /** Which stage this result is for (1–21). */
  stageNumber: number;
  /** Top three finishers. */
  topThree: [StageFinisher, StageFinisher, StageFinisher];
}

// ──────────────────────────────────────────────────────────────────
// Data — update after each stage
// ──────────────────────────────────────────────────────────────────

/**
 * Which stage this data reflects. Set to 0 before the race starts
 * (the component will show placeholders). During the race, bump
 * this to the latest completed stage number.
 */
export const lastUpdatedAfterStage = 13;

/**
 * General classification — top 10 after the latest completed stage.
 *
 * IMPORTANT: Keep exactly 10 entries, positions 1–10, with the
 * leader's gapSeconds = 0. All other gaps are total seconds behind
 * the leader.
 */
export const gcStandings: GCRider[] = [
  { position: 1,  name: "Tadej Pogačar",       team: "UAE Team Emirates–XRG",        country: "SLO", gapSeconds: 0 },
  { position: 2,  name: "Jonas Vingegaard",     team: "Visma–Lease a Bike",          country: "DEN", gapSeconds: 216 },
  { position: 3,  name: "Remco Evenepoel",      team: "Red Bull–Bora–Hansgrohe",     country: "BEL", gapSeconds: 246 },
  { position: 4,  name: "Tom Pidcock",          team: "Pinarello–Q36.5",             country: "GBR", gapSeconds: 255 },
  { position: 5,  name: "Juan Ayuso",           team: "Lidl–Trek",                   country: "ESP", gapSeconds: 262 },
  { position: 6,  name: "Paul Seixas",          team: "Decathlon–AG2R La Mondiale",  country: "FRA", gapSeconds: 276 },
  { position: 7,  name: "Florian Lipowitz",     team: "Red Bull–Bora–Hansgrohe",     country: "GER", gapSeconds: 284 },
  { position: 8,  name: "Isaac del Toro",       team: "UAE Team Emirates–XRG",        country: "MEX", gapSeconds: 308 },
  { position: 9,  name: "Mattias Skjelmose",    team: "Lidl–Trek",                   country: "DEN", gapSeconds: 345 },
  { position: 10, name: "Lenny Martinez",       team: "Bahrain Victorious",          country: "FRA", gapSeconds: 394 },
];

/**
 * Latest stage result — top three finishers of the most recent stage.
 * Set to `null` before the race starts.
 */
export const latestStageResult: StageResult | null = {
  stageNumber: 13,
  topThree: [
    { position: 1, name: "Mauro Schmid",        team: "Jayco–AlUla",              country: "SUI", gapSeconds: 0 },
    { position: 2, name: "Harold Tejada",        team: "XDS Astana",               country: "COL", gapSeconds: 0 },
    { position: 3, name: "Tom Pidcock",          team: "Pinarello–Q36.5",          country: "GBR", gapSeconds: 0 },
  ],
};

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

/** Format a gap in seconds as "+0:43" or "Leader" for 0. */
export function formatGap(seconds: number): string {
  if (seconds === 0) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `+${secs}s`;
  return `+${mins}′${secs.toString().padStart(2, "0")}″`;
}

/** Whether we have any results data to show. */
export function hasResults(): boolean {
  return lastUpdatedAfterStage > 0 && gcStandings.length > 0;
}

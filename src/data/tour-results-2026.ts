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

export interface TourClassificationWinner {
  classification: string;
  winner: string;
  team: string;
}

export interface TourFinalResult {
  winner: string;
  winnerTeam: string;
  winningTime: string;
  winningMargin: string;
  titleCount: number;
  officialDistanceKm: number;
  podium: [GCRider, GCRider, GCRider];
  classificationWinners: TourClassificationWinner[];
  finalStage: {
    winner: string;
    team: string;
    runnerUp: string;
    third: string;
    summary: string;
  };
  sources: Array<{ label: string; href: string }>;
  lastReviewed: string;
}

// ──────────────────────────────────────────────────────────────────
// Data — update after each stage
// ──────────────────────────────────────────────────────────────────

/**
 * Which stage this data reflects. Set to 0 before the race starts
 * (the component will show placeholders). During the race, bump
 * this to the latest completed stage number.
 */
export const lastUpdatedAfterStage = 21;

/**
 * General classification — top 10 after the latest completed stage.
 *
 * IMPORTANT: Keep exactly 10 entries, positions 1–10, with the
 * leader's gapSeconds = 0. All other gaps are total seconds behind
 * the leader.
 */
export const gcStandings: GCRider[] = [
  {
    position: 1,
    name: "Tadej Pogačar",
    team: "UAE Team Emirates–XRG",
    country: "SLO",
    gapSeconds: 0,
  },
  {
    position: 2,
    name: "Remco Evenepoel",
    team: "Red Bull–Bora–Hansgrohe",
    country: "BEL",
    gapSeconds: 386,
  },
  {
    position: 3,
    name: "Isaac del Toro",
    team: "UAE Team Emirates–XRG",
    country: "MEX",
    gapSeconds: 582,
  },
  {
    position: 4,
    name: "Paul Seixas",
    team: "Decathlon CMA CGM",
    country: "FRA",
    gapSeconds: 716,
  },
  {
    position: 5,
    name: "Lenny Martinez",
    team: "Bahrain Victorious",
    country: "FRA",
    gapSeconds: 782,
  },
  {
    position: 6,
    name: "Mattias Skjelmose",
    team: "Lidl–Trek",
    country: "DEN",
    gapSeconds: 899,
  },
  {
    position: 7,
    name: "Juan Ayuso",
    team: "Lidl–Trek",
    country: "ESP",
    gapSeconds: 1068,
  },
  {
    position: 8,
    name: "Richard Carapaz",
    team: "EF Education–EasyPost",
    country: "ECU",
    gapSeconds: 1200,
  },
  {
    position: 9,
    name: "Tom Pidcock",
    team: "Pinarello–Q36.5",
    country: "GBR",
    gapSeconds: 1768,
  },
  {
    position: 10,
    name: "Jordan Jegat",
    team: "TotalEnergies",
    country: "FRA",
    gapSeconds: 2001,
  },
];

/**
 * Latest stage result — top three finishers of the most recent stage.
 * Set to `null` before the race starts.
 */
export const latestStageResult: StageResult | null = {
  stageNumber: 21,
  topThree: [
    {
      position: 1,
      name: "Mathieu van der Poel",
      team: "Alpecin–Premier Tech",
      country: "NED",
      gapSeconds: 0,
    },
    {
      position: 2,
      name: "Jasper Philipsen",
      team: "Alpecin–Premier Tech",
      country: "BEL",
      gapSeconds: 0,
    },
    {
      position: 3,
      name: "Mads Pedersen",
      team: "Lidl–Trek",
      country: "DEN",
      gapSeconds: 0,
    },
  ],
};

/**
 * Final, source-reviewed race record for answer surfaces and the evergreen hub.
 * The official distance is the distance actually raced after the adapted finale,
 * rather than the 3,333 km published for the original route.
 */
export const tourFinalResult: TourFinalResult = {
  winner: "Tadej Pogačar",
  winnerTeam: "UAE Team Emirates–XRG",
  winningTime: "73:56:26",
  winningMargin: "6:26",
  titleCount: 5,
  officialDistanceKm: 3197,
  podium: [gcStandings[0]!, gcStandings[1]!, gcStandings[2]!],
  classificationWinners: [
    {
      classification: "Points · green jersey",
      winner: "Mads Pedersen",
      team: "Lidl–Trek",
    },
    {
      classification: "Mountains · polka-dot jersey",
      winner: "Richard Carapaz",
      team: "EF Education–EasyPost",
    },
    {
      classification: "Young rider · white jersey",
      winner: "Isaac del Toro",
      team: "UAE Team Emirates–XRG",
    },
    {
      classification: "Team classification",
      winner: "Lidl–Trek",
      team: "",
    },
    {
      classification: "Super-combativity",
      winner: "Richard Carapaz",
      team: "EF Education–EasyPost",
    },
  ],
  finalStage: {
    winner: "Mathieu van der Poel",
    team: "Alpecin–Premier Tech",
    runnerUp: "Jasper Philipsen",
    third: "Mads Pedersen",
    summary:
      "Mathieu van der Poel followed Pogačar over the final Montmartre ascent, then accelerated inside the last 600 metres to hold off Jasper Philipsen and Mads Pedersen in Paris.",
  },
  sources: [
    {
      label: "Official Tour de France final classification",
      href: "https://www.letour.fr/en/rankings/stage-21?hasCookies=false&hideOnetrust=true&isWebview=true",
    },
    {
      label: "Official Stage 21 race report and classification winners",
      href: "https://www.letour.fr/en/news/2026/van-der-poel-and-pogacar-illuminate-paris/1356643",
    },
    {
      label: "Official 2026 classification recap",
      href: "https://www.letour.fr/en/news/2026/panache-in-all-shapes-and-colours/1356659",
    },
  ],
  lastReviewed: "2026-08-26",
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

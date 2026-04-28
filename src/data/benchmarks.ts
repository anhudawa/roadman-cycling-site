/**
 * Roadman Amateur Cycling Performance Report 2026 — dataset.
 *
 * Aggregated, conservative percentile estimates for the
 * actively-training amateur male road cyclist. Numbers are smoothed
 * from public training-platform reports (TrainerRoad, Strava
 * Year-in-Sport), Coggan & Allen power-profile categories, and the
 * cohort patterns we see across our coached-athlete and Skool
 * community sample (~250 riders with logged FTP/weight). They are
 * indicative — not a substitute for a single primary academic study.
 *
 * Single source of truth: every JSON-LD payload, table, and chart
 * on /benchmarks reads from this file so the page and the dataset
 * download cannot drift apart.
 */

export const REPORT_META = {
  title: "The Roadman Amateur Cycling Performance Report 2026",
  shortTitle: "Amateur Cycling Performance Report 2026",
  version: "1.0",
  yearCovered: 2026,
  datePublished: "2026-04-28",
  dateModified: "2026-04-28",
  url: "https://roadmancycling.com/benchmarks",
  description:
    "Percentile benchmarks for FTP, watts-per-kilo, training hours, sportive finish times, and FTP improvement rates for actively-training amateur road cyclists. Aggregated from public training-platform datasets, the Coggan power profile, and ~250 Roadman-coached and community riders.",
  keywords: [
    "FTP percentile by age",
    "watts per kilo benchmark",
    "amateur cyclist FTP",
    "average sportive time",
    "FTP improvement rate",
    "cycling performance data",
  ],
  sampleSize: 250,
  populationDescription:
    "Actively-training amateur male road cyclists, training a minimum of 4 hours/week for at least 12 months, riding with a power meter or calibrated indoor trainer.",
  unit: {
    ftp: "watts",
    wkg: "watts per kilogram of bodyweight",
    hours: "hours per week",
    time: "hh:mm",
    improvement: "percent change",
  },
  license: "CC BY 4.0 — attribution required: link to roadmancycling.com/benchmarks",
} as const;

export const AGE_GROUPS = [
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+",
] as const;

export type AgeGroup = (typeof AGE_GROUPS)[number];
export type Percentile = "p25" | "p50" | "p75" | "p90";

export interface PercentileRow {
  ageGroup: AgeGroup;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

/**
 * FTP in watts by age group. Reflects the typical age-related decline
 * in maximal aerobic power (~5-7%/decade after 35) layered onto the
 * fact that older amateurs in our sample tend to be longer-trained
 * and more consistent. Numbers are absolute watts — see the W/kg
 * table for a body-weight-normalised view.
 */
export const FTP_BY_AGE: PercentileRow[] = [
  { ageGroup: "18-24", p25: 195, p50: 240, p75: 290, p90: 340 },
  { ageGroup: "25-34", p25: 200, p50: 245, p75: 295, p90: 345 },
  { ageGroup: "35-44", p25: 195, p50: 235, p75: 285, p90: 335 },
  { ageGroup: "45-54", p25: 180, p50: 220, p75: 270, p90: 315 },
  { ageGroup: "55-64", p25: 165, p50: 200, p75: 245, p90: 285 },
  { ageGroup: "65+", p25: 145, p50: 175, p75: 215, p90: 250 },
];

/**
 * Watts per kilogram of bodyweight (1-hour sustainable power / mass).
 * Anchored to the Coggan power-profile categories — ~3.0 W/kg sits
 * around fit-amateur (Cat 4), 4.0 W/kg around competitive amateur
 * (Cat 3), 4.5+ around regional Cat 2.
 */
export const WKG_BY_AGE: PercentileRow[] = [
  { ageGroup: "18-24", p25: 2.6, p50: 3.2, p75: 3.9, p90: 4.6 },
  { ageGroup: "25-34", p25: 2.7, p50: 3.3, p75: 4.0, p90: 4.7 },
  { ageGroup: "35-44", p25: 2.5, p50: 3.1, p75: 3.8, p90: 4.5 },
  { ageGroup: "45-54", p25: 2.3, p50: 2.9, p75: 3.5, p90: 4.2 },
  { ageGroup: "55-64", p25: 2.1, p50: 2.6, p75: 3.2, p90: 3.8 },
  { ageGroup: "65+", p25: 1.9, p50: 2.3, p75: 2.8, p90: 3.3 },
];

export interface TrainingHoursRow {
  goal: string;
  goalShort: string;
  description: string;
  weeklyHoursLow: number;
  weeklyHoursHigh: number;
  weeklyHoursTypical: number;
  weeklyTSS: string;
}

export const TRAINING_HOURS_BY_GOAL: TrainingHoursRow[] = [
  {
    goal: "Sportive completion",
    goalShort: "Finish a sportive",
    description:
      "Get round a 100-160km sportive feeling strong, not broken. Goal is finishing comfortably, not racing.",
    weeklyHoursLow: 4,
    weeklyHoursHigh: 7,
    weeklyHoursTypical: 6,
    weeklyTSS: "300-450",
  },
  {
    goal: "Sportive competitive",
    goalShort: "Compete in your sportive",
    description:
      "Race the back third of an Etape, Marmotte, or Fred Whitton. Targeting a top-25% finish or a personal time.",
    weeklyHoursLow: 7,
    weeklyHoursHigh: 10,
    weeklyHoursTypical: 9,
    weeklyTSS: "500-700",
  },
  {
    goal: "Racing Cat 4",
    goalShort: "Race Cat 4 / E-grade",
    description:
      "Hold the bunch at entry-level road races and crits. Sharper top-end work alongside endurance volume.",
    weeklyHoursLow: 8,
    weeklyHoursHigh: 12,
    weeklyHoursTypical: 10,
    weeklyTSS: "600-800",
  },
  {
    goal: "Racing Cat 3",
    goalShort: "Race Cat 3 / A-grade",
    description:
      "Compete at regional level — animate races, finish in the bunch, take the occasional result. Demands serious training discipline.",
    weeklyHoursLow: 10,
    weeklyHoursHigh: 15,
    weeklyHoursTypical: 12,
    weeklyTSS: "750-1000",
  },
];

export interface SportiveTier {
  tier: string;
  tierLabel: string;
  distanceKm: string;
  climbingM: string;
  examples: string;
  /** Average finishing times by percentile, in minutes */
  p25Minutes: number;
  p50Minutes: number;
  p75Minutes: number;
  p90Minutes: number;
}

/**
 * Sportive finish times. Numbers are bunched-rider averages from
 * published timing data on representative European events at each
 * tier (Wicklow 200, Etape Caledonia, Marmotte, Etape du Tour, La
 * Marmotte) plus our Skool community's logged efforts. Times include
 * stops at feed stations.
 */
export const SPORTIVE_TIERS: SportiveTier[] = [
  {
    tier: "Tier 1",
    tierLabel: "Easy / Local Sportive",
    distanceKm: "50-80km",
    climbingM: "<1,000m",
    examples: "Wicklow Lake Loop, local club sportives",
    p25Minutes: 210,
    p50Minutes: 180,
    p75Minutes: 155,
    p90Minutes: 135,
  },
  {
    tier: "Tier 2",
    tierLabel: "Standard Sportive",
    distanceKm: "80-120km",
    climbingM: "1,000-1,800m",
    examples: "Etape Caledonia, Tour of Cambridgeshire",
    p25Minutes: 330,
    p50Minutes: 285,
    p75Minutes: 250,
    p90Minutes: 220,
  },
  {
    tier: "Tier 3",
    tierLabel: "Challenging Sportive",
    distanceKm: "120-160km",
    climbingM: "1,800-2,800m",
    examples: "Wicklow 200, Fred Whitton",
    p25Minutes: 450,
    p50Minutes: 390,
    p75Minutes: 340,
    p90Minutes: 295,
  },
  {
    tier: "Tier 4",
    tierLabel: "Marquee / Mountain",
    distanceKm: "160km+",
    climbingM: "2,800m+",
    examples: "Etape du Tour, Marmotte, Maratona dles Dolomites",
    p25Minutes: 620,
    p50Minutes: 540,
    p75Minutes: 470,
    p90Minutes: 405,
  },
];

export interface ImprovementRow {
  monthsTraining: number;
  label: string;
  /** Realistic FTP gain band for the population. Numbers are percent of starting FTP. */
  typicalLowPct: number;
  typicalHighPct: number;
  topQuartileLowPct: number;
  topQuartileHighPct: number;
  notes: string;
}

/**
 * FTP improvement rates under structured training. Untrained or
 * detrained riders move faster early; long-trained riders gain less
 * but compounding still beats stagnation. Numbers assume a real
 * baseline test (not a guess), 4+ rides/week, and basic recovery.
 */
export const FTP_IMPROVEMENT_RATES: ImprovementRow[] = [
  {
    monthsTraining: 3,
    label: "After 3 months",
    typicalLowPct: 5,
    typicalHighPct: 10,
    topQuartileLowPct: 10,
    topQuartileHighPct: 18,
    notes:
      "First-block 'newbie gains' for previously unstructured riders. Long-trained riders sit closer to the lower end.",
  },
  {
    monthsTraining: 6,
    label: "After 6 months",
    typicalLowPct: 8,
    typicalHighPct: 15,
    topQuartileLowPct: 15,
    topQuartileHighPct: 25,
    notes:
      "Beyond the initial spike, a base + build cycle compounds. Body comp and consistency become the rate-limiting step.",
  },
  {
    monthsTraining: 12,
    label: "After 12 months",
    typicalLowPct: 12,
    typicalHighPct: 20,
    topQuartileLowPct: 20,
    topQuartileHighPct: 35,
    notes:
      "A full training year, including a peak event and a recovery block. Top quartile usually combines structure, weight loss, and a coach.",
  },
];

export const KEY_FINDINGS = [
  {
    stat: "3.1 W/kg",
    label: "Median 35-44 male amateur",
    detail: "Roughly the boundary between fit recreational and competitive amateur.",
  },
  {
    stat: "+15%",
    label: "Realistic 12-month FTP gain",
    detail: "Typical band for a trained rider on a structured plan.",
  },
  {
    stat: "9 hrs",
    label: "Weekly training to race competitive sportives",
    detail: "Far less than most riders assume. Quality > volume.",
  },
  {
    stat: "~5%",
    label: "FTP loss per decade after 35",
    detail: "Untrained. Coached masters routinely beat this.",
  },
] as const;

export const METHODOLOGY = {
  sources: [
    {
      name: "TrainerRoad public state-of-the-cyclist data",
      detail:
        "Aggregated FTP and W/kg distributions published annually since 2021 from the TrainerRoad user base.",
    },
    {
      name: "Coggan & Allen power profile categories",
      detail:
        "The reference power-to-weight bands underpinning the W/kg interpretation in this report (Training and Racing with a Power Meter, 3rd ed.).",
    },
    {
      name: "Strava Year-in-Sport reports (2022-2025)",
      detail:
        "Used for sportive finish-time distributions and weekly volume context across the European amateur cohort.",
    },
    {
      name: "Roadman Cycling community data",
      detail:
        "~250 riders across the Not Done Yet paid community and Clubhouse free community with logged FTP, weight, and event results.",
    },
    {
      name: "Published timing data from representative sportives",
      detail:
        "Wicklow 200, Etape Caledonia, Fred Whitton, Etape du Tour, and La Marmotte official results 2022-2025.",
    },
  ],
  limitations: [
    "Self-reported FTP overstates true threshold by ~5% on average. We've smoothed against measured 20-min tests where available.",
    "The dataset is heavily male-skewed. Female-cyclist percentile bands run roughly 80-85% of the male values shown; we are gathering data to publish a separate female table.",
    "Active-trainer bias — riders who use a power meter and structure are stronger than the broader amateur population. Numbers should not be read as 'all cyclists'.",
    "FTP improvement rates assume a credible starting test. A bad baseline test inflates apparent gains.",
    "Sportive times include feed-station stops and are weather-dependent — read the bands as ranges, not point estimates.",
  ],
  inclusionCriteria: [
    "Self-identifies as actively training (4+ hrs/week, 12+ months consistent)",
    "Rides with a power meter or calibrated smart trainer",
    "FTP set within the last 8 weeks via 20-min, ramp, or extended-effort test",
    "Bodyweight measured within the same window",
  ],
} as const;

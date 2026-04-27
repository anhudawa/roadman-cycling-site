import type { WrappedData } from "@/lib/season-wrapped/types";

/**
 * Realistic demo data for the Season Wrapped preview state.
 * Numbers tuned to the "serious amateur ~10 hr/week" archetype that
 * Roadman targets — not a pro, not a weekend warrior.
 */
export const demoWrapped: WrappedData = {
  year: 2026,
  rider: { firstName: "Anthony", weightKg: 75 },
  totals: {
    distanceM: 11_842_000, // 11,842 km — about Marmotte distance ten times over
    elevationM: 142_300, // 16x Everest
    timeS: 412 * 3600, // 412 hours
    rides: 218,
  },
  longestRide: {
    date: "2026-06-21",
    distanceM: 312_000,
    elevationM: 4180,
    name: "Mallorca 312",
  },
  biggestClimbDay: {
    date: "2026-08-04",
    elevationM: 5240,
    name: "Marmotte day",
  },
  monthly: [
    { month: 1, distanceM: 612_000, elevationM: 6_400, timeS: 23 * 3600, rides: 14 },
    { month: 2, distanceM: 698_000, elevationM: 7_900, timeS: 26 * 3600, rides: 16 },
    { month: 3, distanceM: 812_000, elevationM: 9_700, timeS: 30 * 3600, rides: 18 },
    { month: 4, distanceM: 1_104_000, elevationM: 13_400, timeS: 39 * 3600, rides: 22 },
    { month: 5, distanceM: 1_212_000, elevationM: 14_600, timeS: 42 * 3600, rides: 23 },
    { month: 6, distanceM: 1_398_000, elevationM: 18_200, timeS: 48 * 3600, rides: 24 },
    { month: 7, distanceM: 1_318_000, elevationM: 16_900, timeS: 46 * 3600, rides: 22 },
    { month: 8, distanceM: 1_452_000, elevationM: 19_400, timeS: 51 * 3600, rides: 24 },
    { month: 9, distanceM: 1_124_000, elevationM: 14_100, timeS: 39 * 3600, rides: 20 },
    { month: 10, distanceM: 942_000, elevationM: 10_800, timeS: 33 * 3600, rides: 18 },
    { month: 11, distanceM: 668_000, elevationM: 6_900, timeS: 24 * 3600, rides: 12 },
    { month: 12, distanceM: 502_000, elevationM: 4_000, timeS: 19 * 3600, rides: 5 },
  ],
  ftp: {
    start: { date: "2026-01-01", watts: 268 },
    end: { date: "2026-12-15", watts: 296 },
    history: [
      { date: "2026-01-01", watts: 268 },
      { date: "2026-03-15", watts: 274 },
      { date: "2026-05-20", watts: 285 },
      { date: "2026-08-05", watts: 292 },
      { date: "2026-12-15", watts: 296 },
    ],
  },
  streak: {
    longestWeeksUnbroken: 38,
    daysRidden: 247,
    weeksRidden: 49,
  },
  personality: {
    archetype: "climber",
    oneLiner: "You're a climber.",
    body: "Forty-seven percent of your kilojoules went uphill. The watt-per-kilogram numbers don't lie — when the road tilts up, you go forward. The peloton calls this a 'grimpeur'. We just call it useful.",
    spiritRider: "Marco Pantani",
  },
  percentile: {
    distance: 86,
    elevation: 91,
    hours: 84,
  },
};

/** Lighter "casual rider" preset — used as the default before form fill. */
export const blankWrapped: WrappedData = {
  ...demoWrapped,
  rider: { firstName: "You" },
  totals: {
    distanceM: 5_400_000,
    elevationM: 48_000,
    timeS: 180 * 3600,
    rides: 96,
  },
  longestRide: { date: "2026-07-04", distanceM: 142_000, elevationM: 1_640 },
  biggestClimbDay: { date: "2026-06-12", elevationM: 2_340 },
  monthly: demoWrapped.monthly.map((m) => ({
    ...m,
    distanceM: Math.round(m.distanceM * 0.45),
    elevationM: Math.round(m.elevationM * 0.34),
    timeS: Math.round(m.timeS * 0.43),
    rides: Math.round(m.rides * 0.45),
  })),
  ftp: {
    start: { date: "2026-01-01", watts: 220 },
    end: { date: "2026-12-15", watts: 235 },
  },
  streak: { longestWeeksUnbroken: 12, daysRidden: 124, weeksRidden: 36 },
  percentile: { distance: 52, elevation: 47, hours: 55 },
  personality: {
    archetype: "all_rounder",
    oneLiner: "You're an all-rounder.",
    body: "No standout discipline — and that's the rare one. You hold steady on flat days, hold on through the climbs, finish what you start. The bike doesn't care that you're not a specialist.",
    spiritRider: "Mathieu van der Poel",
  },
};

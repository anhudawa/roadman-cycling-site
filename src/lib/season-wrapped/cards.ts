/**
 * Card system — defines the 8-card sequence and the copy generators
 * that turn raw WrappedData into the headline + supporting lines for
 * each card. Pure functions, no React. Deterministic.
 */

import type { WrappedData, RidingPersonality } from "./types";

export type CardId =
  | "year_total"
  | "climbing"
  | "biggest_month"
  | "long_one"
  | "power_story"
  | "personality"
  | "streak"
  | "not_done_yet";

export interface CardMeta {
  id: CardId;
  /** Eyebrow in coral. Always uppercase. */
  eyebrow: string;
  /** Sequence index 1..N for the progress dots. */
  step: number;
  /** Total in the sequence — for "1 / 8" display. */
  total: number;
}

export const CARD_SEQUENCE: CardId[] = [
  "year_total",
  "climbing",
  "biggest_month",
  "long_one",
  "power_story",
  "personality",
  "streak",
  "not_done_yet",
];

export function cardMeta(id: CardId): CardMeta {
  const step = CARD_SEQUENCE.indexOf(id) + 1;
  return {
    id,
    eyebrow: EYEBROWS[id],
    step,
    total: CARD_SEQUENCE.length,
  };
}

const EYEBROWS: Record<CardId, string> = {
  year_total: "Your year on the bike",
  climbing: "Climbing machine",
  biggest_month: "Your biggest month",
  long_one: "The long one",
  power_story: "Power story",
  personality: "Riding personality",
  streak: "Your streak",
  not_done_yet: "Not Done Yet",
};

/* ── Headline generators ─────────────────────────────────────────── */

const KM = (m: number) => Math.round(m / 1000);
const HOURS = (s: number) => Math.round(s / 3600);

/** Picks an evocative geographic comparison for total distance. */
export function distanceMetaphor(distanceM: number): string {
  const km = KM(distanceM);
  if (km < 500) return `That's a long weekend in the saddle.`;
  if (km < 1500) return `That's London to Paris and back, twice.`;
  if (km < 3500) return `That's London to Athens.`;
  if (km < 6000) return `That's London to Istanbul, with the long way home.`;
  if (km < 10000) return `That's a lap of the Mediterranean.`;
  if (km < 16000) return `That's the length of Africa, top to bottom.`;
  if (km < 25000) return `That's the Tour de France ridden five times over.`;
  if (km < 40075) return `That's most of the way around the planet.`;
  return `That's further than the equator. Around the planet, with kilometres to spare.`;
}

/** Picks a climbing comparison (Everest, etc.). */
export function climbingMetaphor(elevationM: number): {
  headline: string;
  detail: string;
} {
  const everest = 8848;
  const stelvio = 1808;
  const everests = elevationM / everest;
  if (elevationM < 5_000) {
    return {
      headline: `${Math.round(elevationM / stelvio * 10) / 10}× Stelvio`,
      detail: "The kind of year that builds legs. Next year is a mountain year.",
    };
  }
  if (everests < 1) {
    return {
      headline: `${Math.round(elevationM).toLocaleString()} m up`,
      detail: `That's most of an Everest in vertical.`,
    };
  }
  if (everests < 3) {
    return {
      headline: `${everests.toFixed(1)}× Everest`,
      detail: `You went up the height of Everest more than once. Without ropes, oxygen, or a sherpa.`,
    };
  }
  if (everests < 8) {
    return {
      headline: `${Math.floor(everests)}× Everest`,
      detail: `Eight thousand metres for breakfast — over and over.`,
    };
  }
  return {
    headline: `${Math.floor(everests)}× Everest`,
    detail: `If grimpeur was a job title, you've earned it.`,
  };
}

/** Returns the biggest-distance month and a short character line. */
export function biggestMonth(data: WrappedData): {
  monthIndex: number;
  monthName: string;
  distanceKm: number;
  elevationM: number;
  blurb: string;
} {
  const top = [...data.monthly].sort((a, b) => b.distanceM - a.distanceM)[0];
  const idx = top?.month ?? 1;
  const name = MONTH_NAMES[idx - 1];
  const km = KM(top?.distanceM ?? 0);
  const elev = top?.elevationM ?? 0;
  const ratio = elev / Math.max(1, km); // m/km
  let blurb: string;
  if (ratio > 18) blurb = "Mountain month. You went looking for vertical.";
  else if (ratio > 10) blurb = "Hilly month — the legs were earning it.";
  else blurb = "Volume month. The base that holds up the rest of the year.";
  return {
    monthIndex: idx,
    monthName: name,
    distanceKm: km,
    elevationM: elev,
    blurb,
  };
}

const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

export function longestRideHeadline(data: WrappedData): {
  headline: string;
  detail: string;
} {
  const km = KM(data.longestRide.distanceM);
  const elev = data.longestRide.elevationM;
  const name = data.longestRide.name;
  const headline = name ? name : `${km} km in one go`;
  const detail = name
    ? `${km} km · ${elev.toLocaleString()} m elevation · one of the days you'll tell stories about.`
    : `${km} km · ${elev.toLocaleString()} m elevation. One ride. One day.`;
  return { headline, detail };
}

export function powerStory(data: WrappedData): {
  delta: number;
  pct: number;
  startW: number;
  endW: number;
  headline: string;
  detail: string;
} {
  const startW = data.ftp.start.watts;
  const endW = data.ftp.end.watts;
  const delta = endW - startW;
  const pct = startW > 0 ? Math.round(((endW - startW) / startW) * 1000) / 10 : 0;
  let headline: string;
  let detail: string;
  if (delta >= 25) {
    headline = `+${delta} watts`;
    detail = `You added ${delta} watts of FTP — that's not luck, that's training that worked. A new floor under everything you do next year.`;
  } else if (delta >= 10) {
    headline = `+${delta} watts`;
    detail = `Honest gain. Most riders flatline year-on-year. You didn't.`;
  } else if (delta > 0) {
    headline = `+${delta} watts`;
    detail = `Modest on paper, real in the legs. The base is still building.`;
  } else if (delta === 0) {
    headline = `Steady at ${endW} W`;
    detail = `Holding FTP through a full season is harder than it sounds. Same engine, same year, no slip.`;
  } else {
    headline = `${delta} W`;
    detail = `A dip — usually a sign of a heavy block, an illness, or a deload. Next year's job: figure out why and rebuild.`;
  }
  return { delta, pct, startW, endW, headline, detail };
}

export function personalityHeadline(p: RidingPersonality): {
  headline: string;
  spiritEyebrow: string;
} {
  switch (p) {
    case "climber":
      return { headline: "Climber", spiritEyebrow: "Spirit rider · grimpeur" };
    case "sprinter":
      return { headline: "Sprinter", spiritEyebrow: "Spirit rider · puncheur" };
    case "diesel":
      return { headline: "Diesel", spiritEyebrow: "Spirit rider · rouleur" };
    case "all_rounder":
      return { headline: "All-rounder", spiritEyebrow: "Spirit rider · all-rounder" };
  }
}

export function streakHeadline(data: WrappedData): {
  headline: string;
  detail: string;
} {
  const weeks = data.streak.longestWeeksUnbroken;
  const days = data.streak.daysRidden;
  const headline = `${weeks} weeks unbroken`;
  let detail: string;
  if (weeks >= 30) {
    detail = `${days} days on the bike across the year. The kind of consistency that builds careers, not just seasons.`;
  } else if (weeks >= 15) {
    detail = `${days} days riding. Through weather, through work, through the temptation to skip.`;
  } else {
    detail = `${days} days riding. Real life happened — you still showed up.`;
  }
  return { headline, detail };
}

export function notDoneYetHeadline(data: WrappedData): {
  headline: string;
  detail: string;
  cta: string;
} {
  return {
    headline: "Not done yet.",
    detail: `Last year was the warm-up. ${data.year + 1} is where the work goes in. Plug into the system Anthony built — Vekta plans, weekly calls, the same coaches you hear on the podcast.`,
    cta: "Join Not Done Yet",
  };
}

/* ── Heuristic — derive a personality from raw stats ──────────────── */

/**
 * If the form doesn't supply a personality, infer it from the ratio of
 * climbing-per-km, time per ride, and total volume. Crude on purpose —
 * the rider can override.
 */
export function inferPersonality(data: WrappedData): RidingPersonality {
  const km = data.totals.distanceM / 1000;
  if (km <= 0) return "all_rounder";
  const mPerKm = data.totals.elevationM / km;
  const hoursPerRide = data.totals.timeS / 3600 / Math.max(1, data.totals.rides);
  if (mPerKm > 14) return "climber";
  if (hoursPerRide > 3.2 && mPerKm < 9) return "diesel";
  if (data.totals.rides > 200 && mPerKm < 8) return "sprinter";
  return "all_rounder";
}

/**
 * Build a personality profile from an archetype. Caller can supply this
 * directly on `WrappedData.personality`; the helper is here for the
 * server-side normalisation path.
 */
export function personalityProfile(archetype: RidingPersonality): {
  archetype: RidingPersonality;
  oneLiner: string;
  body: string;
  spiritRider: string;
} {
  switch (archetype) {
    case "climber":
      return {
        archetype,
        oneLiner: "You're a climber.",
        body: "When the road tilts up, you go forward. Your year had vertical baked into it — the watt-per-kilo guys don't get scared, they get to work.",
        spiritRider: "Marco Pantani",
      };
    case "sprinter":
      return {
        archetype,
        oneLiner: "You're a sprinter.",
        body: "Short, sharp, repeated. Your rides are dense — high-frequency, fast, with the kick at the end. The stage finishes are yours.",
        spiritRider: "Mark Cavendish",
      };
    case "diesel":
      return {
        archetype,
        oneLiner: "You're a diesel.",
        body: "Long days, steady power, the engine that doesn't blow up. A rouleur in any other century. Now: someone who shows up for hour five.",
        spiritRider: "Tony Martin",
      };
    case "all_rounder":
      return {
        archetype,
        oneLiner: "You're an all-rounder.",
        body: "No standout discipline — which is its own discipline. Climb, sprint, sit in, finish. The version of yourself you can rely on.",
        spiritRider: "Mathieu van der Poel",
      };
  }
}

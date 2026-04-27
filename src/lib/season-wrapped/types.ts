/**
 * Season Wrapped — type definitions for a rider's year in review.
 *
 * Inputs come from one of two sources:
 *   1. Manual stats entry (the form on /wrapped)
 *   2. (Future) Strava OAuth import — currently placeholder
 *
 * Everything below is plain JSON, deliberately serialisable so the same
 * shape can flow Strava → derived stats → server response → client
 * shareable card without re-shaping.
 */

export type RidingPersonality =
  | "climber"
  | "sprinter"
  | "diesel"
  | "all_rounder";

export interface PersonalityProfile {
  archetype: RidingPersonality;
  /** One-sentence character description for the card. */
  oneLiner: string;
  /** Two-or-three-line elaboration for the back of the card. */
  body: string;
  /** A famous (or famously persona-typical) rider for the headline gag. */
  spiritRider: string;
}

export interface MonthlyStat {
  /** 1-indexed month, January = 1. */
  month: number;
  /** Total distance in metres for the month. */
  distanceM: number;
  /** Total elevation gain in metres for the month. */
  elevationM: number;
  /** Total moving time in seconds for the month. */
  timeS: number;
  /** Number of rides logged for the month. */
  rides: number;
}

export interface FtpPoint {
  /** ISO YYYY-MM-DD. */
  date: string;
  /** FTP in watts at that point. */
  watts: number;
}

export interface Streak {
  /** Longest unbroken sequence of weeks with at least one ride. */
  longestWeeksUnbroken: number;
  /** Days in the year with a ride logged. */
  daysRidden: number;
  /** Total weeks ≥1 ride. */
  weeksRidden: number;
}

export interface PercentileRanking {
  /** 0–100. e.g. 87 means top 13% by distance. */
  distance: number;
  /** 0–100, by elevation. */
  elevation: number;
  /** 0–100, by hours on the bike. */
  hours: number;
}

export interface BiggestRide {
  /** ISO YYYY-MM-DD. */
  date: string;
  distanceM: number;
  elevationM: number;
  /** Optional human name (e.g. "Wicklow 200"). */
  name?: string;
}

export interface BiggestClimbDay {
  /** ISO YYYY-MM-DD. */
  date: string;
  elevationM: number;
  /** Optional human name. */
  name?: string;
}

export interface RiderInfo {
  /** Display first name for the cards. Optional — falls back to "You". */
  firstName?: string;
  /** Used for percentile context only — not displayed. */
  weightKg?: number;
}

/**
 * Authoritative season-summary shape. Cards consume this.
 *
 * `year` is the season year (e.g. 2026 — the just-finished season).
 * Distances are in metres throughout to avoid the imperial/metric coin
 * flip — the formatter decides what to render in each card.
 */
export interface WrappedData {
  year: number;
  rider: RiderInfo;
  totals: {
    distanceM: number;
    elevationM: number;
    timeS: number;
    rides: number;
  };
  longestRide: BiggestRide;
  biggestClimbDay: BiggestClimbDay;
  monthly: MonthlyStat[];
  ftp: {
    start: FtpPoint;
    end: FtpPoint;
    history?: FtpPoint[];
  };
  streak: Streak;
  personality: PersonalityProfile;
  percentile: PercentileRanking;
}

/** Submitted shape from the manual entry form. The server normalises into WrappedData. */
export interface WrappedFormInput {
  firstName: string;
  email: string;
  year: number;
  totalDistanceKm: number;
  totalElevationM: number;
  totalRides: number;
  totalTimeHours: number;
  longestRideKm: number;
  longestRideElevationM?: number;
  longestRideName?: string;
  biggestClimbDayElevationM?: number;
  biggestMonth?: number; // 1-12, optional
  ftpStart?: number;
  ftpEnd?: number;
  weeklyStreak?: number;
  rideDays?: number;
  weightKg?: number;
  personality?: RidingPersonality;
}

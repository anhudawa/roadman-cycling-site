/**
 * The eight-system fitness profile.
 *
 * Each system is scored 0–100 from the last 12 weeks of analyzed rides,
 * then the goal decides which weakness matters most — that becomes the
 * focus: the missing ingredient, named.
 */

import { zoneShares } from "./classify";
import { clamp, round1, shiftDate } from "./load";
import type {
  AnalyzedActivity,
  FitnessProfile,
  GoalKey,
  LoadPoint,
  ProfileFocus,
  RiderSettings,
  SystemKey,
  SystemScore,
  SystemState,
} from "./types";

const WINDOW_DAYS = 84;
const RECENT_DAYS = 28;

export const SYSTEM_LABELS: Record<SystemKey, string> = {
  "aerobic-base": "Aerobic Base",
  "zone2-engine": "Zone 2 Engine",
  "easy-discipline": "Easy Ride Discipline",
  "tempo-control": "Tempo Control",
  "threshold-power": "Threshold Power",
  "vo2-engine": "VO2 Engine",
  durability: "Durability",
  "execution-quality": "Execution Quality",
};

/** How much each system matters for each goal (used to pick the focus). */
const GOAL_WEIGHTS: Record<GoalKey, Record<SystemKey, number>> = {
  "gran-fondo": {
    "aerobic-base": 1.0,
    "zone2-engine": 0.9,
    "easy-discipline": 0.8,
    "tempo-control": 0.6,
    "threshold-power": 0.7,
    "vo2-engine": 0.4,
    durability: 1.0,
    "execution-quality": 0.7,
  },
  "road-race": {
    "aerobic-base": 0.8,
    "zone2-engine": 0.7,
    "easy-discipline": 0.7,
    "tempo-control": 0.5,
    "threshold-power": 0.9,
    "vo2-engine": 1.0,
    durability: 0.7,
    "execution-quality": 0.7,
  },
  "ftp-breakthrough": {
    "aerobic-base": 0.8,
    "zone2-engine": 0.8,
    "easy-discipline": 0.8,
    "tempo-control": 0.6,
    "threshold-power": 1.0,
    "vo2-engine": 0.7,
    durability: 0.5,
    "execution-quality": 0.8,
  },
  "base-season": {
    "aerobic-base": 1.0,
    "zone2-engine": 1.0,
    "easy-discipline": 0.9,
    "tempo-control": 0.5,
    "threshold-power": 0.4,
    "vo2-engine": 0.2,
    durability: 0.8,
    "execution-quality": 0.7,
  },
};

interface WindowStats {
  weeks: number;
  hoursPerWeek: number;
  z2HoursPerWeek: number;
  greyLeak: number; // 0–1 share of easy-intent time that drifted
  thresholdMinPerWeek: number;
  vo2MinPerWeekRecent: number;
  tempoSessionsPerWeek: number;
  longestRideHours: number;
  longRidesPerMonth: number;
  activeWeekShare: number; // weeks with >= 3 rides
  meanExecution: number | null;
  rideCount: number;
}

function inWindow(activity: AnalyzedActivity, from: string, to: string): boolean {
  return activity.date >= from && activity.date <= to;
}

export function computeWindowStats(
  activities: AnalyzedActivity[],
  asOf: string,
  windowDays = WINDOW_DAYS
): WindowStats {
  const from = shiftDate(asOf, -(windowDays - 1));
  const recentFrom = shiftDate(asOf, -(RECENT_DAYS - 1));
  const rides = activities.filter((a) => inWindow(a, from, asOf));
  const weeks = Math.max(1, windowDays / 7);

  let totalHours = 0;
  let z2Hours = 0;
  let easyIntentHours = 0;
  let easyDriftHours = 0;
  let thresholdMin = 0;
  let vo2MinRecent = 0;
  let tempoSessions = 0;
  let longestRideHours = 0;
  let longRides = 0;
  let execSum = 0;
  let execCount = 0;
  const ridesPerWeek = new Map<string, number>();

  for (const ride of rides) {
    const hours = ride.durationSec / 3600;
    totalHours += hours;
    longestRideHours = Math.max(longestRideHours, hours);
    if (hours >= 2.75) longRides += 1;

    const weekKey = shiftDate(ride.date, -weekdayIndex(ride.date));
    ridesPerWeek.set(weekKey, (ridesPerWeek.get(weekKey) ?? 0) + 1);

    const shares = zoneShares(ride);
    const isEasyIntent =
      ride.purpose === "endurance" ||
      ride.purpose === "long-ride" ||
      ride.purpose === "grey-zone" ||
      ride.purpose === "recovery";

    if (shares) {
      z2Hours += shares.easy * hours;
      thresholdMin += shares.threshold * hours * 60;
      if (ride.date >= recentFrom) vo2MinRecent += shares.hard * hours * 60;
      if (isEasyIntent) {
        easyIntentHours += hours;
        easyDriftHours += (shares.tempo + shares.threshold + shares.hard) * hours;
      }
    } else {
      // Summary-only rides: attribute time by purpose.
      if (isEasyIntent) {
        easyIntentHours += hours;
        if (ride.purpose === "grey-zone") easyDriftHours += hours * 0.4;
        else z2Hours += hours * 0.85;
      }
      if (ride.purpose === "threshold" || ride.purpose === "sweet-spot") {
        thresholdMin += hours * 60 * 0.3;
      }
      if (ride.purpose === "vo2" && ride.date >= recentFrom) {
        vo2MinRecent += hours * 60 * 0.15;
      }
    }

    if (ride.purpose === "tempo" || ride.purpose === "sweet-spot") {
      tempoSessions += 1;
    }
    if (ride.execution) {
      execSum += ride.execution.score;
      execCount += 1;
    }
  }

  const activeWeeks = [...ridesPerWeek.values()].filter((n) => n >= 3).length;

  return {
    weeks,
    hoursPerWeek: totalHours / weeks,
    z2HoursPerWeek: z2Hours / weeks,
    greyLeak: easyIntentHours > 0 ? easyDriftHours / easyIntentHours : 0,
    thresholdMinPerWeek: thresholdMin / weeks,
    vo2MinPerWeekRecent: vo2MinRecent / (RECENT_DAYS / 7),
    tempoSessionsPerWeek: tempoSessions / weeks,
    longestRideHours,
    longRidesPerMonth: longRides / (windowDays / 30),
    activeWeekShare: activeWeeks / weeks,
    meanExecution: execCount > 0 ? execSum / execCount : null,
    rideCount: rides.length,
  };
}

function weekdayIndex(iso: string): number {
  // Monday = 0.
  const day = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return (day + 6) % 7;
}

function stateFor(score: number): SystemState {
  if (score >= 75) return "strong";
  if (score >= 50) return "developing";
  return "underdeveloped";
}

function system(key: SystemKey, score: number, note: string): SystemScore {
  const rounded = Math.round(clamp(score, 0, 100));
  return { key, label: SYSTEM_LABELS[key], score: rounded, state: stateFor(rounded), note };
}

const GOAL_DEMANDS: Record<
  GoalKey,
  { longRideHours: number; thresholdMin: number; vo2Min: number }
> = {
  "gran-fondo": { longRideHours: 4, thresholdMin: 25, vo2Min: 8 },
  "road-race": { longRideHours: 3, thresholdMin: 30, vo2Min: 15 },
  "ftp-breakthrough": { longRideHours: 2.5, thresholdMin: 40, vo2Min: 10 },
  "base-season": { longRideHours: 3, thresholdMin: 15, vo2Min: 4 },
};

export function buildFitnessProfile(
  activities: AnalyzedActivity[],
  load: LoadPoint[],
  settings: RiderSettings,
  asOf: string
): FitnessProfile {
  const stats = computeWindowStats(activities, asOf);
  const demands = GOAL_DEMANDS[settings.goal];
  const ctl = load.length > 0 ? load[load.length - 1].ctl : 0;

  // A rider training weeklyHours consistently lands near hours × 8 CTL
  // (≈55 TSS/hour averaged across a sane week).
  const targetCtl = Math.max(20, settings.weeklyHours * 8);
  const targetZ2 = Math.max(2, settings.weeklyHours * 0.6);

  const systems: SystemScore[] = [
    system(
      "aerobic-base",
      (ctl / targetCtl) * 75 + stats.activeWeekShare * 25,
      ctl >= targetCtl * 0.9
        ? `Fitness (CTL ${Math.round(ctl)}) is where it should be for ${settings.weeklyHours}h/week. The base is there.`
        : `Fitness sits at CTL ${Math.round(ctl)} against a ~${Math.round(targetCtl)} target for your hours. Consistency, not heroics, closes this.`
    ),
    system(
      "zone2-engine",
      (stats.z2HoursPerWeek / targetZ2) * 100,
      stats.z2HoursPerWeek >= targetZ2 * 0.85
        ? `${round1(stats.z2HoursPerWeek)}h/week of genuine Zone 2. That's the engine room working.`
        : `${round1(stats.z2HoursPerWeek)}h/week of true Zone 2 against a ${round1(targetZ2)}h target. The pros spend 80% of their time here for a reason.`
    ),
    system(
      "easy-discipline",
      100 - stats.greyLeak * 160,
      stats.greyLeak <= 0.15
        ? "Your easy rides stay easy. That discipline is rarer than a big FTP."
        : `${Math.round(stats.greyLeak * 100)}% of your easy-ride time drifts above Zone 2. Riding easy 50% too hard is the most common self-coached mistake there is.`
    ),
    system(
      "tempo-control",
      tempoScore(stats.tempoSessionsPerWeek),
      stats.tempoSessionsPerWeek > 2
        ? "Plenty of tempo — arguably too much. Tempo shouldn't be the default setting for every ride."
        : stats.tempoSessionsPerWeek >= 0.5
          ? "Tempo and sweet spot show up deliberately, not accidentally. Good."
          : "Almost no deliberate tempo work. One controlled tempo or sweet-spot session a week is a cheap aerobic gain."
    ),
    system(
      "threshold-power",
      (stats.thresholdMinPerWeek / demands.thresholdMin) * 90,
      stats.thresholdMinPerWeek >= demands.thresholdMin * 0.8
        ? `${Math.round(stats.thresholdMinPerWeek)} min/week at threshold — the FTP stimulus is in place.`
        : `${Math.round(stats.thresholdMinPerWeek)} min/week at threshold against a ~${demands.thresholdMin} min target. FTP doesn't move without time at FTP.`
    ),
    system(
      "vo2-engine",
      (stats.vo2MinPerWeekRecent / demands.vo2Min) * 85,
      stats.vo2MinPerWeekRecent >= demands.vo2Min * 0.8
        ? `${Math.round(stats.vo2MinPerWeekRecent)} min/week above threshold in the last month. The ceiling is being raised.`
        : `${Math.round(stats.vo2MinPerWeekRecent)} min/week of VO2 work in the last month. The ceiling on your FTP is set up here.`
    ),
    system(
      "durability",
      (stats.longestRideHours / demands.longRideHours) * 65 +
        clamp(stats.longRidesPerMonth / 3, 0, 1) * 35,
      stats.longestRideHours >= demands.longRideHours * 0.9
        ? `Longest recent ride: ${round1(stats.longestRideHours)}h. You've banked the durability your goal demands.`
        : `Longest recent ride: ${round1(stats.longestRideHours)}h against the ~${demands.longRideHours}h your goal demands. Late-ride fade is a durability problem, and durability is trainable.`
    ),
    system(
      "execution-quality",
      stats.meanExecution !== null ? stats.meanExecution * 10 : 50,
      stats.meanExecution !== null
        ? stats.meanExecution >= 7.5
          ? `Average execution ${round1(stats.meanExecution)}/10. You ride your sessions the way they're meant to be ridden.`
          : `Average execution ${round1(stats.meanExecution)}/10. The plan isn't the problem — the version of it you're riding is.`
        : "Not enough data yet to judge how well sessions match their purpose."
    ),
  ];

  return {
    systems,
    focus: pickFocus(systems, settings.goal, stats.rideCount),
    asOf,
  };
}

function tempoScore(sessionsPerWeek: number): number {
  // Inverted U: some deliberate tempo is good, tempo-as-default is not.
  if (sessionsPerWeek <= 0) return 35;
  if (sessionsPerWeek <= 1.5) return 60 + (sessionsPerWeek / 1.5) * 30;
  if (sessionsPerWeek <= 2.5) return 90 - (sessionsPerWeek - 1.5) * 25;
  return 55;
}

const FOCUS_NOTES: Record<SystemKey, string> = {
  "aerobic-base":
    "Everything else is built on this. Before chasing intervals, string together consistent weeks — the plan below trades intensity for frequency until the base is back.",
  "zone2-engine":
    "Dan Lorang's riders and Professor Seiler's data agree on this one: the engine is built at a pace your ego hates. Your plan protects real Zone 2 hours before anything shiny.",
  "easy-discipline":
    "Here's what nobody tells you: most riders ride 50% too hard when they think they're riding easy. Fix the leak and the same weekly hours suddenly produce double the adaptation.",
  "tempo-control":
    "You need tempo in the week — on purpose, with a cap. One controlled sweet-spot session replaces three accidental grey-zone rides.",
  "threshold-power":
    "FTP moves when you spend time at FTP. The plan anchors the week on structured threshold work and keeps everything around it easy enough to absorb it.",
  "vo2-engine":
    "Your ceiling is setting your threshold's ceiling. Short, hard, honest VO2 work — the 4×8s Seiler tested — is the missing stimulus, and it only takes one session a week.",
  durability:
    "You don't fade because you're unfit. You fade because the long ride that teaches your body to resist fatigue has gone missing. It comes back this block.",
  "execution-quality":
    "The sessions are right; the riding of them is leaking value. This block, every session gets one number to hit and a hard ceiling — precision over enthusiasm.",
};

function pickFocus(
  systems: SystemScore[],
  goal: GoalKey,
  rideCount: number
): ProfileFocus {
  if (rideCount < 8) {
    return {
      system: "aerobic-base",
      headline: "MORE DATA NEEDED — RIDE AND IT SHARPENS",
      coachNote:
        "With only a handful of rides on file the profile is a sketch, not a diagnosis. Keep importing rides and the picture sharpens fast.",
    };
  }
  const weights = GOAL_WEIGHTS[goal];
  let worst = systems[0];
  let worstWeighted = Infinity;
  for (const s of systems) {
    const weighted = s.score / Math.max(0.01, weights[s.key]);
    if (weighted < worstWeighted) {
      worstWeighted = weighted;
      worst = s;
    }
  }
  return {
    system: worst.key,
    headline: `THE MISSING INGREDIENT: ${SYSTEM_LABELS[worst.key].toUpperCase()}`,
    coachNote: FOCUS_NOTES[worst.key],
  };
}

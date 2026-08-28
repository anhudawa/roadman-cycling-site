export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type DayName = (typeof DAY_NAMES)[number];
export type RideContext = "off-bike" | "easy" | "endurance" | "key" | "long";
export type StrengthWindow = 0 | 30 | 45 | 60;

export interface WeekDayInput {
  day: DayName;
  ride: RideContext;
  strengthWindow: StrengthWindow;
}

export interface StrengthPlacement {
  day: DayName;
  dayIndex: number;
  duration: Exclude<StrengthWindow, 0>;
  ride: RideContext;
  score: number;
  reasons: string[];
  cautions: string[];
}

export interface StrengthPlacementPlan {
  placements: StrengthPlacement[];
  unplacedSessions: number;
  summary: string;
}

export const RIDE_CONTEXT_LABELS: Record<RideContext, string> = {
  "off-bike": "No ride / off-bike",
  easy: "Easy or recovery ride",
  endurance: "Endurance ride",
  key: "Key intervals or race-priority ride",
  long: "Long or event-specific ride",
};

export const PLACEMENT_RULES = [
  "Protect the next key interval, long or event-specific ride.",
  "Prefer an available off-bike or easy-ride day over a priority-ride day.",
  "When two strength sessions are requested, prefer separation over back-to-back placement.",
  "Use the selected 30, 45 or 60-minute window without adding work to fill a longer day.",
] as const;

const BASE_SCORE: Record<RideContext, number> = {
  "off-bike": 7,
  easy: 8,
  endurance: 5,
  key: 2,
  long: -8,
};

function isPriorityRide(ride: RideContext): boolean {
  return ride === "key" || ride === "long";
}

function circularDistance(a: number, b: number): number {
  const direct = Math.abs(a - b);
  return Math.min(direct, DAY_NAMES.length - direct);
}

function basePlacementScore(week: WeekDayInput[], dayIndex: number): number {
  const current = week[dayIndex];
  if (current.strengthWindow === 0) return Number.NEGATIVE_INFINITY;

  const previous = week[(dayIndex + week.length - 1) % week.length];
  const next = week[(dayIndex + 1) % week.length];
  let score = BASE_SCORE[current.ride];

  if (
    isPriorityRide(previous.ride) &&
    (current.ride === "easy" || current.ride === "off-bike")
  ) {
    score += 1.5;
  }

  if (next.ride === "key") score -= 8;
  if (next.ride === "long") score -= 10;
  if (current.strengthWindow === 45) score += 0.5;
  if (current.strengthWindow === 60) score += 1;

  return score;
}

function explainPlacement(
  week: WeekDayInput[],
  dayIndex: number,
  selectedIndices: number[],
): Pick<StrengthPlacement, "reasons" | "cautions"> {
  const current = week[dayIndex];
  const previous = week[(dayIndex + week.length - 1) % week.length];
  const next = week[(dayIndex + 1) % week.length];
  const reasons = [
    `${current.strengthWindow}-minute strength window is available.`,
    `${RIDE_CONTEXT_LABELS[current.ride]} is the riding context for the day.`,
  ];
  const cautions: string[] = [];

  if (
    isPriorityRide(previous.ride) &&
    (current.ride === "easy" || current.ride === "off-bike")
  ) {
    reasons.push(
      "It follows a priority ride and keeps the next day clear of a new hard-bike conflict.",
    );
  }

  if (!isPriorityRide(next.ride)) {
    reasons.push("It does not sit directly before a key or long ride.");
  }

  if (next.ride === "key" || next.ride === "long") {
    cautions.push(
      `This is a compromise because ${next.day} is a ${RIDE_CONTEXT_LABELS[next.ride].toLowerCase()}. Move the gym window if that ride loses quality.`,
    );
  }

  if (current.ride === "key") {
    cautions.push(
      "This assumes the priority ride happens first. Do not let the gym session reduce the quality of that ride.",
    );
  }

  if (current.ride === "long") {
    cautions.push(
      "A long-ride day is a last-resort placement. Use another available day when possible.",
    );
  }

  if (
    selectedIndices.some(
      (selected) => circularDistance(selected, dayIndex) === 1,
    )
  ) {
    cautions.push(
      "The two selected strength windows are back to back. Separate them if either session or the next important ride loses quality.",
    );
  }

  return { reasons, cautions };
}

export function buildStrengthPlacementPlan(
  week: WeekDayInput[],
  requestedSessions: 1 | 2,
): StrengthPlacementPlan {
  if (week.length !== DAY_NAMES.length) {
    throw new Error("A complete Monday-to-Sunday week is required.");
  }

  const candidates = week
    .map((day, dayIndex) => ({
      day,
      dayIndex,
      baseScore: basePlacementScore(week, dayIndex),
    }))
    .filter((candidate) => Number.isFinite(candidate.baseScore));
  const selectedIndices: number[] = [];

  while (
    selectedIndices.length < requestedSessions &&
    selectedIndices.length < candidates.length
  ) {
    const ranked = candidates
      .filter((candidate) => !selectedIndices.includes(candidate.dayIndex))
      .map((candidate) => {
        const separationAdjustment = selectedIndices.reduce(
          (total, selected) => {
            const distance = circularDistance(selected, candidate.dayIndex);
            return total + (distance === 1 ? -8 : 2);
          },
          0,
        );
        return {
          ...candidate,
          adjustedScore: candidate.baseScore + separationAdjustment,
        };
      })
      .sort(
        (a, b) => b.adjustedScore - a.adjustedScore || a.dayIndex - b.dayIndex,
      );

    if (!ranked[0]) break;
    selectedIndices.push(ranked[0].dayIndex);
  }

  const placements = selectedIndices
    .sort((a, b) => a - b)
    .map((dayIndex) => {
      const day = week[dayIndex];
      const explanation = explainPlacement(week, dayIndex, selectedIndices);
      return {
        day: day.day,
        dayIndex,
        duration: day.strengthWindow as Exclude<StrengthWindow, 0>,
        ride: day.ride,
        score: basePlacementScore(week, dayIndex),
        ...explanation,
      };
    });
  const unplacedSessions = requestedSessions - placements.length;
  const hasCompromise = placements.some(
    (placement) => placement.cautions.length > 0,
  );

  return {
    placements,
    unplacedSessions,
    summary:
      placements.length === 0
        ? "No strength window is available. Add at least one 30, 45 or 60-minute window before asking the tool to place a session."
        : unplacedSessions > 0
          ? `Placed ${placements.length} of ${requestedSessions} requested sessions. Add another gym window rather than stacking missed work into the available day.`
          : hasCompromise
            ? "The requested sessions fit, but at least one placement contains a bike-quality conflict to review."
            : `Placed ${placements.length} strength ${placements.length === 1 ? "session" : "sessions"} without putting one directly before a key or long ride.`,
  };
}

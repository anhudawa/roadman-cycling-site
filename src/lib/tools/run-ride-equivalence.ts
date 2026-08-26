export type RunRideDirection = "run-to-ride" | "ride-to-run";
export type RunRideInputMode = "distance" | "time";
export type RunRideDistanceUnit = "km" | "mile";

export interface RunRideActivity {
  id: string;
  label: string;
  met: number;
  speedMph: number;
  compendiumCode: string;
}

export const RUNNING_ACTIVITIES: readonly RunRideActivity[] = [
  {
    id: "run-5",
    label: "5.0 mph · 12:00/mile",
    met: 8.5,
    speedMph: 5,
    compendiumCode: "12030",
  },
  {
    id: "run-6",
    label: "6.0 mph · 10:00/mile",
    met: 9.3,
    speedMph: 6,
    compendiumCode: "12050",
  },
  {
    id: "run-6-7",
    label: "6.7 mph · 9:00/mile",
    met: 10.5,
    speedMph: 6.7,
    compendiumCode: "12060",
  },
  {
    id: "run-7",
    label: "7.0 mph · 8:34/mile",
    met: 11,
    speedMph: 7,
    compendiumCode: "12070",
  },
  {
    id: "run-7-5",
    label: "7.5 mph · 8:00/mile",
    met: 11.8,
    speedMph: 7.5,
    compendiumCode: "12080",
  },
  {
    id: "run-8",
    label: "8.0 mph · 7:30/mile",
    met: 12,
    speedMph: 8,
    compendiumCode: "12090",
  },
  {
    id: "run-8-6",
    label: "8.6 mph · 7:00/mile",
    met: 12.5,
    speedMph: 8.6,
    compendiumCode: "12100",
  },
  {
    id: "run-9",
    label: "9.0 mph · 6:40/mile",
    met: 13,
    speedMph: 9,
    compendiumCode: "12110",
  },
  {
    id: "run-10",
    label: "10.0 mph · 6:00/mile",
    met: 14.8,
    speedMph: 10,
    compendiumCode: "12120",
  },
] as const;

export const CYCLING_ACTIVITIES: readonly RunRideActivity[] = [
  {
    id: "ride-9-4",
    label: "9.4 mph · 15.1 km/h leisure",
    met: 5.8,
    speedMph: 9.4,
    compendiumCode: "01019",
  },
  {
    id: "ride-10",
    label: "10 mph · 10–11.9 mph category",
    met: 6.8,
    speedMph: 10,
    compendiumCode: "01020",
  },
  {
    id: "ride-12",
    label: "12 mph · 12–13.9 mph category",
    met: 8,
    speedMph: 12,
    compendiumCode: "01030",
  },
  {
    id: "ride-14",
    label: "14 mph · 14–15.9 mph category",
    met: 10,
    speedMph: 14,
    compendiumCode: "01040",
  },
  {
    id: "ride-16",
    label: "16 mph · 16–19 mph category",
    met: 12,
    speedMph: 16,
    compendiumCode: "01050",
  },
  {
    id: "ride-20",
    label: "20.1 mph · >20 mph category",
    met: 16.8,
    speedMph: 20.1,
    compendiumCode: "01060",
  },
] as const;

const KM_PER_MILE = 1.609344;

export interface RunRideConversionInput {
  direction: RunRideDirection;
  inputMode: RunRideInputMode;
  amount: number;
  distanceUnit: RunRideDistanceUnit;
  sourceActivityId: string;
  targetActivityId: string;
}

export interface RunRideConversionResult {
  source: RunRideActivity;
  target: RunRideActivity;
  sourceMinutes: number;
  sourceDistanceMiles: number;
  targetMinutes: number;
  targetDistanceMiles: number;
  metMinutes: number;
}

function getActivity(
  activities: readonly RunRideActivity[],
  id: string,
): RunRideActivity {
  const activity = activities.find((candidate) => candidate.id === id);
  if (!activity) throw new Error(`Unknown run-ride activity: ${id}`);
  return activity;
}

export function convertRunRideEnergyCost({
  direction,
  inputMode,
  amount,
  distanceUnit,
  sourceActivityId,
  targetActivityId,
}: RunRideConversionInput): RunRideConversionResult {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be a positive finite number");
  }

  const sourceActivities =
    direction === "run-to-ride" ? RUNNING_ACTIVITIES : CYCLING_ACTIVITIES;
  const targetActivities =
    direction === "run-to-ride" ? CYCLING_ACTIVITIES : RUNNING_ACTIVITIES;
  const source = getActivity(sourceActivities, sourceActivityId);
  const target = getActivity(targetActivities, targetActivityId);

  const sourceDistanceMiles =
    inputMode === "distance"
      ? distanceUnit === "km"
        ? amount / KM_PER_MILE
        : amount
      : (source.speedMph * amount) / 60;
  const sourceMinutes =
    inputMode === "time"
      ? amount
      : (sourceDistanceMiles / source.speedMph) * 60;
  const metMinutes = sourceMinutes * source.met;
  const targetMinutes = metMinutes / target.met;
  const targetDistanceMiles = (target.speedMph * targetMinutes) / 60;

  return {
    source,
    target,
    sourceMinutes,
    sourceDistanceMiles,
    targetMinutes,
    targetDistanceMiles,
    metMinutes,
  };
}

export function milesToKilometres(miles: number): number {
  return miles * KM_PER_MILE;
}

export type CourseCalibrationType = "flat" | "rolling" | "mountain" | "unknown";
export type RiderCalibrationType =
  | "developing"
  | "trained"
  | "competitive"
  | "high_performance"
  | "unknown";

export interface CalibrationObservation {
  predictionId: number;
  predictedTimeS: number;
  actualTimeS: number;
  courseDistanceM?: number | null;
  courseElevationGainM?: number | null;
  eventType?: string | null;
  riderFtpW?: number | null;
  riderMassKg?: number | null;
}

export interface CalibrationMetric {
  count: number;
  mapePct: number | null;
  meanSignedErrorPct: number | null;
  medianAbsoluteErrorPct: number | null;
  p90AbsoluteErrorPct: number | null;
  within5Pct: number | null;
  within10Pct: number | null;
}

export interface CalibrationBreakdown extends CalibrationMetric {
  key: string;
}

export interface CalibrationReport {
  overall: CalibrationMetric;
  byCourseType: CalibrationBreakdown[];
  byRiderType: CalibrationBreakdown[];
  byEventType: CalibrationBreakdown[];
}

interface ValidObservation extends CalibrationObservation {
  signedErrorPct: number;
  absoluteErrorPct: number;
}

export function classifyCourseType(
  distanceM?: number | null,
  elevationGainM?: number | null,
): CourseCalibrationType {
  if (!distanceM || distanceM <= 0 || elevationGainM == null || elevationGainM < 0) {
    return "unknown";
  }
  const climbingPerKm = elevationGainM / (distanceM / 1000);
  if (climbingPerKm < 8) return "flat";
  if (climbingPerKm < 18) return "rolling";
  return "mountain";
}

export function classifyRiderType(
  ftpW?: number | null,
  massKg?: number | null,
): RiderCalibrationType {
  if (!ftpW || ftpW <= 0 || !massKg || massKg <= 0) return "unknown";
  const wattsPerKg = ftpW / massKg;
  if (wattsPerKg < 2.25) return "developing";
  if (wattsPerKg < 3.25) return "trained";
  if (wattsPerKg < 4.25) return "competitive";
  return "high_performance";
}

function percentile(sorted: number[], percentileValue: number): number | null {
  if (sorted.length === 0) return null;
  const index = Math.ceil(percentileValue * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, index))];
}

function roundMetric(value: number): number {
  return Math.round(value * 100) / 100;
}

function validObservations(
  observations: CalibrationObservation[],
): ValidObservation[] {
  return observations.flatMap((observation) => {
    if (
      !Number.isFinite(observation.predictedTimeS) ||
      !Number.isFinite(observation.actualTimeS) ||
      observation.predictedTimeS <= 0 ||
      observation.actualTimeS <= 0
    ) {
      return [];
    }
    const signedErrorPct =
      ((observation.predictedTimeS - observation.actualTimeS) /
        observation.actualTimeS) *
      100;
    return [
      {
        ...observation,
        signedErrorPct,
        absoluteErrorPct: Math.abs(signedErrorPct),
      },
    ];
  });
}

export function calculateCalibrationMetric(
  observations: CalibrationObservation[],
): CalibrationMetric {
  const valid = validObservations(observations);
  if (valid.length === 0) {
    return {
      count: 0,
      mapePct: null,
      meanSignedErrorPct: null,
      medianAbsoluteErrorPct: null,
      p90AbsoluteErrorPct: null,
      within5Pct: null,
      within10Pct: null,
    };
  }

  const absoluteErrors = valid
    .map((observation) => observation.absoluteErrorPct)
    .sort((a, b) => a - b);
  const signedTotal = valid.reduce(
    (sum, observation) => sum + observation.signedErrorPct,
    0,
  );
  const midpoint = Math.floor(absoluteErrors.length / 2);
  const median =
    absoluteErrors.length % 2 === 0
      ? (absoluteErrors[midpoint - 1] + absoluteErrors[midpoint]) / 2
      : absoluteErrors[midpoint];

  return {
    count: valid.length,
    mapePct: roundMetric(
      absoluteErrors.reduce((sum, error) => sum + error, 0) / valid.length,
    ),
    meanSignedErrorPct: roundMetric(signedTotal / valid.length),
    medianAbsoluteErrorPct: roundMetric(median),
    p90AbsoluteErrorPct: roundMetric(percentile(absoluteErrors, 0.9) ?? 0),
    within5Pct: roundMetric(
      (absoluteErrors.filter((error) => error <= 5).length / valid.length) * 100,
    ),
    within10Pct: roundMetric(
      (absoluteErrors.filter((error) => error <= 10).length / valid.length) * 100,
    ),
  };
}

function groupMetrics(
  observations: CalibrationObservation[],
  keyFor: (observation: CalibrationObservation) => string,
): CalibrationBreakdown[] {
  const groups = new Map<string, CalibrationObservation[]>();
  for (const observation of observations) {
    const key = keyFor(observation);
    groups.set(key, [...(groups.get(key) ?? []), observation]);
  }
  return Array.from(groups.entries())
    .map(([key, rows]) => ({ key, ...calculateCalibrationMetric(rows) }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

export function buildCalibrationReport(
  observations: CalibrationObservation[],
): CalibrationReport {
  return {
    overall: calculateCalibrationMetric(observations),
    byCourseType: groupMetrics(observations, (observation) =>
      classifyCourseType(
        observation.courseDistanceM,
        observation.courseElevationGainM,
      ),
    ),
    byRiderType: groupMetrics(observations, (observation) =>
      classifyRiderType(observation.riderFtpW, observation.riderMassKg),
    ),
    byEventType: groupMetrics(
      observations,
      (observation) => observation.eventType?.trim() || "unknown",
    ),
  };
}

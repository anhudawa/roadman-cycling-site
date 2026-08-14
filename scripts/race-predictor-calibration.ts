import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import {
  courses,
  predictionResults,
  predictions,
} from "../src/lib/db/schema";
import {
  buildCalibrationReport,
  type CalibrationObservation,
} from "../src/lib/race-predictor/calibration";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

interface SavedRiderInput {
  bodyMass?: unknown;
  powerProfile?: { p60min?: unknown };
}

interface SavedResultSummary {
  assumptions?: { eventType?: unknown };
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

async function main() {
  if (!process.env.POSTGRES_URL && !process.env.POSTGRES_URL_NON_POOLING) {
    throw new Error(
      "POSTGRES_URL is required to calculate Race Predictor calibration metrics.",
    );
  }

  const rows = await db
    .select({
      predictionId: predictions.id,
      predictedTimeS: predictions.predictedTimeS,
      actualTimeS: predictionResults.actualTimeS,
      riderInputs: predictions.riderInputs,
      resultSummary: predictions.resultSummary,
      courseDistanceM: courses.distanceM,
      courseElevationGainM: courses.elevationGainM,
    })
    .from(predictionResults)
    .innerJoin(predictions, eq(predictions.id, predictionResults.predictionId))
    .leftJoin(courses, eq(courses.id, predictions.courseId));

  const observations: CalibrationObservation[] = rows.map((row) => {
    const rider = row.riderInputs as SavedRiderInput;
    const summary = row.resultSummary as SavedResultSummary | null;
    const eventType = summary?.assumptions?.eventType;
    return {
      predictionId: row.predictionId,
      predictedTimeS: row.predictedTimeS,
      actualTimeS: row.actualTimeS,
      courseDistanceM: row.courseDistanceM,
      courseElevationGainM: row.courseElevationGainM,
      eventType: typeof eventType === "string" ? eventType : null,
      riderFtpW: finiteNumber(rider.powerProfile?.p60min),
      riderMassKg: finiteNumber(rider.bodyMass),
    };
  });

  process.stdout.write(
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        engineScope: "all_versions",
        ...buildCalibrationReport(observations),
      },
      null,
      2,
    )}\n`,
  );
}

main().catch((error) => {
  console.error(
    `[predict:calibration] ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});

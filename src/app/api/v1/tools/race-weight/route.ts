import { NextResponse } from "next/server";
import {
  calculateRaceWeight,
  RACE_WEIGHT_EVENTS,
  RACE_WEIGHT_GENDERS,
  type RaceWeightEvent,
  type RaceWeightGender,
} from "@/lib/tools/calculators";
import { FEED_BASE_URL, FEED_CACHE_HEADERS, feedUrl } from "@/lib/feeds";

/**
 * GET /api/v1/tools/race-weight?weight=75&height=180&bodyFat=18&gender=male&eventType=road-race
 *
 * Returns the optimal race weight range, estimated weeks to target,
 * and a coaching approach. Inputs:
 *   - weight (kg, 30–200, required)
 *   - height (cm, 120–230, required)
 *   - bodyFat (%, 3–50, required)
 *   - gender ("male" | "female", required)
 *   - eventType ("road-race" | "gran-fondo" | "hill-climb" | "time-trial" | "gravel", required)
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const get = (k: string) => url.searchParams.get(k)?.trim() ?? "";

  const weight = parseFloat(get("weight"));
  const height = parseFloat(get("height"));
  const bodyFat = parseFloat(get("bodyFat"));
  const gender = get("gender").toLowerCase() as RaceWeightGender;
  const eventType = get("eventType").toLowerCase() as RaceWeightEvent;

  const errors: string[] = [];
  if (!Number.isFinite(weight) || weight < 30 || weight > 200) {
    errors.push("weight must be a number between 30 and 200 (kg)");
  }
  if (!Number.isFinite(height) || height < 120 || height > 230) {
    errors.push("height must be a number between 120 and 230 (cm)");
  }
  if (!Number.isFinite(bodyFat) || bodyFat < 3 || bodyFat > 50) {
    errors.push("bodyFat must be a number between 3 and 50 (%)");
  }
  if (!RACE_WEIGHT_GENDERS.includes(gender)) {
    errors.push(`gender must be one of: ${RACE_WEIGHT_GENDERS.join(", ")}`);
  }
  if (!RACE_WEIGHT_EVENTS.includes(eventType)) {
    errors.push(`eventType must be one of: ${RACE_WEIGHT_EVENTS.join(", ")}`);
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { error: "Validation failed", details: errors },
      { status: 400 },
    );
  }

  const result = calculateRaceWeight({
    heightCm: height,
    currentWeightKg: weight,
    bodyFatPercent: bodyFat,
    eventType,
    gender,
  });

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      baseUrl: FEED_BASE_URL,
      tool: {
        slug: "race-weight",
        title: "Race Weight Calculator",
        url: feedUrl("/tools/race-weight"),
      },
      input: { weight, height, bodyFat, gender, eventType },
      result,
      methodology: {
        bodyFatModel: "Gender- and event-specific competitive amateur ranges (Jeukendrup & Gleeson)",
        weightLossRate: "0.5% body weight per week (safe maximum)",
        heightFloor: "Miller-formula minimum healthy weight",
      },
      disclaimer: "Estimates only. Race-weight programmes should be supervised; stop and consult a sports dietitian if training quality drops or eating becomes disordered.",
    },
    { headers: FEED_CACHE_HEADERS },
  );
}

import { NextResponse } from "next/server";
import {
  CARB_INTENSITIES,
  calculateCarbsPerHour,
  type CarbIntensity,
} from "@/lib/tools/calculators";
import { FEED_BASE_URL, FEED_CACHE_HEADERS, feedUrl } from "@/lib/feeds";

/**
 * GET /api/v1/tools/carbs-per-hour?weight=75&intensity=endurance&duration=180
 *
 * Returns carbohydrate, glucose, and fructose targets per hour for an
 * endurance ride based on Jeukendrup / Burke / Morton consensus on
 * sports nutrition science.
 *
 * Query params:
 *   - weight (kg, 30-200, required)
 *   - intensity ("easy" | "endurance" | "tempo" | "threshold" | "race", required)
 *   - duration (minutes, 15-720, required)
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const get = (k: string) => url.searchParams.get(k)?.trim() ?? "";

  const weight = parseFloat(get("weight"));
  const intensity = get("intensity").toLowerCase() as CarbIntensity;
  const duration = parseFloat(get("duration"));

  const errors: string[] = [];
  if (!Number.isFinite(weight) || weight < 30 || weight > 200) {
    errors.push("weight must be a number between 30 and 200 (kg)");
  }
  if (!CARB_INTENSITIES.includes(intensity)) {
    errors.push(`intensity must be one of: ${CARB_INTENSITIES.join(", ")}`);
  }
  if (!Number.isFinite(duration) || duration < 15 || duration > 720) {
    errors.push("duration must be a number between 15 and 720 (minutes)");
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { error: "Validation failed", details: errors },
      { status: 400 },
    );
  }

  const result = calculateCarbsPerHour({
    weightKg: weight,
    intensity,
    durationMin: duration,
  });

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      baseUrl: FEED_BASE_URL,
      tool: {
        slug: "carbs-per-hour",
        title: "Carbs-Per-Hour Calculator",
        url: feedUrl("/tools/fuelling"),
      },
      input: { weight, intensity, duration },
      result,
      methodology: {
        carbBands: "Jeukendrup, Burke, and Morton consensus on endurance carbohydrate intake",
        dualTransporter: "Above 60 g/hr we recommend a 2:1 glucose:fructose split (SGLT1 + GLUT5)",
        durationBands: "Ride ≥ 120 min uses long-ride upper bands; shorter rides use lower bands",
        weightBias: "Heavier riders bias toward the upper end of each band (linear 60-90 kg)",
      },
      disclaimer:
        "Estimates only. Carb absorption is highly individual; train your gut progressively over 4-6 weeks before racing high intakes. Stop and consult a sports nutritionist if you experience persistent GI distress.",
    },
    { headers: FEED_CACHE_HEADERS },
  );
}

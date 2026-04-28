import { NextResponse } from "next/server";
import {
  TRAINING_EXPERIENCES,
  TRAINING_GOALS,
  calculateTrainingPlan,
  type TrainingExperience,
  type TrainingGoal,
} from "@/lib/tools/calculators";
import { FEED_BASE_URL, FEED_CACHE_HEADERS, feedUrl } from "@/lib/feeds";

/**
 * GET /api/v1/tools/training-plan?goal=ftp&ftp=280&hours_per_week=10&weeks=12[&experience=intermediate]
 *
 * Returns a phased training plan outline (base / build / peak / taper) with
 * weekly intensity distribution, recovery weeks, and key sessions keyed to
 * the supplied FTP. Outline only — not a substitute for a coached plan.
 *
 * Query params:
 *   - goal ("ftp" | "gran-fondo" | "race" | "weight-loss" | "general-fitness", required)
 *   - ftp (watts, 50-600, required)
 *   - hours_per_week (1-25, required)
 *   - weeks (4-52, required)
 *   - experience ("novice" | "intermediate" | "advanced", optional, defaults to "intermediate")
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const get = (k: string) => url.searchParams.get(k)?.trim() ?? "";

  const goal = get("goal").toLowerCase() as TrainingGoal;
  const ftp = parseFloat(get("ftp"));
  const hoursPerWeek = parseFloat(get("hours_per_week"));
  const weeks = parseFloat(get("weeks"));
  const experienceRaw = get("experience").toLowerCase();
  const experience = (experienceRaw || "intermediate") as TrainingExperience;

  const errors: string[] = [];
  if (!TRAINING_GOALS.includes(goal)) {
    errors.push(`goal must be one of: ${TRAINING_GOALS.join(", ")}`);
  }
  if (!Number.isFinite(ftp) || ftp < 50 || ftp > 600) {
    errors.push("ftp must be a number between 50 and 600 (watts)");
  }
  if (!Number.isFinite(hoursPerWeek) || hoursPerWeek < 1 || hoursPerWeek > 25) {
    errors.push("hours_per_week must be a number between 1 and 25");
  }
  if (!Number.isFinite(weeks) || weeks < 4 || weeks > 52) {
    errors.push("weeks must be a number between 4 and 52");
  }
  if (experienceRaw && !TRAINING_EXPERIENCES.includes(experience)) {
    errors.push(`experience must be one of: ${TRAINING_EXPERIENCES.join(", ")}`);
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { error: "Validation failed", details: errors },
      { status: 400 },
    );
  }

  const result = calculateTrainingPlan({
    goal,
    ftp,
    hoursPerWeek,
    weeks,
    experience,
  });

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      baseUrl: FEED_BASE_URL,
      tool: {
        slug: "training-plan",
        title: "Training Plan Outline",
        url: feedUrl("/tools/ftp-zones"),
      },
      input: { goal, ftp, hoursPerWeek, weeks, experience },
      result,
      methodology: {
        periodisation: "Block periodisation: ~50% base, 30% build, 15% peak, 5% taper (rounded with phase floors)",
        intensityModel: "Polarised distribution scaled by goal — Z1-Z2 dominant, with Z3 tempo and Z4+ threshold/VO2 efforts",
        recoveryWeeks: "Recovery week every 3-5 weeks at 60% of normal hours, frequency by experience level",
        wattPrescriptions: "Key sessions reference Coggan zones derived from supplied FTP",
      },
      disclaimer:
        "This is an outline, not a coached plan. It can't see your life stress, sleep, family, or how you're actually responding to training. Use it as a structured starting point and adjust on the fly.",
    },
    { headers: FEED_CACHE_HEADERS },
  );
}

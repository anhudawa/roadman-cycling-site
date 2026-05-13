import { NextResponse } from "next/server";
import {
  MethodAuthError,
  requireMethodSession,
} from "@/lib/method/auth";
import { PLAN_BY_CODE } from "@/lib/method/onboarding/plan-matrix";
import { recommend } from "@/lib/method/onboarding/recommend";
import {
  GOALS,
  LEVELS,
  WEEKLY_HOURS,
  type Goal,
  type Level,
  type WeeklyHours,
} from "@/lib/method/onboarding/types";

interface OnboardingBody {
  planCode?: unknown;
  planName?: unknown;
  answers?: {
    goal?: unknown;
    hours?: unknown;
    level?: unknown;
    ftp?: unknown;
    eventDate?: unknown;
  };
}

function isGoal(v: unknown): v is Goal {
  return typeof v === "string" && (GOALS as readonly string[]).includes(v);
}
function isLevel(v: unknown): v is Level {
  return typeof v === "string" && (LEVELS as readonly string[]).includes(v);
}
function isHours(v: unknown): v is WeeklyHours {
  return typeof v === "number" && (WEEKLY_HOURS as readonly number[]).includes(v);
}

/**
 * POST /api/method/onboarding
 *
 * Records the rider's selected training plan so the team knows which
 * TrainingPeaks block to assign. No DB write yet — we log to stdout
 * (captured by the platform) so the ops team can pick it up from the
 * runtime logs. A follow-up migration will add a `method_onboarding`
 * table and an automated email to sarah@roadmancycling.com.
 *
 * The endpoint validates the payload server-side so a tampered client
 * can't request a plan code that isn't in the matrix.
 */
export async function POST(request: Request) {
  try {
    const session = await requireMethodSession();
    const body = (await request.json().catch(() => ({}))) as OnboardingBody;

    const answers = body.answers ?? {};
    const goal = answers.goal;
    const hours = answers.hours;
    const level = answers.level;

    if (!isGoal(goal) || !isHours(hours) || !isLevel(level)) {
      return NextResponse.json(
        { error: "Missing or invalid goal, hours or level." },
        { status: 400 },
      );
    }

    const ftpRaw = answers.ftp;
    const ftp =
      typeof ftpRaw === "number" && Number.isFinite(ftpRaw) && ftpRaw > 0 && ftpRaw < 1000
        ? Math.round(ftpRaw)
        : null;

    const eventDateRaw = answers.eventDate;
    const eventDate =
      typeof eventDateRaw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(eventDateRaw)
        ? eventDateRaw
        : null;

    const result = recommend({ goal, hours, level, ftp, eventDate });

    // Cross-check the client's reported code against the server-side
    // recommendation. Mismatch means the client is stale or someone is
    // probing the endpoint — record the server's answer either way.
    const reportedCode = typeof body.planCode === "string" ? body.planCode : null;
    if (reportedCode && reportedCode !== result.plan.code) {
      console.warn(
        "[method/onboarding] client/server plan code mismatch",
        { reported: reportedCode, server: result.plan.code, eid: session.enrollment.id },
      );
    }
    if (reportedCode && !PLAN_BY_CODE.has(reportedCode)) {
      console.warn(
        "[method/onboarding] client sent unknown plan code",
        { reported: reportedCode, eid: session.enrollment.id },
      );
    }

    console.log(
      "[method/onboarding] selection recorded",
      JSON.stringify({
        enrollmentId: session.enrollment.id,
        email: session.enrollment.email,
        planCode: result.plan.code,
        planName: result.plan.name,
        goal,
        hours,
        level,
        ftp,
        eventDate,
        weeksToEvent: result.weeksToEvent,
        at: new Date().toISOString(),
      }),
    );

    return NextResponse.json({
      ok: true,
      plan: { code: result.plan.code, name: result.plan.name },
    });
  } catch (err) {
    if (err instanceof MethodAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[method/onboarding] Error:", err);
    return NextResponse.json(
      { error: "Could not save your selection. Please try again." },
      { status: 500 },
    );
  }
}

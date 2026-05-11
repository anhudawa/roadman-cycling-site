import { NextResponse } from "next/server";
import {
  MethodAuthError,
  requireMethodSession,
} from "@/lib/method/auth";
import {
  markModuleComplete,
  unmarkModuleComplete,
} from "@/lib/method/progress";
import { METHOD_MODULE_BY_SLUG } from "@/lib/method/modules";
import { isModuleUnlocked } from "@/lib/method/access";

const STR = (v: unknown, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

interface ProgressBody {
  moduleSlug: string;
  action: "complete" | "uncomplete";
}

/**
 * POST /api/method/progress
 *
 * Marks (or unmarks) a module complete for the current session's
 * enrollment. Idempotent on `complete`. Refuses to mark a still-locked
 * module to keep drip integrity — preventing a curious rider from
 * checking "complete" on week-12 from week-1 inflating the dashboard.
 */
export async function POST(request: Request) {
  try {
    const session = await requireMethodSession();
    const body = (await request.json().catch(() => ({}))) as Partial<ProgressBody>;
    const moduleSlug = STR(body.moduleSlug, 200);
    const action = body.action === "uncomplete" ? "uncomplete" : "complete";

    const module = METHOD_MODULE_BY_SLUG.get(moduleSlug);
    if (!module) {
      return NextResponse.json(
        { error: "Unknown module." },
        { status: 400 },
      );
    }

    if (action === "complete") {
      const availability = isModuleUnlocked(session.enrollment, module);
      if (!availability.unlocked) {
        return NextResponse.json(
          { error: "Module is not yet unlocked." },
          { status: 409 },
        );
      }
      const result = await markModuleComplete(session.enrollment.id, moduleSlug);
      return NextResponse.json({ ok: true, inserted: result.inserted });
    }

    await unmarkModuleComplete(session.enrollment.id, moduleSlug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof MethodAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[method/progress] Error:", err);
    return NextResponse.json(
      { error: "Could not update progress. Please try again." },
      { status: 500 },
    );
  }
}

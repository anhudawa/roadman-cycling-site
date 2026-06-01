import { NextResponse } from "next/server";
import {
  MethodAuthError,
  requireMethodSession,
} from "@/lib/method/auth";
import {
  markModuleComplete,
  unmarkModuleComplete,
} from "@/lib/method/progress";
import { getCompletedSlugs } from "@/lib/method/enrollments";
import { METHOD_MODULE_BY_SLUG, METHOD_MODULES } from "@/lib/method/modules";
import { isModuleUnlocked } from "@/lib/method/access";

/**
 * On the transition to 12/12, tag the rider `method-graduate` in Beehiiv so
 * the graduate → Not Done Yet ascension nurture sequence can fire. Best-effort
 * and fire-and-forget — graduation must never depend on the email provider.
 */
async function onGraduation(email: string, name: string | null): Promise<void> {
  try {
    const { subscribeToBeehiiv } = await import("@/lib/integrations/beehiiv");
    await subscribeToBeehiiv({
      email,
      name: name ?? "",
      tags: ["method-graduate"],
      customFields: {
        method_status: "graduated",
        method_graduated_at: new Date().toISOString(),
      },
      utm: { source: "site", medium: "method-app", campaign: "method-graduate" },
    });
  } catch (err) {
    console.error("[method/progress] graduation tag failed:", err);
  }
}

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
      // Fire the graduate hook only on the transition to all-complete, and
      // only when this call actually inserted the final completion.
      if (result.inserted) {
        const completed = await getCompletedSlugs(session.enrollment.id);
        if (completed.length >= METHOD_MODULES.length) {
          await onGraduation(session.enrollment.email, session.enrollment.name);
        }
      }
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

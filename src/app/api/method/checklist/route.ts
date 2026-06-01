import { NextResponse } from "next/server";
import { MethodAuthError, requireMethodSession } from "@/lib/method/auth";
import { saveChecklistState } from "@/lib/method/checklist";
import { METHOD_MODULES } from "@/lib/method/modules";

interface ChecklistBody {
  moduleSlug?: unknown;
  checkedIndexes?: unknown;
}

const VALID_SLUGS = new Set(METHOD_MODULES.map((m) => m.slug));

/**
 * POST /api/method/checklist
 *
 * Persists the rider's week-checklist tick state for one module, scoped to
 * their enrollment. Validates the slug against the real module manifest and
 * coerces the indexes server-side so a tampered client can't write garbage.
 * Fire-and-forget from the client — localStorage remains the instant cache.
 */
export async function POST(request: Request) {
  try {
    const session = await requireMethodSession();
    const body = (await request.json().catch(() => ({}))) as ChecklistBody;

    const moduleSlug =
      typeof body.moduleSlug === "string" ? body.moduleSlug : "";
    if (!VALID_SLUGS.has(moduleSlug)) {
      return NextResponse.json(
        { error: "Unknown module." },
        { status: 400 },
      );
    }

    const checkedIndexes = Array.isArray(body.checkedIndexes)
      ? body.checkedIndexes.filter(
          (n): n is number => typeof n === "number" && Number.isInteger(n),
        )
      : [];

    await saveChecklistState({
      enrollmentId: session.enrollment.id,
      moduleSlug,
      checkedIndexes,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof MethodAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[method/checklist] Error:", err);
    return NextResponse.json(
      { error: "Could not save your checklist." },
      { status: 500 },
    );
  }
}

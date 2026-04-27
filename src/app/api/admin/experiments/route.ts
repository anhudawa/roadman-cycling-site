import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/admin/auth";
import type { ABTest, ABVariant, ABElementType } from "@/lib/ab/types";

// ── Database helpers (graceful fallback) ─────────────────

async function getDb() {
  try {
    const { db } = await import("@/lib/db");
    const { abTests } = await import("@/lib/db/schema");
    return { db, abTests };
  } catch {
    return null;
  }
}

async function getAllExperiments(): Promise<ABTest[]> {
  try {
    const deps = await getDb();
    if (!deps) return [];

    const { db, abTests } = deps;
    const rows = await db.select().from(abTests);

    return rows.map((row) => ({
      id: `exp_${row.id}`,
      name: row.name,
      page: row.page,
      element: row.element as ABElementType,
      variants: (row.variants ?? []) as ABVariant[],
      status: row.status as ABTest["status"],
      startedAt: row.startedAt?.toISOString(),
      endedAt: row.endedAt?.toISOString(),
      winnerVariantId: row.winnerVariantId ?? undefined,
      createdBy: row.createdBy as ABTest["createdBy"],
    }));
  } catch (err) {
    console.error("[Experiments] DB read error:", err);
    return [];
  }
}

async function insertExperiment(experiment: ABTest): Promise<boolean> {
  try {
    const deps = await getDb();
    if (!deps) return false;

    const { db, abTests } = deps;
    await db.insert(abTests).values({
      name: experiment.name,
      page: experiment.page,
      element: experiment.element,
      variants: experiment.variants,
      status: experiment.status,
      startedAt: experiment.startedAt ? new Date(experiment.startedAt) : null,
      endedAt: experiment.endedAt ? new Date(experiment.endedAt) : null,
      winnerVariantId: experiment.winnerVariantId ?? null,
      createdBy: experiment.createdBy,
    });
    return true;
  } catch (err) {
    console.error("[Experiments] DB insert error:", err);
    return false;
  }
}

async function updateExperimentStatus(
  id: number,
  updates: { status?: string; startedAt?: Date; endedAt?: Date; winnerVariantId?: string; completedBy?: string }
): Promise<boolean> {
  try {
    const deps = await getDb();
    if (!deps) return false;

    const { db, abTests } = deps;
    const { eq } = await import("drizzle-orm");
    await db.update(abTests).set(updates).where(eq(abTests.id, id));
    return true;
  } catch (err) {
    console.error("[Experiments] DB update error:", err);
    return false;
  }
}

async function deleteExperiment(id: number): Promise<boolean> {
  try {
    const deps = await getDb();
    if (!deps) return false;

    const { db, abTests } = deps;
    const { eq } = await import("drizzle-orm");
    await db.delete(abTests).where(eq(abTests.id, id));
    return true;
  } catch (err) {
    console.error("[Experiments] DB delete error:", err);
    return false;
  }
}

// ── Auth helper ──────────────────────────────────────────

/**
 * Authorize either an automated cron caller (Bearer CRON_SECRET) or a real
 * admin session. The cookie is verified — presence alone is not enough.
 */
async function isAuthorized(req: NextRequest): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader === `Bearer ${cronSecret}`) return true;
  }
  const user = await getCurrentUser();
  return user !== null;
}

// ── Route handlers ───────────────────────────────────────

export async function GET(req: NextRequest) {
  const authorized = await isAuthorized(req);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const experiments = await getAllExperiments();

  // Sort: running first, then draft, then completed
  const statusOrder: Record<string, number> = { running: 0, draft: 1, completed: 2 };
  experiments.sort(
    (a, b) => (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3)
  );

  return NextResponse.json({ ok: true, experiments });
}

export async function POST(req: NextRequest) {
  const authorized = await isAuthorized(req);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const {
      name,
      page,
      element,
      variants,
      createdBy,
    }: {
      name: string;
      page: string;
      element: ABElementType;
      variants: Omit<ABVariant, "id">[];
      createdBy?: "manual" | "agent";
    } = body;

    if (!name || !page || !element || !variants?.length) {
      return NextResponse.json(
        { error: "Missing required fields: name, page, element, variants" },
        { status: 400 }
      );
    }

    const id = `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const experiment: ABTest = {
      id,
      name,
      page,
      element,
      variants: variants.map((v, i) => ({
        id: `var_${id}_${i}`,
        label: v.label,
        content: v.content,
      })),
      status: "draft",
      createdBy: createdBy ?? "manual",
    };

    const saved = await insertExperiment(experiment);
    if (!saved) {
      return NextResponse.json(
        { error: "Database not available. Experiment was not saved." },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true, experiment }, { status: 201 });
  } catch (err) {
    console.error("[Experiments] POST error:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const authorized = await isAuthorized(req);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, action, winnerVariantId, completedBy } = body as {
      id: string;
      action: "start" | "stop" | "declare_winner";
      winnerVariantId?: string;
      completedBy?: string;
    };

    if (!id || !action) {
      return NextResponse.json(
        { error: "Missing required fields: id, action" },
        { status: 400 }
      );
    }

    // Extract numeric DB id from "exp_123" format
    const numericId = parseInt(id.replace("exp_", ""), 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid experiment id" }, { status: 400 });
    }

    let updates: { status?: string; startedAt?: Date; endedAt?: Date; winnerVariantId?: string; completedBy?: string } = {};

    switch (action) {
      case "start":
        updates = { status: "running", startedAt: new Date() };
        break;
      case "stop":
        updates = { status: "completed", endedAt: new Date() };
        break;
      case "declare_winner":
        if (!winnerVariantId) {
          return NextResponse.json(
            { error: "winnerVariantId required for declare_winner action" },
            { status: 400 }
          );
        }
        updates = {
          status: "completed",
          endedAt: new Date(),
          winnerVariantId,
          completedBy: completedBy ?? "manual",
        };
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const success = await updateExperimentStatus(numericId, updates);
    if (!success) {
      return NextResponse.json(
        { error: "Database not available or experiment not found." },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Experiments] PATCH error:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const authorized = await isAuthorized(req);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    const numericId = parseInt(id.replace("exp_", ""), 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid experiment id" }, { status: 400 });
    }

    const success = await deleteExperiment(numericId);
    if (!success) {
      return NextResponse.json(
        { error: "Database not available or experiment not found." },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Experiments] DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to delete experiment" },
      { status: 500 }
    );
  }
}

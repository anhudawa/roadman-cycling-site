import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tedKillSwitch } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

async function loadOrSeed() {
  const rows = await db.select().from(tedKillSwitch).where(eq(tedKillSwitch.id, 1)).limit(1);
  if (rows[0]) return rows[0];
  await db.insert(tedKillSwitch).values({ id: 1, paused: false });
  const fresh = await db.select().from(tedKillSwitch).where(eq(tedKillSwitch.id, 1)).limit(1);
  return fresh[0];
}

// GET /api/admin/ted/kill-switch — current state
export async function GET() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const state = await loadOrSeed();
  return NextResponse.json({ state });
}

// POST /api/admin/ted/kill-switch — update state
// Body: { paused?: boolean, reason?: string, postPromptEnabled?: boolean, postWelcomeEnabled?: boolean, surfaceThreadsEnabled?: boolean }
export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    paused?: boolean;
    reason?: string | null;
    postPromptEnabled?: boolean;
    postWelcomeEnabled?: boolean;
    surfaceThreadsEnabled?: boolean;
  };

  await loadOrSeed();

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.paused === "boolean") {
    patch.paused = body.paused;
    patch.pausedBySlug = body.paused ? user.slug : null;
    patch.pausedAt = body.paused ? new Date() : null;
    patch.reason = body.reason ?? null;
  }
  if (typeof body.postPromptEnabled === "boolean") patch.postPromptEnabled = body.postPromptEnabled;
  if (typeof body.postWelcomeEnabled === "boolean") patch.postWelcomeEnabled = body.postWelcomeEnabled;
  if (typeof body.surfaceThreadsEnabled === "boolean")
    patch.surfaceThreadsEnabled = body.surfaceThreadsEnabled;

  await db.update(tedKillSwitch).set(patch).where(eq(tedKillSwitch.id, 1));

  const state = await loadOrSeed();
  return NextResponse.json({ ok: true, state });
}

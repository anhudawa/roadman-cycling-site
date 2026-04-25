import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  tedDrafts,
  tedWelcomeQueue,
  tedSurfaceDrafts,
} from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import {
  SAMPLE_PROMPTS,
  SAMPLE_WELCOMES,
  SAMPLE_SURFACES,
  SAMPLE_VOICE_CHECK_MARKER,
} from "@/lib/ted/sample-posts";

export const dynamic = "force-dynamic";

// POST $— insert the sample posts so the reviewer can try the approval flow.
// Idempotent: each sample has a stable key, so running twice won't duplicate.
export async function POST() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let prompts = 0;
    let welcomes = 0;
    let surfaces = 0;

    for (const s of SAMPLE_PROMPTS) {
      // Skip if a draft already exists for this date+pillar+body (stable key)
      const existing = await db
        .select({ id: tedDrafts.id })
        .from(tedDrafts)
        .where(
          sql`${tedDrafts.scheduledFor} = ${s.scheduledFor} AND ${tedDrafts.pillar} = ${s.pillar} AND ${tedDrafts.originalBody} = ${s.body}`
        )
        .limit(1);
      if (existing.length > 0) continue;
      await db.insert(tedDrafts).values({
        pillar: s.pillar,
        scheduledFor: s.scheduledFor,
        status: "draft",
        originalBody: s.body,
        voiceCheck: SAMPLE_VOICE_CHECK_MARKER as unknown as Record<string, unknown>,
        generationAttempts: 1,
      });
      prompts += 1;
    }

    for (const s of SAMPLE_WELCOMES) {
      const existing = await db
        .select({ email: tedWelcomeQueue.memberEmail })
        .from(tedWelcomeQueue)
        .where(eq(tedWelcomeQueue.memberEmail, s.memberEmail))
        .limit(1);
      if (existing.length > 0) continue;
      await db.insert(tedWelcomeQueue).values({
        memberEmail: s.memberEmail,
        firstName: s.firstName,
        persona: s.persona,
        draftBody: s.draftBody,
        voiceCheck: SAMPLE_VOICE_CHECK_MARKER as unknown as Record<string, unknown>,
        status: "drafted",
      });
      welcomes += 1;
    }

    for (const s of SAMPLE_SURFACES) {
      const existing = await db
        .select({ id: tedSurfaceDrafts.id })
        .from(tedSurfaceDrafts)
        .where(eq(tedSurfaceDrafts.skoolPostId, s.skoolPostId))
        .limit(1);
      if (existing.length > 0) continue;
      await db.insert(tedSurfaceDrafts).values({
        skoolPostId: s.skoolPostId,
        threadUrl: s.threadUrl,
        threadAuthor: s.threadAuthor,
        threadTitle: s.threadTitle,
        threadBody: s.threadBody,
        surfaceType: s.surfaceType,
        originalBody: s.body,
        status: "drafted",
        voiceCheck: SAMPLE_VOICE_CHECK_MARKER as unknown as Record<string, unknown>,
      });
      surfaces += 1;
    }

    return NextResponse.json({
      ok: true,
      inserted: { prompts, welcomes, surfaces },
      total: prompts + welcomes + surfaces,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const migrationsNeeded =
      msg.includes("42P01") ||
      msg.toLowerCase().includes("does not exist") ||
      msg.toLowerCase().includes("relation");
    return NextResponse.json(
      {
        error: msg,
        migrationsNeeded,
        hint: migrationsNeeded
          ? "Run npm run db:migrate or apply drizzle/0019 + 0020 in Vercel Postgres first."
          : undefined,
      },
      { status: migrationsNeeded ? 503 : 500 }
    );
  }
}

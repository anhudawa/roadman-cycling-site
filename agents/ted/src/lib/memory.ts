import { db, schema } from "./db.js";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import type { SurfaceType, VoiceCheckResult } from "../types.js";
import type { Pillar } from "../config.js";

// ── Draft prompts ─────────────────────────────────────────────

export async function insertDraft(params: {
  pillar: Pillar;
  scheduledFor: string; // YYYY-MM-DD
  body: string;
  voiceCheck: VoiceCheckResult;
  attempts: number;
  voiceFlagged: boolean;
}): Promise<number> {
  const [row] = await db
    .insert(schema.tedDrafts)
    .values({
      pillar: params.pillar,
      scheduledFor: params.scheduledFor,
      status: params.voiceFlagged ? "voice_flagged" : "draft",
      originalBody: params.body,
      voiceCheck: params.voiceCheck as unknown as Record<string, unknown>,
      generationAttempts: params.attempts,
    })
    .returning({ id: schema.tedDrafts.id });
  return row.id;
}

export async function getDraftForDate(date: string) {
  const rows = await db
    .select()
    .from(schema.tedDrafts)
    .where(eq(schema.tedDrafts.scheduledFor, date))
    .orderBy(desc(schema.tedDrafts.id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getNextApprovedDraft(onOrBeforeDate: string) {
  const rows = await db
    .select()
    .from(schema.tedDrafts)
    .where(
      and(
        inArray(schema.tedDrafts.status, ["approved", "edited"]),
        sql`${schema.tedDrafts.scheduledFor} <= ${onOrBeforeDate}`
      )
    )
    .orderBy(schema.tedDrafts.scheduledFor)
    .limit(1);
  return rows[0] ?? null;
}

export async function markDraftPosted(
  id: number,
  skoolPostUrl: string
): Promise<void> {
  await db
    .update(schema.tedDrafts)
    .set({
      status: "posted",
      postedAt: new Date(),
      skoolPostUrl,
      updatedAt: new Date(),
    })
    .where(eq(schema.tedDrafts.id, id));
}

export async function markDraftFailed(
  id: number,
  reason: string
): Promise<void> {
  await db
    .update(schema.tedDrafts)
    .set({
      status: "failed",
      failureReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(schema.tedDrafts.id, id));
}

// ── Welcomes ─────────────────────────────────────────────────

export async function listPendingWelcomes(limit = 25) {
  return db
    .select()
    .from(schema.tedWelcomeQueue)
    .where(eq(schema.tedWelcomeQueue.status, "pending"))
    .orderBy(schema.tedWelcomeQueue.createdAt)
    .limit(limit);
}

/** Welcomes ready for the Playwright poster — only ones a human approved. */
export async function listApprovedWelcomes(limit = 25) {
  return db
    .select()
    .from(schema.tedWelcomeQueue)
    .where(eq(schema.tedWelcomeQueue.status, "approved"))
    .orderBy(schema.tedWelcomeQueue.createdAt)
    .limit(limit);
}

export async function updateWelcomeDraft(params: {
  memberEmail: string;
  draftBody: string;
  voiceCheck: VoiceCheckResult;
  voiceFlagged: boolean;
}): Promise<void> {
  await db
    .update(schema.tedWelcomeQueue)
    .set({
      draftBody: params.draftBody,
      voiceCheck: params.voiceCheck as unknown as Record<string, unknown>,
      status: params.voiceFlagged ? "failed" : "drafted",
      failureReason: params.voiceFlagged
        ? "voice-check failed after retries"
        : null,
    })
    .where(eq(schema.tedWelcomeQueue.memberEmail, params.memberEmail));
}

export async function markWelcomePosted(
  memberEmail: string,
  skoolPostUrl: string
): Promise<void> {
  await db
    .update(schema.tedWelcomeQueue)
    .set({
      status: "posted",
      postedAt: new Date(),
      skoolPostUrl,
    })
    .where(eq(schema.tedWelcomeQueue.memberEmail, memberEmail));
}

export async function enqueueWelcome(params: {
  memberEmail: string;
  memberId?: string;
  firstName: string;
  persona?: string;
  questionnaireAnswers?: string[];
}): Promise<void> {
  // Idempotent: if the email is already in the queue, do nothing.
  const existing = await db
    .select({ email: schema.tedWelcomeQueue.memberEmail })
    .from(schema.tedWelcomeQueue)
    .where(eq(schema.tedWelcomeQueue.memberEmail, params.memberEmail))
    .limit(1);
  if (existing.length > 0) return;

  await db.insert(schema.tedWelcomeQueue).values({
    memberEmail: params.memberEmail,
    memberId: params.memberId ?? null,
    firstName: params.firstName,
    persona: params.persona ?? null,
    questionnaireAnswers: params.questionnaireAnswers
      ? (params.questionnaireAnswers as unknown as Record<string, unknown>)
      : null,
    status: "pending",
  });
}

// ── Surfaced threads ─────────────────────────────────────────

export async function hasSurfacedRecently(
  skoolPostId: string,
  windowHours = 48
): Promise<boolean> {
  const cutoff = new Date(Date.now() - windowHours * 60 * 60 * 1000);
  const rows = await db
    .select({ id: schema.tedSurfaced.id })
    .from(schema.tedSurfaced)
    .where(
      and(
        eq(schema.tedSurfaced.skoolPostId, skoolPostId),
        gte(schema.tedSurfaced.surfacedAt, cutoff)
      )
    )
    .limit(1);
  return rows.length > 0;
}

export async function recordSurfaced(params: {
  skoolPostId: string;
  surfaceType: SurfaceType;
  body: string;
  skoolReplyUrl?: string;
}): Promise<void> {
  await db.insert(schema.tedSurfaced).values({
    skoolPostId: params.skoolPostId,
    surfaceType: params.surfaceType,
    body: params.body,
    skoolReplyUrl: params.skoolReplyUrl ?? null,
  });
}

// ── Active members ───────────────────────────────────────────

export async function listActiveMembers(topicTags: string[] = [], limit = 20) {
  if (topicTags.length === 0) {
    return db
      .select()
      .from(schema.tedActiveMembers)
      .orderBy(desc(schema.tedActiveMembers.lastSeenAt))
      .limit(limit);
  }
  // overlap with any tag
  return db
    .select()
    .from(schema.tedActiveMembers)
    .where(sql`${schema.tedActiveMembers.topicTags} && ARRAY[${sql.join(
      topicTags.map((t) => sql`${t}`),
      sql`, `
    )}]::text[]`)
    .orderBy(desc(schema.tedActiveMembers.lastSeenAt))
    .limit(limit);
}

export async function upsertActiveMember(params: {
  memberId: string;
  firstName: string;
  topicTags: string[];
}): Promise<void> {
  await db
    .insert(schema.tedActiveMembers)
    .values({
      memberId: params.memberId,
      firstName: params.firstName,
      topicTags: params.topicTags,
      postCount: 1,
    })
    .onConflictDoUpdate({
      target: schema.tedActiveMembers.memberId,
      set: {
        lastSeenAt: new Date(),
        topicTags: params.topicTags,
        postCount: sql`${schema.tedActiveMembers.postCount} + 1`,
      },
    });
}

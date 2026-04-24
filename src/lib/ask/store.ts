import { eq, sql, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { askSessions, askMessages, askRetrievals } from "@/lib/db/schema";
import type { Citation, RetrievedChunk, SourceType } from "./types";

export interface AskSessionRow {
  id: string;
  riderProfileId: number | null;
  anonSessionKey: string | null;
  startedAt: Date;
  lastActivityAt: Date;
  messageCount: number;
  ipHash: string | null;
  userAgent: string | null;
  utmSource: string | null;
  utmCampaign: string | null;
}

export interface CreateSessionInput {
  riderProfileId?: number | null;
  anonSessionKey?: string | null;
  ipHash?: string | null;
  userAgent?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
}

export async function createSession(input: CreateSessionInput): Promise<AskSessionRow> {
  const [row] = await db
    .insert(askSessions)
    .values({
      riderProfileId: input.riderProfileId ?? null,
      anonSessionKey: input.anonSessionKey ?? null,
      ipHash: input.ipHash ?? null,
      userAgent: input.userAgent ?? null,
      utmSource: input.utmSource ?? null,
      utmCampaign: input.utmCampaign ?? null,
    })
    .returning();
  return row as AskSessionRow;
}

export async function loadSession(id: string): Promise<AskSessionRow | null> {
  const [row] = await db.select().from(askSessions).where(eq(askSessions.id, id)).limit(1);
  return (row ?? null) as AskSessionRow | null;
}

export async function loadSessionByAnonKey(anonKey: string): Promise<AskSessionRow | null> {
  const [row] = await db
    .select()
    .from(askSessions)
    .where(eq(askSessions.anonSessionKey, anonKey))
    .orderBy(desc(askSessions.lastActivityAt))
    .limit(1);
  return (row ?? null) as AskSessionRow | null;
}

export async function loadSessionByRiderProfile(riderProfileId: number): Promise<AskSessionRow | null> {
  const [row] = await db
    .select()
    .from(askSessions)
    .where(eq(askSessions.riderProfileId, riderProfileId))
    .orderBy(desc(askSessions.lastActivityAt))
    .limit(1);
  return (row ?? null) as AskSessionRow | null;
}

export async function touchSession(id: string): Promise<AskSessionRow> {
  const [row] = await db
    .update(askSessions)
    .set({ lastActivityAt: new Date() })
    .where(eq(askSessions.id, id))
    .returning();
  return row as AskSessionRow;
}

export interface AppendMessageInput {
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[] | null;
  ctaRecommended?: string | null;
  safetyFlags?: string[] | null;
  confidence?: "high" | "medium" | "low" | null;
  model?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  latencyMs?: number | null;
  flaggedForReview?: boolean;
}

export interface AskMessageRow {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  citations: Citation[] | null;
  ctaRecommended: string | null;
  safetyFlags: string[] | null;
  confidence: string | null;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number | null;
  flaggedForReview: boolean;
  adminNote: string | null;
  adminPreferredAnswer: string | null;
  createdAt: Date;
}

export async function appendMessage(input: AppendMessageInput): Promise<AskMessageRow> {
  const [msg] = await db
    .insert(askMessages)
    .values({
      sessionId: input.sessionId,
      role: input.role,
      content: input.content,
      citations: input.citations ?? null,
      ctaRecommended: input.ctaRecommended ?? null,
      safetyFlags: input.safetyFlags ?? null,
      confidence: input.confidence ?? null,
      model: input.model ?? null,
      inputTokens: input.inputTokens ?? null,
      outputTokens: input.outputTokens ?? null,
      latencyMs: input.latencyMs ?? null,
      flaggedForReview: input.flaggedForReview ?? false,
    })
    .returning();

  await db
    .update(askSessions)
    .set({
      messageCount: sql`${askSessions.messageCount} + 1`,
      lastActivityAt: new Date(),
    })
    .where(eq(askSessions.id, input.sessionId));

  return msg as AskMessageRow;
}

export async function listSessionMessages(sessionId: string, limit = 50): Promise<AskMessageRow[]> {
  const rows = await db
    .select()
    .from(askMessages)
    .where(eq(askMessages.sessionId, sessionId))
    .orderBy(askMessages.createdAt)
    .limit(limit);
  return rows as AskMessageRow[];
}

export interface RetrievalItem {
  sourceType: SourceType;
  sourceId: string;
  chunkText?: string | null;
  score?: number | null;
  usedInAnswer?: boolean;
}

export async function appendRetrievals(args: {
  messageId: string;
  items: RetrievalItem[];
}): Promise<Array<{ id: string; messageId: string }>> {
  if (args.items.length === 0) return [];
  const rows = await db
    .insert(askRetrievals)
    .values(
      args.items.map((it) => ({
        messageId: args.messageId,
        sourceType: it.sourceType,
        sourceId: it.sourceId,
        chunkText: it.chunkText ?? null,
        score: it.score != null ? String(it.score) : null,
        usedInAnswer: it.usedInAnswer ?? false,
      })),
    )
    .returning({ id: askRetrievals.id, messageId: askRetrievals.messageId });
  return rows;
}

export async function flagMessage(messageId: string, reason?: string): Promise<void> {
  await db
    .update(askMessages)
    .set({
      flaggedForReview: true,
      adminNote: reason ?? null,
    })
    .where(eq(askMessages.id, messageId));
}

export function chunkToRetrievalItem(chunk: RetrievedChunk, usedInAnswer: boolean): RetrievalItem {
  return {
    sourceType: chunk.sourceType,
    sourceId: chunk.sourceId,
    chunkText: chunk.excerpt,
    score: chunk.score,
    usedInAnswer,
  };
}

"use server";

import { db } from "@/lib/db";
import { repurposedEpisodes, repurposedContent, contentChatMessages } from "@/lib/db/schema";
import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const REVALIDATE_PATH = "/admin/content/repurposed";

// ---------------------------------------------------------------------------
// Episode queries
// ---------------------------------------------------------------------------

export async function getEpisodes(filter?: string) {
  const episodes = await db
    .select({
      id: repurposedEpisodes.id,
      episodeSlug: repurposedEpisodes.episodeSlug,
      episodeTitle: repurposedEpisodes.episodeTitle,
      episodeNumber: repurposedEpisodes.episodeNumber,
      pillar: repurposedEpisodes.pillar,
      status: repurposedEpisodes.status,
      generatedAt: repurposedEpisodes.generatedAt,
      createdAt: repurposedEpisodes.createdAt,
      updatedAt: repurposedEpisodes.updatedAt,
      totalContent: sql<number>`count(${repurposedContent.id})::int`,
      approvedContent: sql<number>`count(${repurposedContent.id}) filter (where ${repurposedContent.status} = 'approved')::int`,
    })
    .from(repurposedEpisodes)
    .leftJoin(repurposedContent, eq(repurposedContent.episodeId, repurposedEpisodes.id))
    .groupBy(repurposedEpisodes.id)
    .orderBy(desc(repurposedEpisodes.generatedAt))
    .$dynamic();

  // Apply status filter in JS after fetching — keeps the query simple and avoids
  // $dynamic() chaining issues with conditional where clauses.
  if (filter && filter !== "all") {
    const filtered = await db
      .select({
        id: repurposedEpisodes.id,
        episodeSlug: repurposedEpisodes.episodeSlug,
        episodeTitle: repurposedEpisodes.episodeTitle,
        episodeNumber: repurposedEpisodes.episodeNumber,
        pillar: repurposedEpisodes.pillar,
        status: repurposedEpisodes.status,
        generatedAt: repurposedEpisodes.generatedAt,
        createdAt: repurposedEpisodes.createdAt,
        updatedAt: repurposedEpisodes.updatedAt,
        totalContent: sql<number>`count(${repurposedContent.id})::int`,
        approvedContent: sql<number>`count(${repurposedContent.id}) filter (where ${repurposedContent.status} = 'approved')::int`,
      })
      .from(repurposedEpisodes)
      .leftJoin(repurposedContent, eq(repurposedContent.episodeId, repurposedEpisodes.id))
      .where(eq(repurposedEpisodes.status, filter))
      .groupBy(repurposedEpisodes.id)
      .orderBy(desc(repurposedEpisodes.generatedAt));
    return filtered;
  }

  return episodes;
}

export async function getEpisodeDetail(episodeId: number) {
  const [episode] = await db
    .select()
    .from(repurposedEpisodes)
    .where(eq(repurposedEpisodes.id, episodeId));

  if (!episode) return null;

  const contentPieces = await db
    .select({
      id: repurposedContent.id,
      episodeId: repurposedContent.episodeId,
      contentType: repurposedContent.contentType,
      content: repurposedContent.content,
      status: repurposedContent.status,
      version: repurposedContent.version,
      createdAt: repurposedContent.createdAt,
      updatedAt: repurposedContent.updatedAt,
      chatMessageCount: sql<number>`count(${contentChatMessages.id})::int`,
    })
    .from(repurposedContent)
    .leftJoin(contentChatMessages, eq(contentChatMessages.contentId, repurposedContent.id))
    .where(eq(repurposedContent.episodeId, episodeId))
    .groupBy(repurposedContent.id)
    .orderBy(repurposedContent.contentType);

  return { episode, contentPieces };
}

// ---------------------------------------------------------------------------
// Episode status helpers
// ---------------------------------------------------------------------------

async function recalculateEpisodeStatus(episodeId: number) {
  const siblings = await db
    .select({ status: repurposedContent.status })
    .from(repurposedContent)
    .where(eq(repurposedContent.episodeId, episodeId));

  const total = siblings.length;
  if (total === 0) return;

  const approvedCount = siblings.filter((s) => s.status === "approved").length;
  const rejectedCount = siblings.filter((s) => s.status === "rejected").length;

  let episodeStatus: string;
  if (approvedCount === total) {
    episodeStatus = "approved";
  } else if (approvedCount + rejectedCount === total && approvedCount > 0) {
    // All reviewed but not all approved
    episodeStatus = "partial";
  } else if (approvedCount > 0) {
    episodeStatus = "partial";
  } else {
    episodeStatus = "pending";
  }

  await db
    .update(repurposedEpisodes)
    .set({ status: episodeStatus, updatedAt: new Date() })
    .where(eq(repurposedEpisodes.id, episodeId));
}

// ---------------------------------------------------------------------------
// Content mutations
// ---------------------------------------------------------------------------

export async function approveContent(contentId: number) {
  const [piece] = await db
    .select({ episodeId: repurposedContent.episodeId })
    .from(repurposedContent)
    .where(eq(repurposedContent.id, contentId));

  if (!piece) throw new Error("Content not found");

  await db
    .update(repurposedContent)
    .set({ status: "approved", updatedAt: new Date() })
    .where(eq(repurposedContent.id, contentId));

  await recalculateEpisodeStatus(piece.episodeId);
  revalidatePath(REVALIDATE_PATH);
}

export async function rejectContent(contentId: number) {
  const [piece] = await db
    .select({ episodeId: repurposedContent.episodeId })
    .from(repurposedContent)
    .where(eq(repurposedContent.id, contentId));

  if (!piece) throw new Error("Content not found");

  await db
    .update(repurposedContent)
    .set({ status: "rejected", updatedAt: new Date() })
    .where(eq(repurposedContent.id, contentId));

  await recalculateEpisodeStatus(piece.episodeId);
  revalidatePath(REVALIDATE_PATH);
}

export async function approveAllContent(episodeId: number) {
  await db
    .update(repurposedContent)
    .set({ status: "approved", updatedAt: new Date() })
    .where(
      and(
        eq(repurposedContent.episodeId, episodeId),
        inArray(repurposedContent.status, ["pending", "amended"]),
      ),
    );

  await db
    .update(repurposedEpisodes)
    .set({ status: "approved", updatedAt: new Date() })
    .where(eq(repurposedEpisodes.id, episodeId));

  revalidatePath(REVALIDATE_PATH);
}

// ---------------------------------------------------------------------------
// Chat history
// ---------------------------------------------------------------------------

export async function getChatHistory(contentId: number) {
  return db
    .select()
    .from(contentChatMessages)
    .where(eq(contentChatMessages.contentId, contentId))
    .orderBy(contentChatMessages.createdAt);
}

// ---------------------------------------------------------------------------
// Manual content edits
// ---------------------------------------------------------------------------

export async function updateContentText(contentId: number, newContent: string) {
  const [piece] = await db
    .select({ version: repurposedContent.version, episodeId: repurposedContent.episodeId })
    .from(repurposedContent)
    .where(eq(repurposedContent.id, contentId));

  if (!piece) throw new Error("Content not found");

  await db
    .update(repurposedContent)
    .set({
      content: newContent,
      status: "amended",
      version: piece.version + 1,
      updatedAt: new Date(),
    })
    .where(eq(repurposedContent.id, contentId));

  await recalculateEpisodeStatus(piece.episodeId);
  revalidatePath(REVALIDATE_PATH);
}

import { db } from "@/lib/db";
import { mcpExperts, mcpExpertQuotes, mcpEpisodes } from "@/lib/db/schema";
import { eq, ilike, desc } from "drizzle-orm";

export async function listExperts() {
  const rows = await db
    .select()
    .from(mcpExperts)
    .orderBy(desc(mcpExperts.appearanceCount));

  return rows.map((e) => ({
    name: e.name,
    credentials: e.credentials,
    specialty: e.specialty,
    appearance_count: e.appearanceCount,
    latest_appearance: e.latestAppearance?.toISOString() ?? null,
  }));
}

export async function getExpertInsights(
  expertName: string,
  _topic?: string,
  limit = 5
) {
  const expertRows = await db
    .select()
    .from(mcpExperts)
    .where(ilike(mcpExperts.name, `%${expertName}%`))
    .limit(1);

  if (expertRows.length === 0) return [];

  const expert = expertRows[0];

  const quoteRows = await db
    .select({
      quote: mcpExpertQuotes.quote,
      episode_id: mcpExpertQuotes.episodeId,
      context: mcpExpertQuotes.context,
      topic_tags: mcpExpertQuotes.topicTags,
      episode_title: mcpEpisodes.title,
    })
    .from(mcpExpertQuotes)
    .leftJoin(mcpEpisodes, eq(mcpExpertQuotes.episodeId, mcpEpisodes.id))
    .where(eq(mcpExpertQuotes.expertId, expert.id))
    .limit(limit);

  return quoteRows.map((r) => ({
    quote: r.quote,
    episode_id: r.episode_id,
    episode_title: r.episode_title ?? null,
    context: r.context,
    topic_tags: r.topic_tags ?? [],
  }));
}

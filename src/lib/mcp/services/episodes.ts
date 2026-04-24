import { db } from "@/lib/db";
import { mcpEpisodes, mcpEpisodeEmbeddings } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { embedQuery } from "../embeddings";

export interface EpisodeSearchResult {
  episode_id: number;
  title: string;
  guest: string | null;
  published_at: string | null;
  excerpt: string;
  relevance_score: number;
  url: string | null;
}

export async function searchEpisodes(
  query: string,
  limit = 5,
  guestName?: string,
  _topic?: string
): Promise<EpisodeSearchResult[]> {
  const embedding = await embedQuery(query);
  const embeddingStr = `[${embedding.join(",")}]`;

  const guestFilter = guestName
    ? sql`AND LOWER(e.guest_name) LIKE ${"%" + guestName.toLowerCase() + "%"}`
    : sql``;

  const rows = await db.execute(sql`
    SELECT
      e.id         AS episode_id,
      e.title,
      e.guest_name AS guest,
      e.published_at,
      ee.chunk_text AS excerpt,
      1 - (ee.embedding <=> ${embeddingStr}::vector) AS relevance_score,
      e.url
    FROM mcp_episode_embeddings ee
    JOIN mcp_episodes e ON e.id = ee.episode_id
    WHERE TRUE ${guestFilter}
    ORDER BY ee.embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `);

  return (rows.rows as Record<string, unknown>[]).map((r) => ({
    episode_id: r.episode_id as number,
    title: r.title as string,
    guest: (r.guest as string) ?? null,
    published_at: r.published_at ? String(r.published_at) : null,
    excerpt: r.excerpt as string,
    relevance_score: Number(r.relevance_score),
    url: (r.url as string) ?? null,
  }));
}

export async function getEpisode(episodeId: number) {
  const rows = await db
    .select()
    .from(mcpEpisodes)
    .where(eq(mcpEpisodes.id, episodeId))
    .limit(1);

  if (rows.length === 0) return null;
  const e = rows[0];

  return {
    id: e.id,
    title: e.title,
    guest: e.guestName,
    published_at: e.publishedAt?.toISOString() ?? null,
    duration_sec: e.durationSec,
    summary: e.summary,
    key_insights: (e.keyInsights as string[]) ?? [],
    audio_url: e.audioUrl,
    youtube_url: e.youtubeUrl,
    url: e.url,
  };
}

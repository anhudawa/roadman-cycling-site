import { db } from "@/lib/db";
import { mcpEpisodes } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { embedQuery } from "../embeddings";

export async function searchMethodology(query: string) {
  const embedding = await embedQuery(query);
  const embeddingStr = `[${embedding.join(",")}]`;

  const rows = await db.execute(sql`
    SELECT
      p.id,
      p.principle,
      p.explanation,
      p.topic_tags,
      p.supporting_expert_names,
      p.supporting_episode_ids,
      1 - (me.embedding <=> ${embeddingStr}::vector) AS relevance_score
    FROM mcp_methodology_embeddings me
    JOIN mcp_methodology_principles p ON p.id = me.principle_id
    ORDER BY me.embedding <=> ${embeddingStr}::vector
    LIMIT 5
  `);

  return Promise.all(
    (rows.rows as Record<string, unknown>[]).map(async (r) => {
      const episodeIds = (r.supporting_episode_ids as number[] | null) ?? [];
      let episodeCitations: { episode_id: number; title: string }[] = [];

      if (episodeIds.length > 0) {
        const eps = await db
          .select({ id: mcpEpisodes.id, title: mcpEpisodes.title })
          .from(mcpEpisodes)
          .where(sql`id = ANY(${episodeIds}::integer[])`);
        episodeCitations = eps.map((e) => ({
          episode_id: e.id,
          title: e.title,
        }));
      }

      return {
        principle: r.principle as string,
        explanation: r.explanation as string,
        supporting_experts:
          (r.supporting_expert_names as string[] | null) ?? [],
        episode_citations: episodeCitations,
      };
    })
  );
}

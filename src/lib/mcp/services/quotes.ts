/**
 * Expert-quote retrieval for Ask Roadman.
 *
 * Searches the structured-extraction tables (`quotes` and `claims`) by vector
 * similarity against `quote_embeddings` / `claim_embeddings` (populated by
 * scripts/generate-mcp-embeddings.ts), and returns verbatim, attributable
 * statements that flow through the orchestrator as the `expert_quote` source
 * type.
 *
 * Two editorial guarantees, both enforced here in SQL:
 *   1. `reviewed = true` — the extractor writes unreviewed rows; only rows an
 *      editor has approved are allowed to surface on the public /ask endpoint.
 *   2. Verbatim only — quotes use their `quote`; claims only surface when they
 *      carry a `supporting_quote` (the exact transcript words) and a named
 *      speaker, so a paraphrased claim is never presented as a direct quote.
 *
 * One query embedding, one round trip: quotes and claims are unioned and
 * ranked together, then joined to `mcp_episodes` (best-effort, by slug) for
 * the episode title + canonical URL used in the citation.
 */

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { embedQuery } from "../embeddings";

export interface ExpertQuoteResult {
  /** Which extraction table the row came from. */
  source: "quote" | "claim";
  id: number;
  speaker: string;
  credential: string | null;
  episodeSlug: string;
  episodeTitle: string | null;
  /** Canonical episode URL when the slug matches an mcp_episodes row. */
  episodeUrl: string | null;
  /** Verbatim text: the quote, or a claim's supporting_quote. */
  text: string;
  /** Transcript time reference (e.g. "12:34"), when captured. */
  timestamp: string | null;
  relevance_score: number;
}

export async function searchExpertQuotes(
  query: string,
  limit = 4,
): Promise<ExpertQuoteResult[]> {
  const embedding = await embedQuery(query);
  const embeddingStr = `[${embedding.join(",")}]`;

  const rows = await db.execute(sql`
    WITH q AS (
      SELECT
        'quote'::text          AS source,
        qo.id                  AS id,
        qo.speaker             AS speaker,
        qo.speaker_credential  AS credential,
        qo.episode_slug        AS episode_slug,
        qo.quote               AS text,
        qo."timestamp"         AS ts,
        (qe.embedding <=> ${embeddingStr}::vector) AS dist
      FROM quote_embeddings qe
      JOIN quotes qo ON qo.id = qe.quote_id
      WHERE qo.reviewed = true
    ),
    c AS (
      SELECT
        'claim'::text          AS source,
        cl.id                  AS id,
        cl.speaker             AS speaker,
        NULL::text             AS credential,
        cl.episode_slug        AS episode_slug,
        cl.supporting_quote    AS text,
        cl."timestamp"         AS ts,
        (ce.embedding <=> ${embeddingStr}::vector) AS dist
      FROM claim_embeddings ce
      JOIN claims cl ON cl.id = ce.claim_id
      WHERE cl.reviewed = true
        AND cl.speaker IS NOT NULL
        AND cl.supporting_quote IS NOT NULL
        AND length(trim(cl.supporting_quote)) > 0
    ),
    u AS (
      SELECT * FROM q
      UNION ALL
      SELECT * FROM c
    )
    SELECT
      u.source,
      u.id,
      u.speaker,
      u.credential,
      u.episode_slug,
      u.text,
      u.ts,
      e.title AS episode_title,
      e.url   AS episode_url,
      1 - u.dist AS relevance_score
    FROM u
    LEFT JOIN mcp_episodes e ON e.slug = u.episode_slug
    ORDER BY u.dist
    LIMIT ${limit}
  `);

  return (rows.rows as Record<string, unknown>[]).map((r) => ({
    source: r.source as "quote" | "claim",
    id: r.id as number,
    speaker: r.speaker as string,
    credential: (r.credential as string) ?? null,
    episodeSlug: r.episode_slug as string,
    episodeTitle: (r.episode_title as string) ?? null,
    episodeUrl: (r.episode_url as string) ?? null,
    text: r.text as string,
    timestamp: (r.ts as string) ?? null,
    relevance_score: Number(r.relevance_score),
  }));
}

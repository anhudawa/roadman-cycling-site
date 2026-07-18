-- Migration: 00008_topic_classifier.sql
-- Description: Topic auto-classification function — classifies GSC queries and
--              community posts to canonical topics using alias matching and
--              pgvector cosine similarity on content_embeddings.
-- Date: 2026-07-19
-- Depends on: 00004_intelligence_layer.sql (topic_aliases, search_console_daily,
--             community_posts, topics with centroid_embedding)
-- Reference: ROADMAN-OS-INTELLIGENCE-EXPANSION.md Ticket 56

-- ============================================================================
-- FUNCTION: classify_topics()
-- Ticket 56 — Topic Auto-Classification
-- Schedule: pg_cron 04:15 UTC daily (after sync, before aggregation)
--
-- Two-pass classification:
--   Pass 1 — Alias matching: exact match on lower(query/title) against
--            topic_aliases.alias. Fast, deterministic, handles known variants.
--   Pass 2 — Embedding similarity: for unmatched rows, find the nearest topic
--            centroid using cosine similarity on content_embeddings. Threshold
--            of 0.72 prevents low-confidence assignments.
--
-- Also auto-generates new topic_aliases from high-confidence embedding matches
-- (similarity ≥ 0.85) to accelerate future alias-pass hits.
-- ============================================================================

CREATE OR REPLACE FUNCTION classify_topics(
  p_lookback_days INTEGER DEFAULT 7,
  p_similarity_threshold REAL DEFAULT 0.72,
  p_auto_alias_threshold REAL DEFAULT 0.85
)
RETURNS TABLE(
  gsc_alias_matched INTEGER,
  gsc_embedding_matched INTEGER,
  community_alias_matched INTEGER,
  community_embedding_matched INTEGER,
  aliases_created INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_gsc_alias INTEGER := 0;
  v_gsc_embed INTEGER := 0;
  v_community_alias INTEGER := 0;
  v_community_embed INTEGER := 0;
  v_aliases_created INTEGER := 0;
  v_cp_aliases INTEGER := 0;
  v_cutoff_date DATE;
BEGIN
  v_cutoff_date := CURRENT_DATE - p_lookback_days;

  -- =========================================================================
  -- PASS 1a: Alias-match unclassified GSC queries
  -- =========================================================================
  UPDATE search_console_daily gsc
  SET topic_id = ta.topic_id
  FROM topic_aliases ta
  WHERE gsc.topic_id IS NULL
    AND gsc.date >= v_cutoff_date
    AND lower(gsc.query) = lower(ta.alias);

  GET DIAGNOSTICS v_gsc_alias = ROW_COUNT;

  -- =========================================================================
  -- PASS 1b: Alias-match unclassified community posts
  -- =========================================================================
  UPDATE community_posts cp
  SET topic_id = ta.topic_id
  FROM topic_aliases ta
  WHERE cp.topic_id IS NULL
    AND cp.posted_at >= v_cutoff_date
    AND lower(cp.title) = lower(ta.alias);

  GET DIAGNOSTICS v_community_alias = ROW_COUNT;

  -- =========================================================================
  -- PASS 2a: Embedding-match remaining unclassified GSC queries
  -- Uses content_embeddings where entity_type = 'gsc_query' (pre-embedded by
  -- the embedding pipeline) and compares against topic centroids.
  -- =========================================================================
  WITH unmatched_gsc AS (
    SELECT DISTINCT gsc.id, gsc.query
    FROM search_console_daily gsc
    WHERE gsc.topic_id IS NULL
      AND gsc.date >= v_cutoff_date
  ),
  gsc_with_embeddings AS (
    SELECT
      ug.id AS gsc_id,
      ug.query,
      ce.embedding
    FROM unmatched_gsc ug
    JOIN content_embeddings ce
      ON ce.entity_type = 'gsc_query'
      AND ce.entity_id = ug.id::text
    WHERE ce.embedding IS NOT NULL
  ),
  best_match AS (
    SELECT DISTINCT ON (ge.gsc_id)
      ge.gsc_id,
      ge.query,
      t.id AS topic_id,
      1 - (ge.embedding <=> t.centroid_embedding) AS similarity
    FROM gsc_with_embeddings ge
    CROSS JOIN topics t
    WHERE t.centroid_embedding IS NOT NULL
      AND t.is_trend_tracked = TRUE
    ORDER BY ge.gsc_id, ge.embedding <=> t.centroid_embedding ASC
  ),
  matched AS (
    UPDATE search_console_daily gsc
    SET topic_id = bm.topic_id
    FROM best_match bm
    WHERE gsc.id = bm.gsc_id
      AND bm.similarity >= p_similarity_threshold
    RETURNING gsc.id, bm.query, bm.topic_id, bm.similarity
  )
  SELECT COUNT(*)::integer INTO v_gsc_embed FROM matched;

  -- Auto-generate aliases from high-confidence matches
  INSERT INTO topic_aliases (topic_id, alias, source)
  SELECT DISTINCT ON (lower(bm.query))
    bm.topic_id,
    lower(bm.query),
    'gsc_auto'
  FROM (
    SELECT DISTINCT ON (ge.gsc_id)
      ge.query,
      t.id AS topic_id,
      1 - (ge.embedding <=> t.centroid_embedding) AS similarity
    FROM (
      SELECT DISTINCT gsc.id AS gsc_id, gsc.query,
             ce.embedding
      FROM search_console_daily gsc
      JOIN content_embeddings ce
        ON ce.entity_type = 'gsc_query'
        AND ce.entity_id = gsc.id::text
      WHERE gsc.date >= v_cutoff_date
        AND gsc.topic_id IS NOT NULL
        AND ce.embedding IS NOT NULL
    ) ge
    CROSS JOIN topics t
    WHERE t.centroid_embedding IS NOT NULL
      AND t.is_trend_tracked = TRUE
    ORDER BY ge.gsc_id, ge.embedding <=> t.centroid_embedding ASC
  ) bm
  WHERE bm.similarity >= p_auto_alias_threshold
  ON CONFLICT (alias) DO NOTHING;

  GET DIAGNOSTICS v_aliases_created = ROW_COUNT;

  -- =========================================================================
  -- PASS 2b: Embedding-match remaining unclassified community posts
  -- =========================================================================
  WITH unmatched_cp AS (
    SELECT cp.id, cp.title
    FROM community_posts cp
    WHERE cp.topic_id IS NULL
      AND cp.posted_at >= v_cutoff_date
  ),
  cp_with_embeddings AS (
    SELECT
      ucp.id AS cp_id,
      ucp.title,
      ce.embedding
    FROM unmatched_cp ucp
    JOIN content_embeddings ce
      ON ce.entity_type = 'community_post'
      AND ce.entity_id = ucp.id::text
    WHERE ce.embedding IS NOT NULL
  ),
  best_cp_match AS (
    SELECT DISTINCT ON (cpe.cp_id)
      cpe.cp_id,
      cpe.title,
      t.id AS topic_id,
      1 - (cpe.embedding <=> t.centroid_embedding) AS similarity
    FROM cp_with_embeddings cpe
    CROSS JOIN topics t
    WHERE t.centroid_embedding IS NOT NULL
      AND t.is_trend_tracked = TRUE
    ORDER BY cpe.cp_id, cpe.embedding <=> t.centroid_embedding ASC
  ),
  cp_matched AS (
    UPDATE community_posts cp
    SET topic_id = bcm.topic_id
    FROM best_cp_match bcm
    WHERE cp.id = bcm.cp_id
      AND bcm.similarity >= p_similarity_threshold
    RETURNING cp.id, bcm.title, bcm.topic_id, bcm.similarity
  )
  SELECT COUNT(*)::integer INTO v_community_embed FROM cp_matched;

  -- Auto-generate aliases from high-confidence community post matches
  INSERT INTO topic_aliases (topic_id, alias, source)
  SELECT DISTINCT ON (lower(bcm.title))
    bcm.topic_id,
    lower(bcm.title),
    'community_auto'
  FROM (
    SELECT DISTINCT ON (cpe.cp_id)
      cpe.title,
      t.id AS topic_id,
      1 - (cpe.embedding <=> t.centroid_embedding) AS similarity
    FROM (
      SELECT cp.id AS cp_id, cp.title,
             ce.embedding
      FROM community_posts cp
      JOIN content_embeddings ce
        ON ce.entity_type = 'community_post'
        AND ce.entity_id = cp.id::text
      WHERE cp.posted_at >= v_cutoff_date
        AND cp.topic_id IS NOT NULL
        AND ce.embedding IS NOT NULL
    ) cpe
    CROSS JOIN topics t
    WHERE t.centroid_embedding IS NOT NULL
      AND t.is_trend_tracked = TRUE
    ORDER BY cpe.cp_id, cpe.embedding <=> t.centroid_embedding ASC
  ) bcm
  WHERE bcm.similarity >= p_auto_alias_threshold
    AND length(bcm.title) <= 100  -- skip overly long post titles
  ON CONFLICT (alias) DO NOTHING;

  -- Add to alias count
  GET DIAGNOSTICS v_cp_aliases = ROW_COUNT;
  v_aliases_created := v_aliases_created + v_cp_aliases;

  RETURN QUERY SELECT v_gsc_alias, v_gsc_embed, v_community_alias, v_community_embed, v_aliases_created;
END;
$$;

COMMENT ON FUNCTION classify_topics IS 'T56: Two-pass topic classifier. Pass 1: alias lookup (exact match). Pass 2: pgvector cosine similarity against topic centroids (threshold 0.72). Auto-generates aliases at ≥0.85 similarity. Idempotent — skips already-classified rows.';

-- ============================================================================
-- HELPER FUNCTION: review_classifications()
-- Returns recent auto-classifications for human review.
-- Used by the /api/intelligence/classify review endpoint.
-- ============================================================================

CREATE OR REPLACE FUNCTION review_classifications(
  p_lookback_days INTEGER DEFAULT 7,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  entity_type TEXT,
  entity_id UUID,
  entity_text TEXT,
  topic_id UUID,
  topic_name TEXT,
  classification_source TEXT,
  classified_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- GSC auto-classified queries
  (
    SELECT
      'gsc_query'::text,
      gsc.id,
      gsc.query,
      gsc.topic_id,
      t.name,
      CASE
        WHEN EXISTS (
          SELECT 1 FROM topic_aliases ta
          WHERE ta.topic_id = gsc.topic_id
            AND lower(ta.alias) = lower(gsc.query)
            AND ta.source IN ('gsc_auto', 'community_auto')
        ) THEN 'embedding_auto'
        ELSE 'alias'
      END,
      gsc.date
    FROM search_console_daily gsc
    JOIN topics t ON t.id = gsc.topic_id
    WHERE gsc.date >= (CURRENT_DATE - p_lookback_days)
  )
  UNION ALL
  -- Community posts auto-classified
  (
    SELECT
      'community_post'::text,
      cp.id,
      cp.title,
      cp.topic_id,
      t.name,
      CASE
        WHEN EXISTS (
          SELECT 1 FROM topic_aliases ta
          WHERE ta.topic_id = cp.topic_id
            AND lower(ta.alias) = lower(cp.title)
            AND ta.source IN ('gsc_auto', 'community_auto')
        ) THEN 'embedding_auto'
        ELSE 'alias'
      END,
      cp.posted_at
    FROM community_posts cp
    JOIN topics t ON t.id = cp.topic_id
    WHERE cp.posted_at >= (CURRENT_DATE - p_lookback_days)
  )
  ORDER BY 7 DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION review_classifications IS 'T56: Returns recent auto-classifications for human review. Shows which GSC queries and community posts were matched to which topics, and whether by alias or embedding.';

-- ============================================================================
-- pg_cron SCHEDULE (documentation — run in Supabase SQL Editor)
-- ============================================================================

-- SELECT cron.schedule('classify-topics', '15 4 * * *', 'SELECT classify_topics()');

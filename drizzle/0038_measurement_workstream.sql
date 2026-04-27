-- Measurement workstream (DEV-DATA-01/02/03):
--   * events.ai_referrer indexed column (DEV-DATA-02)
--   * brand_prompts + brand_citation_runs (DEV-DATA-03)
--
-- Idempotent so it's safe against partially-applied environments.

-- ---------------------------------------------------------------
-- 1. events.ai_referrer (indexed column for fast AI-attribution queries).
--    Backfill from the existing meta jsonb so historical events are queryable
--    without a separate one-shot script.
-- ---------------------------------------------------------------
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "ai_referrer" text;
CREATE INDEX IF NOT EXISTS "events_ai_referrer_idx" ON "events" ("ai_referrer");

UPDATE "events"
SET "ai_referrer" = "meta"->>'ai_referrer'
WHERE "ai_referrer" IS NULL
  AND "meta" ? 'ai_referrer';

-- ---------------------------------------------------------------
-- 2. brand_prompts — questions tested against AI assistants on a cron.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "brand_prompts" (
  "id"         serial PRIMARY KEY,
  "prompt"     text NOT NULL,
  "category"   text NOT NULL,
  "enabled"    boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- 3. brand_citation_runs — one row per (prompt × model × run).
--    `mentioned` flags whether Roadman was cited; `citations` stores the
--    raw citation list returned by providers that surface them (Perplexity,
--    Gemini grounding). `error` captures provider failures so a partial run
--    is still queryable.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "brand_citation_runs" (
  "id"             serial PRIMARY KEY,
  "prompt_id"      integer NOT NULL REFERENCES "brand_prompts" ("id") ON DELETE CASCADE,
  "model"          text NOT NULL,
  "response"       text,
  "mentioned"      boolean NOT NULL DEFAULT false,
  "matched_terms"  jsonb,
  "matched_urls"   jsonb,
  "citations"      jsonb,
  "error"          text,
  "ran_at"         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "brand_citation_runs_prompt_id_idx" ON "brand_citation_runs" ("prompt_id");
CREATE INDEX IF NOT EXISTS "brand_citation_runs_ran_at_idx"    ON "brand_citation_runs" ("ran_at");
CREATE INDEX IF NOT EXISTS "brand_citation_runs_model_idx"     ON "brand_citation_runs" ("model");

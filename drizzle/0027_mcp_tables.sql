-- Enable pgvector extension (Neon/Vercel Postgres supports this)
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Episodes ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "mcp_episodes" (
  "id" serial PRIMARY KEY,
  "slug" text UNIQUE NOT NULL,
  "title" text NOT NULL,
  "guest_name" text,
  "published_at" timestamptz,
  "duration_sec" integer,
  "summary" text,
  "audio_url" text,
  "youtube_url" text,
  "transcript_text" text,
  "key_insights" jsonb,
  "topic_tags" text[],
  "url" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "mcp_episodes_slug_idx" ON "mcp_episodes" ("slug");
CREATE INDEX IF NOT EXISTS "mcp_episodes_published_at_idx" ON "mcp_episodes" ("published_at");

-- ── Episode Embeddings ────────────────────────────────────
CREATE TABLE IF NOT EXISTS "mcp_episode_embeddings" (
  "id" serial PRIMARY KEY,
  "episode_id" integer NOT NULL REFERENCES "mcp_episodes"("id") ON DELETE CASCADE,
  "chunk_index" integer NOT NULL,
  "chunk_text" text NOT NULL,
  "embedding" vector(1024)
);
CREATE INDEX IF NOT EXISTS "mcp_episode_embeddings_episode_id_idx"
  ON "mcp_episode_embeddings" ("episode_id");

-- ── Experts ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "mcp_experts" (
  "id" serial PRIMARY KEY,
  "name" text UNIQUE NOT NULL,
  "credentials" text,
  "specialty" text,
  "bio" text,
  "appearance_count" integer NOT NULL DEFAULT 0,
  "latest_appearance" timestamptz
);

-- ── Expert Quotes ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "mcp_expert_quotes" (
  "id" serial PRIMARY KEY,
  "expert_id" integer NOT NULL REFERENCES "mcp_experts"("id") ON DELETE CASCADE,
  "episode_id" integer REFERENCES "mcp_episodes"("id") ON DELETE SET NULL,
  "quote" text NOT NULL,
  "context" text,
  "topic_tags" text[]
);
CREATE INDEX IF NOT EXISTS "mcp_expert_quotes_expert_id_idx"
  ON "mcp_expert_quotes" ("expert_id");

-- ── Methodology Principles ────────────────────────────────
CREATE TABLE IF NOT EXISTS "mcp_methodology_principles" (
  "id" serial PRIMARY KEY,
  "principle" text NOT NULL,
  "explanation" text NOT NULL,
  "topic_tags" text[],
  "supporting_expert_names" text[],
  "supporting_episode_ids" integer[]
);

-- ── Methodology Embeddings ────────────────────────────────
CREATE TABLE IF NOT EXISTS "mcp_methodology_embeddings" (
  "id" serial PRIMARY KEY,
  "principle_id" integer NOT NULL REFERENCES "mcp_methodology_principles"("id") ON DELETE CASCADE,
  "embedding" vector(1024)
);

-- ── Products ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "mcp_products" (
  "id" serial PRIMARY KEY,
  "product_key" text UNIQUE NOT NULL,
  "name" text NOT NULL,
  "price_cents" integer NOT NULL,
  "currency" text NOT NULL DEFAULT 'USD',
  "billing_period" text,
  "description" text NOT NULL,
  "who_its_for" text NOT NULL,
  "url" text NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true
);

-- ── Roadman Events (calendar) ─────────────────────────────
-- Named roadman_events to avoid collision with the analytics events table.
CREATE TABLE IF NOT EXISTS "roadman_events" (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "type" text NOT NULL,
  "starts_at" timestamptz NOT NULL,
  "location" text,
  "description" text,
  "is_members_only" boolean NOT NULL DEFAULT false,
  "url" text,
  "is_active" boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS "roadman_events_starts_at_idx" ON "roadman_events" ("starts_at");

-- ── Community Stats (singleton) ───────────────────────────
CREATE TABLE IF NOT EXISTS "mcp_community_stats" (
  "id" serial PRIMARY KEY,
  "podcast_downloads_total" bigint NOT NULL DEFAULT 0,
  "youtube_subscribers_main" integer NOT NULL DEFAULT 0,
  "youtube_subscribers_clips" integer NOT NULL DEFAULT 0,
  "free_community_members" integer NOT NULL DEFAULT 0,
  "paid_community_members" integer NOT NULL DEFAULT 0,
  "featured_transformations" jsonb,
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- ── MCP Call Logs ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "mcp_call_logs" (
  "id" serial PRIMARY KEY,
  "tool_name" text NOT NULL,
  "input_truncated" text,
  "duration_ms" integer,
  "success" boolean NOT NULL,
  "error" text,
  "ip_hash" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "mcp_call_logs_tool_name_idx" ON "mcp_call_logs" ("tool_name");
CREATE INDEX IF NOT EXISTS "mcp_call_logs_created_at_idx" ON "mcp_call_logs" ("created_at");

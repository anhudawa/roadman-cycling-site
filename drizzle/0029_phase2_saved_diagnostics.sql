-- ═══════════════════════════════════════════════════════════
-- Phase 2: Saved Diagnostics + Rider Profile polish
-- ═══════════════════════════════════════════════════════════

-- 1. Extend rider_profiles with self/coached flag captured by tool flows.
ALTER TABLE "rider_profiles"
  ADD COLUMN IF NOT EXISTS "self_coached_or_coached" text;

-- 2. Link diagnostic_submissions back to rider_profiles.
ALTER TABLE "diagnostic_submissions"
  ADD COLUMN IF NOT EXISTS "rider_profile_id" integer;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'diagnostic_submissions_rider_profile_id_fkey'
  ) THEN
    ALTER TABLE "diagnostic_submissions"
      ADD CONSTRAINT "diagnostic_submissions_rider_profile_id_fkey"
      FOREIGN KEY ("rider_profile_id") REFERENCES "rider_profiles" ("id") ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "diagnostic_submissions_rider_profile_id_idx"
  ON "diagnostic_submissions" ("rider_profile_id");

-- 3. Unified tool_results table — save every calculator run keyed by a
--    short public slug so /results/<tool>/<slug> is shareable.
CREATE TABLE IF NOT EXISTS "tool_results" (
  "id" serial PRIMARY KEY,
  "slug" text NOT NULL UNIQUE,
  "rider_profile_id" integer REFERENCES "rider_profiles" ("id") ON DELETE SET NULL,
  "email" text NOT NULL,
  "tool_slug" text NOT NULL,                 -- plateau | fuelling | ftp_zones
  "inputs" jsonb NOT NULL,
  "outputs" jsonb NOT NULL,
  "summary" text NOT NULL,
  "primary_result" text,
  "tags" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "utm" jsonb,
  "source_page" text,
  "email_sent_at" timestamptz,
  "ask_handoff_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "tool_results_email_idx" ON "tool_results" ("email");
CREATE INDEX IF NOT EXISTS "tool_results_tool_slug_idx" ON "tool_results" ("tool_slug");
CREATE INDEX IF NOT EXISTS "tool_results_rider_profile_id_idx" ON "tool_results" ("rider_profile_id");
CREATE INDEX IF NOT EXISTS "tool_results_created_at_idx" ON "tool_results" ("created_at");

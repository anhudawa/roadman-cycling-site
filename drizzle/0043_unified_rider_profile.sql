-- Unified rider profile — adds the remaining personalisation columns and
-- a magic-link token table that mirrors method_login_tokens, but keyed on
-- rider_profiles. Any rider with a profile row (e.g. completed a tool or
-- the plateau diagnostic) can request a magic link and sign in to /profile.
--
-- The cookie is `rider_session`, separate from `method_session`. A Method
-- enrollee always has a rider_profiles row too, so the /profile page can
-- additionally fall back to the Method session for read access.

-- ── 1. Extend rider_profiles ─────────────────────────────────────────────

ALTER TABLE "rider_profiles"
  ADD COLUMN IF NOT EXISTS "height_cm" integer,
  ADD COLUMN IF NOT EXISTS "body_composition_goal" text,
  ADD COLUMN IF NOT EXISTS "preferred_support_level" text,
  ADD COLUMN IF NOT EXISTS "injury_history" text,
  ADD COLUMN IF NOT EXISTS "current_tools" jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ── 2. Magic-link tokens for /profile login ──────────────────────────────

CREATE TABLE IF NOT EXISTS "rider_login_tokens" (
  "id" serial PRIMARY KEY NOT NULL,
  "rider_profile_id" integer NOT NULL REFERENCES "rider_profiles" ("id") ON DELETE CASCADE,
  -- bcrypt-hashed magic-link token. Raw token (32 random bytes base64url)
  -- is sent over email; only the hash lives in the database.
  "token_hash" text NOT NULL UNIQUE,
  "expires_at" timestamp with time zone NOT NULL,
  -- Single-use: a successful verify sets this column. Subsequent attempts
  -- to consume the same raw token find used_at set and refuse.
  "used_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "rider_login_tokens_rider_profile_id_idx"
  ON "rider_login_tokens" ("rider_profile_id");
CREATE INDEX IF NOT EXISTS "rider_login_tokens_expires_at_idx"
  ON "rider_login_tokens" ("expires_at");

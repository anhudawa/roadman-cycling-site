-- Email magic-link authentication for /ask.
--
-- Distinct from rider_profiles (which requires a tool/diagnostic/Method
-- purchase) — anyone can authenticate to /ask with just their email,
-- which gets captured for the Beehiiv newsletter list. The session
-- cookie is `ask_session` (7-day expiry, HMAC-signed JWT). The magic
-- link token is bcrypt-hashed, single-use, 15-minute TTL.

CREATE TABLE IF NOT EXISTS "ask_auth_subscribers" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" text NOT NULL UNIQUE,
  "first_authenticated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "last_authenticated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "beehiiv_subscriber_id" text,
  "beehiiv_synced_at" timestamp with time zone,
  "auth_count" integer NOT NULL DEFAULT 1,
  "source" text
);

CREATE INDEX IF NOT EXISTS "ask_auth_subscribers_email_idx"
  ON "ask_auth_subscribers" ("email");

CREATE TABLE IF NOT EXISTS "ask_auth_tokens" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" text NOT NULL,
  "token_hash" text NOT NULL UNIQUE,
  "expires_at" timestamp with time zone NOT NULL,
  "used_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "ask_auth_tokens_email_idx"
  ON "ask_auth_tokens" ("email");
CREATE INDEX IF NOT EXISTS "ask_auth_tokens_expires_at_idx"
  ON "ask_auth_tokens" ("expires_at");

-- ═══════════════════════════════════════════════════════════
-- Ask Roadman + Rider Profiles
-- ═══════════════════════════════════════════════════════════
-- Shared rider profile (referenced by Ask Roadman sessions and future
-- diagnostic tools). Keyed by email, optional FK back to contacts.
CREATE TABLE IF NOT EXISTS "rider_profiles" (
  "id" serial PRIMARY KEY,
  "contact_id" integer REFERENCES "contacts"("id") ON DELETE CASCADE,
  "email" text NOT NULL UNIQUE,
  "first_name" text,
  "age_range" text,                              -- under_35 | 35_44 | 45_54 | 55_plus
  "discipline" text,                             -- road | gravel | triathlon | endurance | masters | other
  "weekly_training_hours" integer,
  "current_ftp" integer,
  "weight_kg" numeric(5,2),
  "main_goal" text,
  "target_event" text,
  "target_event_date" date,
  "biggest_limiter" text,
  "uses_power_meter" boolean,
  "current_training_tool" text,
  "coaching_interest" text,                      -- none | curious | interested | ready
  "access_tier" text NOT NULL DEFAULT 'free',    -- free | plus | vip
  "consent_save_profile" boolean NOT NULL DEFAULT false,
  "consent_email_followup" boolean NOT NULL DEFAULT false,
  "consent_recorded_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "rider_profiles_email_idx" ON "rider_profiles" ("email");
CREATE INDEX IF NOT EXISTS "rider_profiles_contact_id_idx" ON "rider_profiles" ("contact_id");

-- Ask Roadman chat session. One per browser cookie (anonymous) or per
-- rider profile (logged-in). Messages and retrievals cascade on delete.
CREATE TABLE IF NOT EXISTS "ask_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "rider_profile_id" integer REFERENCES "rider_profiles"("id") ON DELETE SET NULL,
  "anon_session_key" text,
  "started_at" timestamptz NOT NULL DEFAULT now(),
  "last_activity_at" timestamptz NOT NULL DEFAULT now(),
  "message_count" integer NOT NULL DEFAULT 0,
  "ip_hash" text,
  "user_agent" text,
  "utm_source" text,
  "utm_campaign" text
);
CREATE INDEX IF NOT EXISTS "ask_sessions_rider_profile_id_idx" ON "ask_sessions" ("rider_profile_id");
CREATE INDEX IF NOT EXISTS "ask_sessions_anon_session_key_idx" ON "ask_sessions" ("anon_session_key");
CREATE INDEX IF NOT EXISTS "ask_sessions_last_activity_at_idx" ON "ask_sessions" ("last_activity_at");

-- Each user / assistant / system message, with citations + CTA + safety flags
-- attached to the assistant response.
CREATE TABLE IF NOT EXISTS "ask_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" uuid NOT NULL REFERENCES "ask_sessions"("id") ON DELETE CASCADE,
  "role" text NOT NULL,                          -- user | assistant | system
  "content" text NOT NULL,
  "citations" jsonb,
  "cta_recommended" text,
  "safety_flags" text[],
  "confidence" text,                             -- high | medium | low
  "model" text,
  "input_tokens" integer,
  "output_tokens" integer,
  "latency_ms" integer,
  "flagged_for_review" boolean NOT NULL DEFAULT false,
  "admin_note" text,
  "admin_preferred_answer" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "ask_messages_session_id_idx" ON "ask_messages" ("session_id");
CREATE INDEX IF NOT EXISTS "ask_messages_created_at_idx" ON "ask_messages" ("created_at");

-- One row per retrieved chunk per assistant message. Used for admin review
-- and "was this citation actually used" analytics.
CREATE TABLE IF NOT EXISTS "ask_retrievals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "message_id" uuid NOT NULL REFERENCES "ask_messages"("id") ON DELETE CASCADE,
  "source_type" text NOT NULL,                   -- episode | methodology | content_chunk | expert_quote
  "source_id" text NOT NULL,
  "chunk_text" text,
  "score" numeric(6,4),
  "used_in_answer" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "ask_retrievals_message_id_idx" ON "ask_retrievals" ("message_id");

-- Masters Plateau Diagnostic — lead-magnet submissions table.
-- See src/lib/diagnostic/* for the scoring engine + generator.
-- Idempotent so this file can be re-applied safely.

CREATE TABLE IF NOT EXISTS "diagnostic_submissions" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "email" text NOT NULL,
  "age" text NOT NULL,
  "hours_per_week" text NOT NULL,
  "ftp" integer,
  "goal" text,
  "answers" jsonb NOT NULL,
  "scores" jsonb NOT NULL,
  "primary_profile" text NOT NULL,
  "secondary_profile" text,
  "severe_multi_system" boolean NOT NULL DEFAULT false,
  "close_to_breakthrough" boolean NOT NULL DEFAULT false,
  "breakdown" jsonb NOT NULL,
  "generation_source" text NOT NULL DEFAULT 'fallback',
  "raw_model_output" text,
  "generation_meta" jsonb,
  "utm_source" text,
  "utm_medium" text,
  "utm_campaign" text,
  "utm_content" text,
  "utm_term" text,
  "user_agent" text,
  "referrer" text,
  "beehiiv_subscriber_id" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS diagnostic_submissions_email_idx
  ON diagnostic_submissions(email);
CREATE INDEX IF NOT EXISTS diagnostic_submissions_created_at_idx
  ON diagnostic_submissions(created_at);
CREATE INDEX IF NOT EXISTS diagnostic_submissions_primary_profile_idx
  ON diagnostic_submissions(primary_profile);
CREATE INDEX IF NOT EXISTS diagnostic_submissions_utm_campaign_idx
  ON diagnostic_submissions(utm_campaign);

-- Ted Community Agent — drafts, welcomes, surfaces, memory, kill switch.
-- See agents/ted/README.md.

CREATE TABLE IF NOT EXISTS "ted_drafts" (
  "id" serial PRIMARY KEY NOT NULL,
  "pillar" text NOT NULL,
  "scheduled_for" date NOT NULL,
  "status" text NOT NULL DEFAULT 'draft',
  "original_body" text NOT NULL,
  "edited_body" text,
  "approved_by_slug" text,
  "approved_at" timestamptz,
  "posted_at" timestamptz,
  "skool_post_url" text,
  "voice_check" jsonb,
  "generation_attempts" integer NOT NULL DEFAULT 1,
  "failure_reason" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ted_drafts_scheduled_for_idx ON ted_drafts(scheduled_for);
CREATE INDEX IF NOT EXISTS ted_drafts_status_idx ON ted_drafts(status);

CREATE TABLE IF NOT EXISTS "ted_welcome_queue" (
  "member_email" text PRIMARY KEY NOT NULL,
  "member_id" text,
  "first_name" text NOT NULL,
  "persona" text,
  "questionnaire_answers" jsonb,
  "status" text NOT NULL DEFAULT 'pending',
  "draft_body" text,
  "voice_check" jsonb,
  "posted_at" timestamptz,
  "skool_post_url" text,
  "failure_reason" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ted_welcome_queue_status_idx ON ted_welcome_queue(status);
CREATE INDEX IF NOT EXISTS ted_welcome_queue_created_at_idx ON ted_welcome_queue(created_at);

CREATE TABLE IF NOT EXISTS "ted_surfaced" (
  "id" serial PRIMARY KEY NOT NULL,
  "skool_post_id" text NOT NULL,
  "surface_type" text NOT NULL,
  "body" text NOT NULL,
  "skool_reply_url" text,
  "surfaced_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ted_surfaced_post_id_idx ON ted_surfaced(skool_post_id);
CREATE INDEX IF NOT EXISTS ted_surfaced_at_idx ON ted_surfaced(surfaced_at);

CREATE TABLE IF NOT EXISTS "ted_active_members" (
  "member_id" text PRIMARY KEY NOT NULL,
  "first_name" text NOT NULL,
  "last_seen_at" timestamptz NOT NULL DEFAULT now(),
  "topic_tags" text[],
  "post_count" integer NOT NULL DEFAULT 0,
  "reply_count" integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "ted_activity_log" (
  "id" serial PRIMARY KEY NOT NULL,
  "timestamp" timestamptz NOT NULL DEFAULT now(),
  "job" text NOT NULL,
  "action" text NOT NULL,
  "level" text NOT NULL DEFAULT 'info',
  "payload" jsonb,
  "error" text
);
CREATE INDEX IF NOT EXISTS ted_activity_log_timestamp_idx ON ted_activity_log(timestamp);
CREATE INDEX IF NOT EXISTS ted_activity_log_job_idx ON ted_activity_log(job, timestamp);

CREATE TABLE IF NOT EXISTS "ted_edits" (
  "id" serial PRIMARY KEY NOT NULL,
  "draft_id" integer NOT NULL REFERENCES ted_drafts(id) ON DELETE CASCADE,
  "before_text" text NOT NULL,
  "after_text" text NOT NULL,
  "chars_changed" integer NOT NULL DEFAULT 0,
  "edited_by_slug" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ted_edits_draft_id_idx ON ted_edits(draft_id);
CREATE INDEX IF NOT EXISTS ted_edits_created_at_idx ON ted_edits(created_at);

CREATE TABLE IF NOT EXISTS "ted_kill_switch" (
  "id" integer PRIMARY KEY NOT NULL,
  "paused" boolean NOT NULL DEFAULT false,
  "paused_by_slug" text,
  "paused_at" timestamptz,
  "reason" text,
  "post_prompt_enabled" boolean NOT NULL DEFAULT false,
  "post_welcome_enabled" boolean NOT NULL DEFAULT false,
  "surface_threads_enabled" boolean NOT NULL DEFAULT false,
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
-- Seed the singleton row so every lookup is defined.
INSERT INTO ted_kill_switch (id, paused) VALUES (1, false) ON CONFLICT (id) DO NOTHING;

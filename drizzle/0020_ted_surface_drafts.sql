-- Ted v1: surface-thread drafts awaiting human approval.
--
-- Split from ted_surfaced: ted_surface_drafts holds candidate surface replies
-- before a human approves them. Posting writes to ted_surfaced for 48h de-dup.

CREATE TABLE IF NOT EXISTS "ted_surface_drafts" (
  "id" serial PRIMARY KEY NOT NULL,
  "skool_post_id" text NOT NULL,
  "thread_url" text NOT NULL,
  "thread_author" text,
  "thread_title" text,
  "thread_body" text,
  "surface_type" text NOT NULL,
  "original_body" text NOT NULL,
  "edited_body" text,
  "status" text NOT NULL DEFAULT 'drafted',
  "voice_check" jsonb,
  "approved_by_slug" text,
  "approved_at" timestamptz,
  "posted_at" timestamptz,
  "skool_reply_url" text,
  "failure_reason" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ted_surface_drafts_status_idx
  ON ted_surface_drafts(status);
CREATE INDEX IF NOT EXISTS ted_surface_drafts_skool_post_id_idx
  ON ted_surface_drafts(skool_post_id);
CREATE INDEX IF NOT EXISTS ted_surface_drafts_created_at_idx
  ON ted_surface_drafts(created_at);

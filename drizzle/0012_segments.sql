CREATE TABLE IF NOT EXISTS "segments" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "filters" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_by_slug" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS segments_created_by_slug_idx ON segments(created_by_slug);

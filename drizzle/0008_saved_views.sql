CREATE TABLE IF NOT EXISTS "saved_views" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "entity" text NOT NULL,  -- 'contacts' for now; future-proof
  "filters" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_by_slug" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS saved_views_entity_idx ON saved_views(entity);
CREATE INDEX IF NOT EXISTS saved_views_created_by_slug_idx ON saved_views(created_by_slug);

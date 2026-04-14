CREATE TABLE IF NOT EXISTS "sync_runs" (
  "id" serial PRIMARY KEY NOT NULL,
  "source" text NOT NULL,
  "status" text NOT NULL,
  "result" jsonb,
  "error" text,
  "started_at" timestamptz NOT NULL DEFAULT now(),
  "finished_at" timestamptz
);
CREATE INDEX IF NOT EXISTS sync_runs_source_idx ON sync_runs(source, started_at DESC);

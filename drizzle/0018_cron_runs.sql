CREATE TABLE IF NOT EXISTS "cron_runs" (
  "id" serial PRIMARY KEY NOT NULL,
  "kind" text NOT NULL,
  "status" text NOT NULL,
  "result" jsonb,
  "error" text,
  "started_at" timestamptz NOT NULL DEFAULT now(),
  "finished_at" timestamptz
);
CREATE INDEX IF NOT EXISTS cron_runs_kind_idx ON cron_runs(kind, started_at DESC);

ALTER TABLE automation_rules
  ADD COLUMN IF NOT EXISTS max_runs_per_day integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dedupe_window_minutes integer NOT NULL DEFAULT 0;

-- Add contact_id to automation_runs for dedup lookups
ALTER TABLE automation_runs
  ADD COLUMN IF NOT EXISTS contact_id integer;

CREATE INDEX IF NOT EXISTS automation_runs_rule_contact_idx ON automation_runs(rule_id, contact_id, created_at DESC);

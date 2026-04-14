CREATE TABLE IF NOT EXISTS "automation_rules" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "active" boolean NOT NULL DEFAULT true,
  "trigger_type" text NOT NULL,
  "trigger_config" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "actions" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_by_slug" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "last_run_at" timestamptz,
  "run_count" integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS automation_rules_trigger_type_idx ON automation_rules(trigger_type);
CREATE INDEX IF NOT EXISTS automation_rules_active_idx ON automation_rules(active);

CREATE TABLE IF NOT EXISTS "automation_runs" (
  "id" serial PRIMARY KEY NOT NULL,
  "rule_id" integer REFERENCES "automation_rules"("id") ON DELETE CASCADE,
  "status" text NOT NULL,
  "event" jsonb,
  "result" jsonb,
  "error" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS automation_runs_rule_id_idx ON automation_runs(rule_id);
CREATE INDEX IF NOT EXISTS automation_runs_created_at_idx ON automation_runs(created_at DESC);

INSERT INTO automation_rules (name, active, trigger_type, trigger_config, actions, created_by_slug)
VALUES (
  'Example: accepted application onboarding',
  false,
  'application.stage_changed',
  '{"toStage":"accepted"}'::jsonb,
  '[{"type":"send_email","config":{"templateSlug":"cohort-welcome"}},{"type":"create_task","config":{"title":"Onboard {{first_name}}","dueInDays":2}}]'::jsonb,
  'ted'
) ON CONFLICT DO NOTHING;

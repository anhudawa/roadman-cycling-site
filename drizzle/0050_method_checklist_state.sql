-- The Roadman Method — durable per-module week-checklist state.
--
-- Persists which checklist items a rider has ticked, server-side, so it
-- survives a device/browser change (localStorage stays a client cache).
-- One row per (enrollment, module). Distinct from method_progress, which
-- tracks whole-module completion.
--
-- Idempotent (IF NOT EXISTS). Safe to re-run.

CREATE TABLE IF NOT EXISTS "method_checklist_state" (
  "id" serial PRIMARY KEY NOT NULL,
  "enrollment_id" integer NOT NULL REFERENCES "method_enrollments"("id") ON DELETE CASCADE,
  "module_slug" text NOT NULL,
  "checked_indexes" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "method_checklist_state_enrollment_id_idx"
  ON "method_checklist_state" ("enrollment_id");
CREATE UNIQUE INDEX IF NOT EXISTS "method_checklist_state_enrollment_module_unique"
  ON "method_checklist_state" ("enrollment_id", "module_slug");

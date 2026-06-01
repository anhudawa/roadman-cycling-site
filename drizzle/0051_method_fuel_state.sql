-- The Roadman Method — durable Fuel Planner state.
--
-- Persists the rider's full Fuel Planner state (profile, week pattern, meals,
-- start date) server-side so it survives a device/browser change. The client
-- keeps localStorage as a fast offline cache; the two reconcile by updatedAt.
-- One row per enrollment.
--
-- Idempotent (IF NOT EXISTS). Safe to re-run.

CREATE TABLE IF NOT EXISTS "method_fuel_state" (
  "id" serial PRIMARY KEY NOT NULL,
  "enrollment_id" integer NOT NULL REFERENCES "method_enrollments"("id") ON DELETE CASCADE,
  "state" jsonb NOT NULL,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "method_fuel_state_enrollment_unique"
  ON "method_fuel_state" ("enrollment_id");

-- The Roadman Method — persisted onboarding recommendation.
--
-- One current plan recommendation per enrollment (unique enrollment_id,
-- upserted on retake) so the dashboard/account can surface the rider's
-- saved plan and ops can fulfil the matching TrainingPeaks block. Replaces
-- the previous stdout-only logging in /api/method/onboarding.
--
-- Idempotent (IF NOT EXISTS). Safe to re-run.

CREATE TABLE IF NOT EXISTS "method_onboarding" (
  "id" serial PRIMARY KEY NOT NULL,
  "enrollment_id" integer NOT NULL REFERENCES "method_enrollments"("id") ON DELETE CASCADE,
  "plan_code" text NOT NULL,
  "plan_name" text NOT NULL,
  "goal" text NOT NULL,
  "hours" integer NOT NULL,
  "level" text NOT NULL,
  "ftp" integer,
  "event_date" text,
  "weeks_to_event" integer,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "method_onboarding_enrollment_unique"
  ON "method_onboarding" ("enrollment_id");

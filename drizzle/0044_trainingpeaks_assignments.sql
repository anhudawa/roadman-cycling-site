-- TrainingPeaks plan assignments.
--
-- Stub-stage migration: stores the assignment contract (plan + status +
-- dates + nullable TrainingPeaks IDs) so ops can record assignments
-- manually until partner-API credentials are approved. The columns
-- tp_athlete_id and tp_plan_id are intentionally nullable — they are
-- populated once ops creates the athlete in TrainingPeaks and assigns
-- the plan from the coach library. Idempotent.

CREATE TABLE IF NOT EXISTS "training_peaks_assignments" (
  "id" serial PRIMARY KEY NOT NULL,
  "contact_id" integer NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
  "plan_code" text NOT NULL,
  "plan_name" text NOT NULL,
  "plan_start_date" date,
  -- 'pending' | 'active' | 'completed' | 'cancelled'
  "status" text NOT NULL DEFAULT 'pending',
  "tp_athlete_id" text,
  "tp_plan_id" text,
  "notes" text,
  -- team_user slug or trigger source (e.g. 'method-onboarding').
  "assigned_by" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS training_peaks_assignments_contact_id_idx
  ON training_peaks_assignments(contact_id);
CREATE INDEX IF NOT EXISTS training_peaks_assignments_status_idx
  ON training_peaks_assignments(status);
CREATE INDEX IF NOT EXISTS training_peaks_assignments_tp_athlete_id_idx
  ON training_peaks_assignments(tp_athlete_id);
CREATE INDEX IF NOT EXISTS training_peaks_assignments_created_at_idx
  ON training_peaks_assignments(created_at);

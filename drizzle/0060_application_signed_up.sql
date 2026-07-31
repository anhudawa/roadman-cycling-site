ALTER TABLE "cohort_applications"
  ADD COLUMN IF NOT EXISTS "signed_up_at" timestamp with time zone;

UPDATE "cohort_applications"
SET "signed_up_at" = COALESCE("signed_up_at", "created_at")
WHERE "status" = 'signed_up';

CREATE INDEX IF NOT EXISTS "cohort_applications_signed_up_at_idx"
  ON "cohort_applications" ("signed_up_at");

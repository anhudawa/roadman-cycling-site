-- One application per email per cohort $€” prevents duplicate kanban cards.
-- Deduplicate any existing rows before adding the unique index.
WITH duplicates AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(email), cohort
      ORDER BY created_at DESC
    ) AS rn
  FROM cohort_applications
)
DELETE FROM cohort_applications
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

CREATE UNIQUE INDEX IF NOT EXISTS "cohort_applications_email_cohort_idx"
  ON cohort_applications ("email", "cohort");

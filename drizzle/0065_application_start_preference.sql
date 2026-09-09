ALTER TABLE "cohort_applications" ADD COLUMN IF NOT EXISTS "start_preference" text;
--> statement-breakpoint
ALTER TABLE "cohort_applications" ADD COLUMN IF NOT EXISTS "preferred_start_date" date;

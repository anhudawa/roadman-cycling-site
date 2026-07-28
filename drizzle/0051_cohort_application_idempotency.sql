ALTER TABLE "cohort_applications" ADD COLUMN "submission_key" text;--> statement-breakpoint
ALTER TABLE "cohort_applications" ADD COLUMN "attribution" jsonb;

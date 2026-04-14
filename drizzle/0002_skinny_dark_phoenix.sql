CREATE TABLE "cohort_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"goal" text NOT NULL,
	"hours" text NOT NULL,
	"ftp" text,
	"frustration" text NOT NULL,
	"cohort" text DEFAULT '2026' NOT NULL,
	"persona" text,
	"status" text DEFAULT 'awaiting_response' NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD COLUMN "assigned_to" text;--> statement-breakpoint
CREATE INDEX "cohort_applications_created_at_idx" ON "cohort_applications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "cohort_applications_cohort_idx" ON "cohort_applications" USING btree ("cohort");--> statement-breakpoint
CREATE INDEX "cohort_applications_read_at_idx" ON "cohort_applications" USING btree ("read_at");
CREATE TABLE IF NOT EXISTS "ndy_application_followups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "application_id" integer NOT NULL REFERENCES "cohort_applications"("id") ON DELETE CASCADE,
  "submission_key" text NOT NULL,
  "access_token" text NOT NULL,
  "fit" text NOT NULL,
  "email_status" text DEFAULT 'pending' NOT NULL,
  "email_attempts" integer DEFAULT 0 NOT NULL,
  "email_attempted_at" timestamp with time zone,
  "email_error" text,
  "subscriber_id" text,
  "journey_id" text,
  "enrolled_at" timestamp with time zone,
  "checkout_started_at" timestamp with time zone,
  "question" text,
  "question_received_at" timestamp with time zone,
  "sarah_status" text DEFAULT 'none' NOT NULL,
  "sarah_attempts" integer DEFAULT 0 NOT NULL,
  "sarah_attempted_at" timestamp with time zone,
  "sarah_error" text,
  "sarah_notified_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ndy_followups_application_submission_idx" ON "ndy_application_followups" ("application_id", "submission_key");
CREATE UNIQUE INDEX IF NOT EXISTS "ndy_followups_access_token_idx" ON "ndy_application_followups" ("access_token");
CREATE INDEX IF NOT EXISTS "ndy_followups_delivery_idx" ON "ndy_application_followups" ("email_status", "created_at");
CREATE INDEX IF NOT EXISTS "ndy_followups_sarah_idx" ON "ndy_application_followups" ("sarah_status", "question_received_at");

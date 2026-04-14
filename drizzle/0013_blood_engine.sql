CREATE TABLE IF NOT EXISTS "blood_engine_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"has_access" boolean DEFAULT false NOT NULL,
	"stripe_customer_id" text,
	"stripe_session_id" text,
	"access_granted_at" timestamp with time zone,
	"tos_accepted_at" timestamp with time zone,
	"tos_version" text,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blood_engine_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blood_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"draw_date" date,
	"context" jsonb NOT NULL,
	"results" jsonb NOT NULL,
	"interpretation" jsonb,
	"prompt_version" text,
	"retest_due_at" timestamp with time zone,
	"retest_nudge_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "blood_reports" ADD CONSTRAINT "blood_reports_user_id_blood_engine_users_id_fk"
	FOREIGN KEY ("user_id") REFERENCES "blood_engine_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blood_engine_users_email_idx" ON "blood_engine_users" ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blood_reports_user_id_idx" ON "blood_reports" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blood_reports_retest_due_idx" ON "blood_reports" ("retest_due_at");

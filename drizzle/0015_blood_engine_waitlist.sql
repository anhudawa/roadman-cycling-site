CREATE TABLE IF NOT EXISTS "blood_engine_waitlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"source" text,
	"referrer" text,
	"user_agent" text,
	"ip" text,
	"notified_at" timestamp with time zone,
	"unsubscribed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blood_engine_waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blood_engine_waitlist_created_at_idx"
	ON "blood_engine_waitlist" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blood_engine_waitlist_source_idx"
	ON "blood_engine_waitlist" ("source");

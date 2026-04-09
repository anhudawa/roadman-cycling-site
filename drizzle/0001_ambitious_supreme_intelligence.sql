CREATE TABLE "contact_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"source" text,
	"source_page" text,
	"signed_up_at" timestamp with time zone,
	"skool_joined_at" timestamp with time zone,
	"trial_started_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"churned_at" timestamp with time zone,
	"beehiiv_id" text,
	"stripe_customer_id" text,
	"persona" text,
	"meta" jsonb,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "contact_submissions_read_at_idx" ON "contact_submissions" USING btree ("read_at");--> statement-breakpoint
CREATE INDEX "subscribers_email_idx" ON "subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "subscribers_signed_up_at_idx" ON "subscribers" USING btree ("signed_up_at");
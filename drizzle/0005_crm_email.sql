CREATE TABLE IF NOT EXISTS "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_slug_unique" UNIQUE("slug");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_templates_slug_idx" ON "email_templates" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_templates_updated_at_idx" ON "email_templates" USING btree ("updated_at");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "email_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"template_id" integer,
	"from_user" text NOT NULL,
	"from_address" text NOT NULL,
	"to_address" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"resend_message_id" text,
	"status" text DEFAULT 'queued' NOT NULL,
	"error_message" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "email_templates"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_messages_contact_id_idx" ON "email_messages" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_messages_sent_at_idx" ON "email_messages" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_messages_status_idx" ON "email_messages" USING btree ("status");--> statement-breakpoint

-- Seed starter templates (idempotent via slug uniqueness)
INSERT INTO "email_templates" ("name", "slug", "subject", "body", "created_by")
VALUES
  (
    'NDY Application $€” quick follow-up',
    'ndy-followup-48h',
    'Following up on your NDY application',
    E'{{first_name}},\n\nSaw your application for NDY Cohort 2 come through a couple of days back. Wanted to make sure it didn''t get buried.\n\nStill keen to chat if you are. Reply here and I''ll get back to you the same day.\n\nAnthony',
    'ted'
  ),
  (
    'Welcome to NDY Cohort 2',
    'cohort-welcome',
    'Welcome to NDY Cohort 2',
    E'{{first_name}},\n\nYou''re in. Welcome to Cohort 2.\n\nNext steps land in your inbox over the coming days $€” onboarding call, training plan intake, the lot. Nothing for you to do right now except keep riding.\n\nIf you''ve any questions in the meantime, reply here. Goes straight to me.\n\nAnthony',
    'ted'
  ),
  (
    'NDY Cohort 2 $€” decision',
    'cohort-rejection',
    'About your NDY Cohort 2 application',
    E'{{first_name}},\n\nThanks for putting the application in. Had a proper read through it.\n\nCohort 2 isn''t the right fit for you right now. That''s not a reflection on you as a rider $€” it''s about where you are versus what this cohort is built around.\n\nI''ll keep you on the list for the next intake and flag anything else that might suit. Keep at it.\n\nAnthony',
    'ted'
  ),
  (
    'Quick check-in',
    'general-checkin',
    'Quick one',
    E'{{first_name}},\n\nJust checking in. How''s the training going?\n\nAnything I can help with, shout.\n\nAnthony',
    'ted'
  )
ON CONFLICT ("slug") DO NOTHING;

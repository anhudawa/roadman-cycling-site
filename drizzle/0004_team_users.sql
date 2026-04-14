CREATE TABLE IF NOT EXISTS "team_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_users" ADD CONSTRAINT "team_users_email_unique" UNIQUE("email");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_users" ADD CONSTRAINT "team_users_slug_unique" UNIQUE("slug");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "team_users_email_idx" ON "team_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "team_users_slug_idx" ON "team_users" USING btree ("slug");--> statement-breakpoint
-- Seed placeholder rows (empty password_hash will never match any sha256 hash).
-- Run scripts/seed-team-users.ts with TEAM_PASSWORD_* env vars to set real hashes.
INSERT INTO "team_users" ("email", "name", "slug", "password_hash", "role", "active")
VALUES
  ('ted@roadmancycling.com', 'Ted', 'ted', '', 'admin', true),
  ('sarah@roadmancycling.com', 'Sarah', 'sarah', '', 'member', true),
  ('wes@roadmancycling.com', 'Wes', 'wes', '', 'member', true),
  ('matthew@roadmancycling.com', 'Matthew', 'matthew', '', 'member', true)
ON CONFLICT (email) DO NOTHING;

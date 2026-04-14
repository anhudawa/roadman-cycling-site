CREATE TABLE "contact_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"meta" jsonb,
	"author_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"phone" text,
	"owner" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"custom_fields" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"source" text,
	"lifecycle_stage" text DEFAULT 'lead' NOT NULL,
	"first_seen_at" timestamp with time zone,
	"last_activity_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contacts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "episode_downloads_cache" (
	"episode_id" text PRIMARY KEY NOT NULL,
	"downloads" integer NOT NULL,
	"source" text DEFAULT 'seeded' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "monthly_social_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"month" text NOT NULL,
	"platform" text NOT NULL,
	"views" integer NOT NULL,
	"entered_at" timestamp with time zone DEFAULT now(),
	"entered_by" text
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer,
	"title" text NOT NULL,
	"notes" text,
	"due_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"assigned_to" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "team_users_email_unique" UNIQUE("email"),
	CONSTRAINT "team_users_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "contact_activities" ADD CONSTRAINT "contact_activities_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_activities_contact_id_idx" ON "contact_activities" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "contact_activities_created_at_idx" ON "contact_activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "contacts_email_idx" ON "contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "contacts_owner_idx" ON "contacts" USING btree ("owner");--> statement-breakpoint
CREATE INDEX "contacts_lifecycle_stage_idx" ON "contacts" USING btree ("lifecycle_stage");--> statement-breakpoint
CREATE INDEX "contacts_last_activity_at_idx" ON "contacts" USING btree ("last_activity_at");--> statement-breakpoint
CREATE UNIQUE INDEX "monthly_social_stats_month_platform_idx" ON "monthly_social_stats" USING btree ("month","platform");--> statement-breakpoint
CREATE INDEX "tasks_contact_id_idx" ON "tasks" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "tasks_assigned_to_idx" ON "tasks" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "tasks_due_at_idx" ON "tasks" USING btree ("due_at");--> statement-breakpoint
CREATE INDEX "tasks_completed_at_idx" ON "tasks" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX "team_users_email_idx" ON "team_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "team_users_slug_idx" ON "team_users" USING btree ("slug");
CREATE TABLE "ab_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"page" text NOT NULL,
	"element" text NOT NULL,
	"variants" jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"winner_variant_id" text,
	"created_by" text DEFAULT 'manual' NOT NULL,
	"completed_by" text
);
--> statement-breakpoint
CREATE TABLE "agent_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_date" date NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"summary" text NOT NULL,
	"page_analyses" jsonb,
	"suggested_experiments" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "beehiiv_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"snapshot_date" date NOT NULL,
	"total_subscribers" integer NOT NULL,
	"active_subscribers" integer NOT NULL,
	"new_subscribers_today" integer NOT NULL,
	"avg_open_rate" real NOT NULL,
	"avg_click_rate" real NOT NULL,
	"raw_data" jsonb
);
--> statement-breakpoint
CREATE TABLE "content_chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" integer NOT NULL,
	"role" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"page" text NOT NULL,
	"referrer" text,
	"user_agent" text,
	"device" text NOT NULL,
	"email" text,
	"source" text,
	"session_id" text NOT NULL,
	"meta" jsonb,
	"variant_id" text
);
--> statement-breakpoint
CREATE TABLE "repurposed_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"episode_id" integer NOT NULL,
	"content_type" text NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repurposed_episodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"episode_slug" text NOT NULL,
	"episode_title" text NOT NULL,
	"episode_number" integer NOT NULL,
	"pillar" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "repurposed_episodes_episode_slug_unique" UNIQUE("episode_slug")
);
--> statement-breakpoint
CREATE TABLE "stripe_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"snapshot_date" date NOT NULL,
	"total_revenue_cents" integer NOT NULL,
	"transaction_count" integer NOT NULL,
	"mrr_cents" integer NOT NULL,
	"raw_data" jsonb
);
--> statement-breakpoint
ALTER TABLE "content_chat_messages" ADD CONSTRAINT "content_chat_messages_content_id_repurposed_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."repurposed_content"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repurposed_content" ADD CONSTRAINT "repurposed_content_episode_id_repurposed_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."repurposed_episodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "beehiiv_snapshots_date_idx" ON "beehiiv_snapshots" USING btree ("snapshot_date");--> statement-breakpoint
CREATE INDEX "events_timestamp_idx" ON "events" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "events_page_idx" ON "events" USING btree ("page");--> statement-breakpoint
CREATE INDEX "events_session_id_idx" ON "events" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stripe_snapshots_date_idx" ON "stripe_snapshots" USING btree ("snapshot_date");
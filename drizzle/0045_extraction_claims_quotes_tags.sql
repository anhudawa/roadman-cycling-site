CREATE TABLE "claims" (
	"id" serial PRIMARY KEY NOT NULL,
	"episode_slug" text NOT NULL,
	"claim" text NOT NULL,
	"confidence" real DEFAULT 0 NOT NULL,
	"evidence" text,
	"claim_type" text,
	"speaker" text,
	"speaker_entity_slug" text,
	"supporting_quote" text,
	"timestamp" text,
	"topic_tags" text[],
	"reviewed" boolean DEFAULT false NOT NULL,
	"model" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"episode_slug" text NOT NULL,
	"quote" text NOT NULL,
	"speaker" text NOT NULL,
	"speaker_credential" text,
	"speaker_entity_slug" text,
	"word_count" integer DEFAULT 0 NOT NULL,
	"context" text,
	"timestamp" text,
	"topic_tags" text[],
	"reviewed" boolean DEFAULT false NOT NULL,
	"model" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topic_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"episode_slug" text NOT NULL,
	"tag" text NOT NULL,
	"slug" text NOT NULL,
	"kind" text NOT NULL,
	"entity_slug" text,
	"relevance" real DEFAULT 0 NOT NULL,
	"reviewed" boolean DEFAULT false NOT NULL,
	"model" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "claims_episode_slug_idx" ON "claims" USING btree ("episode_slug");--> statement-breakpoint
CREATE INDEX "claims_speaker_entity_slug_idx" ON "claims" USING btree ("speaker_entity_slug");--> statement-breakpoint
CREATE INDEX "quotes_episode_slug_idx" ON "quotes" USING btree ("episode_slug");--> statement-breakpoint
CREATE INDEX "quotes_speaker_entity_slug_idx" ON "quotes" USING btree ("speaker_entity_slug");--> statement-breakpoint
CREATE INDEX "topic_tags_episode_slug_idx" ON "topic_tags" USING btree ("episode_slug");--> statement-breakpoint
CREATE INDEX "topic_tags_slug_idx" ON "topic_tags" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "topic_tags_episode_slug_slug_uniq" ON "topic_tags" USING btree ("episode_slug","slug");

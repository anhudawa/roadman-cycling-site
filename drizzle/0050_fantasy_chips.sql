CREATE TABLE "fantasy_chips" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"chip" text NOT NULL,
	"stage_number" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fantasy_team_totals" ADD COLUMN "previous_rank" integer;--> statement-breakpoint
ALTER TABLE "fantasy_chips" ADD CONSTRAINT "fantasy_chips_team_id_fantasy_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."fantasy_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "fantasy_chips_team_chip_uniq" ON "fantasy_chips" USING btree ("team_id","chip");--> statement-breakpoint
CREATE INDEX "fantasy_chips_stage_idx" ON "fantasy_chips" USING btree ("stage_number");
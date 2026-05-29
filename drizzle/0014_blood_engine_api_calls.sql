CREATE TABLE IF NOT EXISTS "blood_engine_api_calls" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "blood_engine_api_calls" ADD CONSTRAINT "blood_engine_api_calls_user_id_blood_engine_users_id_fk"
	FOREIGN KEY ("user_id") REFERENCES "blood_engine_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blood_engine_api_calls_user_action_idx"
	ON "blood_engine_api_calls" ("user_id", "action", "created_at");

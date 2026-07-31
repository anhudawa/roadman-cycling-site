CREATE TABLE "marketing_spend" (
	"id" serial PRIMARY KEY NOT NULL,
	"spend_date" date NOT NULL,
	"channel" text NOT NULL,
	"campaign" text,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"notes" text,
	"source" text DEFAULT 'manual' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "marketing_spend_date_idx" ON "marketing_spend" USING btree ("spend_date");
--> statement-breakpoint
CREATE INDEX "marketing_spend_channel_idx" ON "marketing_spend" USING btree ("channel");

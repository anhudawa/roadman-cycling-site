-- The Roadman Method — premium 12-week course
--
-- Three tables: enrollments, per-module progress, magic-link tokens.
-- See docs/method-architecture.md §5.

CREATE TABLE IF NOT EXISTS "method_enrollments" (
    "id" serial PRIMARY KEY NOT NULL,
    "email" text NOT NULL,
    "name" text,
    "status" text DEFAULT 'pending' NOT NULL,
    "paid_at" timestamp with time zone,
    "drip_start_at" timestamp with time zone,
    "amount_cents" integer,
    "currency" text DEFAULT 'usd' NOT NULL,
    "stripe_session_id" text,
    "stripe_payment_intent_id" text,
    "stripe_event_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "notes" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "method_enrollments_email_unique" UNIQUE("email"),
    CONSTRAINT "method_enrollments_stripe_session_id_unique" UNIQUE("stripe_session_id")
);

CREATE INDEX IF NOT EXISTS "method_enrollments_email_idx" ON "method_enrollments" ("email");
CREATE INDEX IF NOT EXISTS "method_enrollments_status_idx" ON "method_enrollments" ("status");
CREATE INDEX IF NOT EXISTS "method_enrollments_paid_at_idx" ON "method_enrollments" ("paid_at");

CREATE TABLE IF NOT EXISTS "method_progress" (
    "id" serial PRIMARY KEY NOT NULL,
    "enrollment_id" integer NOT NULL,
    "module_slug" text NOT NULL,
    "completed_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "method_progress_enrollment_module_unique" UNIQUE("enrollment_id","module_slug")
);

ALTER TABLE "method_progress"
    ADD CONSTRAINT "method_progress_enrollment_id_fk"
    FOREIGN KEY ("enrollment_id") REFERENCES "method_enrollments"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "method_progress_enrollment_id_idx" ON "method_progress" ("enrollment_id");
CREATE INDEX IF NOT EXISTS "method_progress_module_slug_idx" ON "method_progress" ("module_slug");

CREATE TABLE IF NOT EXISTS "method_login_tokens" (
    "id" serial PRIMARY KEY NOT NULL,
    "enrollment_id" integer NOT NULL,
    "token_hash" text NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "method_login_tokens_token_hash_unique" UNIQUE("token_hash")
);

ALTER TABLE "method_login_tokens"
    ADD CONSTRAINT "method_login_tokens_enrollment_id_fk"
    FOREIGN KEY ("enrollment_id") REFERENCES "method_enrollments"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "method_login_tokens_enrollment_id_idx" ON "method_login_tokens" ("enrollment_id");
CREATE INDEX IF NOT EXISTS "method_login_tokens_expires_at_idx" ON "method_login_tokens" ("expires_at");

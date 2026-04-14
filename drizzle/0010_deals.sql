CREATE TABLE IF NOT EXISTS "deals" (
  "id" serial PRIMARY KEY NOT NULL,
  "contact_id" integer REFERENCES "contacts"("id"),
  "title" text NOT NULL,
  "value_cents" integer NOT NULL DEFAULT 0,
  "currency" text NOT NULL DEFAULT 'EUR',
  "stage" text NOT NULL DEFAULT 'qualified',
  "owner_slug" text,
  "source" text,
  "expected_close_date" date,
  "closed_at" timestamptz,
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS deals_contact_id_idx ON deals(contact_id);
CREATE INDEX IF NOT EXISTS deals_stage_idx ON deals(stage);
CREATE INDEX IF NOT EXISTS deals_owner_slug_idx ON deals(owner_slug);
CREATE INDEX IF NOT EXISTS deals_expected_close_date_idx ON deals(expected_close_date);

CREATE TABLE IF NOT EXISTS "bookings" (
  "id" serial PRIMARY KEY NOT NULL,
  "contact_id" integer REFERENCES "contacts"("id") ON DELETE CASCADE,
  "owner_slug" text NOT NULL,
  "title" text NOT NULL,
  "scheduled_at" timestamptz NOT NULL,
  "duration_minutes" integer NOT NULL DEFAULT 30,
  "location" text,
  "notes" text,
  "status" text NOT NULL DEFAULT 'scheduled',
  "completed_at" timestamptz,
  "created_by_slug" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bookings_contact_id_idx ON bookings(contact_id);
CREATE INDEX IF NOT EXISTS bookings_owner_slug_idx ON bookings(owner_slug);
CREATE INDEX IF NOT EXISTS bookings_scheduled_at_idx ON bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);

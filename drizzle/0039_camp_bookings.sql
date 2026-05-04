-- Roadman Training Camps — bookings + auto-derived room assignments.
-- Idempotent so it's safe against partially-applied environments.

CREATE TABLE IF NOT EXISTS "camp_bookings" (
  "id" serial PRIMARY KEY NOT NULL,
  "camp" text NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "single_room" boolean NOT NULL DEFAULT false,
  "dietary" text,
  "emergency_contact_name" text,
  "emergency_contact_phone" text,
  "medical" text,
  "heard_from" text,
  "status" text NOT NULL DEFAULT 'pending',
  "paid_at" timestamptz,
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS camp_bookings_camp_idx ON camp_bookings(camp);
CREATE INDEX IF NOT EXISTS camp_bookings_status_idx ON camp_bookings(status);
CREATE INDEX IF NOT EXISTS camp_bookings_created_at_idx ON camp_bookings(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS camp_bookings_email_camp_idx
  ON camp_bookings(email, camp);

CREATE TABLE IF NOT EXISTS "camp_room_assignments" (
  "id" serial PRIMARY KEY NOT NULL,
  "booking_id" integer NOT NULL REFERENCES "camp_bookings"("id") ON DELETE CASCADE,
  "camp" text NOT NULL,
  "room_key" text NOT NULL,
  "bed_key" text NOT NULL,
  "is_single_occupancy" boolean NOT NULL DEFAULT false,
  "assigned_at" timestamptz NOT NULL DEFAULT now(),
  "assigned_by" text NOT NULL DEFAULT 'auto'
);

CREATE INDEX IF NOT EXISTS camp_room_assignments_camp_idx
  ON camp_room_assignments(camp);
CREATE INDEX IF NOT EXISTS camp_room_assignments_booking_id_idx
  ON camp_room_assignments(booking_id);
CREATE UNIQUE INDEX IF NOT EXISTS camp_room_assignments_camp_room_bed_idx
  ON camp_room_assignments(camp, room_key, bed_key);
CREATE UNIQUE INDEX IF NOT EXISTS camp_room_assignments_booking_room_idx
  ON camp_room_assignments(booking_id, room_key, bed_key);

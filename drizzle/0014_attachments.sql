CREATE TABLE IF NOT EXISTS "attachments" (
  "id" serial PRIMARY KEY NOT NULL,
  "contact_id" integer REFERENCES "contacts"("id") ON DELETE CASCADE,
  "filename" text NOT NULL,
  "content_type" text,
  "size_bytes" integer,
  "blob_url" text NOT NULL,
  "blob_pathname" text NOT NULL,
  "uploaded_by_slug" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS attachments_contact_id_idx ON attachments(contact_id);
CREATE INDEX IF NOT EXISTS attachments_created_at_idx ON attachments(created_at DESC);

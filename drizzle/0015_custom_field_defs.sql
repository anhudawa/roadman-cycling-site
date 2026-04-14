CREATE TABLE IF NOT EXISTS "custom_field_defs" (
  "id" serial PRIMARY KEY NOT NULL,
  "key" text NOT NULL UNIQUE,
  "label" text NOT NULL,
  "type" text NOT NULL,              -- 'text' | 'longtext' | 'number' | 'date' | 'url' | 'select' | 'boolean'
  "options" jsonb NOT NULL DEFAULT '[]'::jsonb,  -- array of {label, value} for select
  "help_text" text,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS custom_field_defs_sort_order_idx ON custom_field_defs(sort_order);

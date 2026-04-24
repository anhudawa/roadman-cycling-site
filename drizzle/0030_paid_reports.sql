-- ═══════════════════════════════════════════════════════════
-- Phase 2: Paid Reports + Diagnostic Framework
-- ═══════════════════════════════════════════════════════════
--
-- Adds the commercial layer on top of saved diagnostics:
--  · diagnostic_definitions  — frozen snapshot of every tool config
--    that riders were ever scored against (versioned for admin review)
--  · diagnostic_results      — canonical scored output per tool_result
--    (plateau keeps its own richer row; this gives us a uniform shape)
--  · report_products         — SKU registry, prices editable at runtime
--  · orders                  — Stripe checkout sessions, idempotent
--  · paid_reports            — one row per paid_report lifecycle
--  · consent_records         — every explicit consent capture, auditable
--  · crm_sync_logs           — every outbound CRM call (success + failure)
--  · admin_audit_logs        — admin actions on reports (resend, revoke…)
--
-- Extends rider_profiles with weight unit, target-event polish, lead
-- scoring, training tool, coaching status + separate marketing vs
-- data-storage consent flags.

-- ───────────────────────────────────────────────────────────
-- 1. rider_profiles extensions
-- ───────────────────────────────────────────────────────────
ALTER TABLE "rider_profiles"
  ADD COLUMN IF NOT EXISTS "current_weight"          numeric(5,2),
  ADD COLUMN IF NOT EXISTS "weight_unit"             text DEFAULT 'kg',
  ADD COLUMN IF NOT EXISTS "training_tool"           text,
  ADD COLUMN IF NOT EXISTS "coaching_status"         text,
  ADD COLUMN IF NOT EXISTS "coaching_interest_level" integer,
  ADD COLUMN IF NOT EXISTS "lead_score"              integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "marketing_consent"       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "data_storage_consent"    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "research_consent"        boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "last_lead_score_at"      timestamptz;

CREATE INDEX IF NOT EXISTS "rider_profiles_lead_score_idx"
  ON "rider_profiles" ("lead_score" DESC);

-- ───────────────────────────────────────────────────────────
-- 2. diagnostic_definitions — frozen snapshots
-- ───────────────────────────────────────────────────────────
-- Every tool upgrade bumps version; rider completions reference the exact
-- version they were scored against so admin can audit scoring changes.
CREATE TABLE IF NOT EXISTS "diagnostic_definitions" (
  "id"          serial PRIMARY KEY,
  "tool_slug"   text NOT NULL,                        -- plateau | fuelling | ftp_zones | …
  "version"     integer NOT NULL,                     -- monotonically increasing per tool
  "title"       text NOT NULL,
  "description" text,
  "config"      jsonb NOT NULL,                       -- full DiagnosticDefinition payload
  "created_at"  timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("tool_slug", "version")
);
CREATE INDEX IF NOT EXISTS "diagnostic_definitions_tool_slug_idx"
  ON "diagnostic_definitions" ("tool_slug");

-- ───────────────────────────────────────────────────────────
-- 3. diagnostic_results — canonical scored output per run
-- ───────────────────────────────────────────────────────────
-- Every framework-driven run emits one row here. Plateau's legacy
-- `diagnostic_submissions` table remains authoritative for plateau's
-- richer profile breakdown, but this table is the uniform interface
-- the paid-report generator reads from.
CREATE TABLE IF NOT EXISTS "diagnostic_results" (
  "id"               serial PRIMARY KEY,
  "tool_result_id"   integer NOT NULL REFERENCES "tool_results" ("id") ON DELETE CASCADE,
  "definition_id"    integer REFERENCES "diagnostic_definitions" ("id") ON DELETE SET NULL,
  "rider_profile_id" integer REFERENCES "rider_profiles" ("id") ON DELETE SET NULL,
  "tool_slug"        text    NOT NULL,
  "scores"           jsonb   NOT NULL,                 -- per-category numeric scores
  "primary_category" text    NOT NULL,                 -- dominant limiter / primary bucket
  "secondary_category" text,
  "risk_flags"       jsonb   NOT NULL DEFAULT '[]'::jsonb,
  "recommendations"  jsonb   NOT NULL DEFAULT '[]'::jsonb,
  "resource_slug"    text,
  "summary"          text    NOT NULL,
  "created_at"       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "diagnostic_results_tool_result_id_idx"
  ON "diagnostic_results" ("tool_result_id");
CREATE INDEX IF NOT EXISTS "diagnostic_results_tool_slug_idx"
  ON "diagnostic_results" ("tool_slug");
CREATE INDEX IF NOT EXISTS "diagnostic_results_primary_category_idx"
  ON "diagnostic_results" ("primary_category");

-- ───────────────────────────────────────────────────────────
-- 4. report_products — SKU registry
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "report_products" (
  "id"                serial PRIMARY KEY,
  "slug"              text NOT NULL UNIQUE,             -- report_plateau | report_fuelling | …
  "name"              text NOT NULL,
  "description"       text NOT NULL,
  "tool_slug"         text,                              -- which tool unlocks it (null for bundles)
  "bundle_items"      jsonb,                             -- array of product slugs for bundle SKUs
  "price_cents"       integer NOT NULL,
  "currency"          text NOT NULL DEFAULT 'eur',
  "stripe_price_id"   text,                              -- optional live-mode price id
  "active"            boolean NOT NULL DEFAULT true,
  "page_count_target" integer,                           -- for admin QA
  "created_at"        timestamptz NOT NULL DEFAULT now(),
  "updated_at"        timestamptz NOT NULL DEFAULT now()
);

-- ───────────────────────────────────────────────────────────
-- 5. orders — Stripe checkout lifecycle (idempotent)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "orders" (
  "id"                        serial PRIMARY KEY,
  "rider_profile_id"          integer REFERENCES "rider_profiles" ("id") ON DELETE SET NULL,
  "email"                     text NOT NULL,
  "product_slug"              text NOT NULL,
  "tool_result_id"            integer REFERENCES "tool_results" ("id") ON DELETE SET NULL,
  "amount_cents"              integer NOT NULL,
  "currency"                  text NOT NULL DEFAULT 'eur',
  "status"                    text NOT NULL DEFAULT 'pending',
                                                            -- pending | paid | refunded | failed
  "stripe_checkout_session_id" text UNIQUE,
  "stripe_payment_intent_id"   text,
  "stripe_event_ids"           jsonb NOT NULL DEFAULT '[]'::jsonb,
                                                            -- every processed webhook event id, for idempotency
  "receipt_url"                text,
  "utm"                        jsonb,
  "created_at"                 timestamptz NOT NULL DEFAULT now(),
  "paid_at"                    timestamptz,
  "updated_at"                 timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "orders_email_idx" ON "orders" ("email");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" ("status");
CREATE INDEX IF NOT EXISTS "orders_product_slug_idx" ON "orders" ("product_slug");
CREATE INDEX IF NOT EXISTS "orders_rider_profile_id_idx" ON "orders" ("rider_profile_id");

-- ───────────────────────────────────────────────────────────
-- 6. paid_reports — generation lifecycle per order
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "paid_reports" (
  "id"               serial PRIMARY KEY,
  "order_id"         integer NOT NULL REFERENCES "orders" ("id") ON DELETE CASCADE,
  "rider_profile_id" integer REFERENCES "rider_profiles" ("id") ON DELETE SET NULL,
  "email"            text NOT NULL,
  "product_slug"     text NOT NULL,
  "tool_result_id"   integer REFERENCES "tool_results" ("id") ON DELETE SET NULL,
  "status"           text NOT NULL DEFAULT 'pending_payment',
                     -- pending_payment | payment_confirmed | generating | generated
                     -- | delivered | failed | refunded | revoked
  "status_reason"    text,
  "secure_token_hash" text,                                 -- sha256 of URL token; raw token only emailed
  "pdf_url"          text,                                  -- signed URL or admin path to the PDF
  "web_report_html"  text,                                  -- optional inline HTML rendering
  "page_count"       integer,
  "generator_version" text,
  "delivered_at"     timestamptz,
  "revoked_at"       timestamptz,
  "last_resent_at"   timestamptz,
  "download_count"   integer NOT NULL DEFAULT 0,
  "created_at"       timestamptz NOT NULL DEFAULT now(),
  "updated_at"       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "paid_reports_email_idx" ON "paid_reports" ("email");
CREATE INDEX IF NOT EXISTS "paid_reports_status_idx" ON "paid_reports" ("status");
CREATE INDEX IF NOT EXISTS "paid_reports_order_id_idx" ON "paid_reports" ("order_id");
CREATE INDEX IF NOT EXISTS "paid_reports_rider_profile_id_idx" ON "paid_reports" ("rider_profile_id");

-- ───────────────────────────────────────────────────────────
-- 7. consent_records — granular, auditable consent log
-- ───────────────────────────────────────────────────────────
-- One row per capture — unlike the boolean flags on rider_profiles this
-- keeps a full audit trail (GDPR-ready: erase request can replay exactly
-- what the rider agreed to, when).
CREATE TABLE IF NOT EXISTS "consent_records" (
  "id"               serial PRIMARY KEY,
  "rider_profile_id" integer REFERENCES "rider_profiles" ("id") ON DELETE CASCADE,
  "email"            text NOT NULL,
  "consent_type"     text NOT NULL,
                     -- save_profile | email_result | marketing | research | data_storage | report_delivery
  "granted"          boolean NOT NULL,
  "source"           text NOT NULL,                         -- tool slug + step, e.g. plateau:result-save
  "copy_version"     text,                                   -- hash of the consent text shown
  "ip_hash"          text,
  "user_agent"       text,
  "created_at"       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "consent_records_email_idx" ON "consent_records" ("email");
CREATE INDEX IF NOT EXISTS "consent_records_rider_profile_id_idx" ON "consent_records" ("rider_profile_id");
CREATE INDEX IF NOT EXISTS "consent_records_consent_type_idx" ON "consent_records" ("consent_type");

-- ───────────────────────────────────────────────────────────
-- 8. crm_sync_logs — outbound CRM call audit
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "crm_sync_logs" (
  "id"             serial PRIMARY KEY,
  "email"          text NOT NULL,
  "target"         text NOT NULL,                            -- beehiiv | contacts | resend | custom
  "operation"      text NOT NULL,                            -- tag_add | tag_remove | upsert | activity
  "payload"        jsonb NOT NULL,
  "status"         text NOT NULL DEFAULT 'pending',          -- pending | success | failed | skipped
  "error"          text,
  "attempt_count"  integer NOT NULL DEFAULT 1,
  "related_table"  text,                                     -- tool_results | orders | paid_reports
  "related_id"     integer,
  "created_at"     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "crm_sync_logs_email_idx" ON "crm_sync_logs" ("email");
CREATE INDEX IF NOT EXISTS "crm_sync_logs_status_idx" ON "crm_sync_logs" ("status");
CREATE INDEX IF NOT EXISTS "crm_sync_logs_target_idx" ON "crm_sync_logs" ("target");

-- ───────────────────────────────────────────────────────────
-- 9. admin_audit_logs — admin actions on sensitive state
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
  "id"          serial PRIMARY KEY,
  "actor_email" text NOT NULL,
  "action"      text NOT NULL,                               -- report_resend | report_revoke | report_regenerate | consent_purge
  "target_type" text NOT NULL,                               -- paid_report | order | rider_profile
  "target_id"   integer NOT NULL,
  "reason"      text,
  "metadata"    jsonb,
  "created_at"  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "admin_audit_logs_target_idx"
  ON "admin_audit_logs" ("target_type", "target_id");
CREATE INDEX IF NOT EXISTS "admin_audit_logs_actor_email_idx"
  ON "admin_audit_logs" ("actor_email");

-- ───────────────────────────────────────────────────────────
-- 10. Seed default report_products (free to edit in admin later)
-- ───────────────────────────────────────────────────────────
INSERT INTO "report_products" (slug, name, description, tool_slug, price_cents, currency, active, page_count_target)
VALUES
  ('report_plateau',  'Roadman Plateau Report',   'Your full Plateau Diagnostic decoded — primary + secondary limiters, week-by-week unblock plan, recovery + S&C + fuelling side-effects.',      'plateau',   2400, 'eur', true, 12),
  ('report_fuelling', 'Roadman Fuelling Report',  'Hour-by-hour in-ride fuelling plan, dual-source split, heat-adjusted sodium targets, gut-training progression.',                               'fuelling',  1400, 'eur', true, 10),
  ('report_ftp',      'Roadman FTP Zone Report',  'Your personalised polarised training week built around your zones — Tuesday threshold, Thursday VO2, long Saturday Z2.',                        'ftp_zones', 1400, 'eur', true, 10),
  ('bundle_performance', 'Roadman Performance Bundle', 'All three paid reports — Plateau, Fuelling, FTP Zones — in one bundle. Save vs. buying separately.', NULL,       4900, 'eur', true, 30)
ON CONFLICT (slug) DO NOTHING;

-- Bundle child references (stored as JSON so we don't need another table).
UPDATE "report_products"
SET bundle_items = '["report_plateau","report_fuelling","report_ftp"]'::jsonb
WHERE slug = 'bundle_performance' AND bundle_items IS NULL;

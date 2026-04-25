-- Switch paid-reports currency from EUR to USD.
--
-- Migration 0030 seeded report_products rows with currency = 'eur' and
-- defaulted both report_products.currency and orders.currency to 'eur'.
-- Site-wide pricing was standardised to USD in 6888d1b; schema.ts already
-- defaults these columns to 'usd'. This migration aligns the database with
-- the schema and the displayed prices ($14 / $24 / $49 — same numeric
-- amounts kept; we are pricing the digital report tiers in dollars not
-- euros, not converting at FX).

-- 1. Backfill existing seed rows.
UPDATE "report_products" SET currency = 'usd' WHERE currency = 'eur';
UPDATE "orders"          SET currency = 'usd' WHERE currency = 'eur';

-- 2. Flip column defaults so any future row insert without explicit currency
--    matches schema.ts (which already declares default('usd')).
ALTER TABLE "report_products" ALTER COLUMN "currency" SET DEFAULT 'usd';
ALTER TABLE "orders"          ALTER COLUMN "currency" SET DEFAULT 'usd';

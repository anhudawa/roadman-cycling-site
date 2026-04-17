-- Phase: expand stripe_snapshots with the fields mission-control needs.
--
-- Existing columns: total_revenue_cents (last-30d-ish charges), transaction_count,
-- mrr_cents, raw_data. New columns track the moving averages and deltas that
-- drive the MRR dashboard without re-fetching Stripe on every page load.

ALTER TABLE stripe_snapshots
  ADD COLUMN IF NOT EXISTS active_subscriptions integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trialing_count       integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS past_due_count       integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS past_due_mrr_cents   integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS annual_mrr_cents     integer NOT NULL DEFAULT 0,
  -- Deltas vs previous snapshot
  ADD COLUMN IF NOT EXISTS net_new_mrr_cents    integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_new_subs         integer NOT NULL DEFAULT 0;

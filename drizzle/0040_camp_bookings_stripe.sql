-- Roadman Training Camps — Stripe payment columns.
-- Adds the session id + payment intent id we use to tie a Stripe checkout
-- back to the camp booking row, plus an index so the webhook can look the
-- booking up by session id when needed.

ALTER TABLE "camp_bookings"
  ADD COLUMN IF NOT EXISTS "stripe_session_id" text;
ALTER TABLE "camp_bookings"
  ADD COLUMN IF NOT EXISTS "stripe_payment_intent_id" text;

CREATE INDEX IF NOT EXISTS camp_bookings_stripe_session_idx
  ON camp_bookings(stripe_session_id);

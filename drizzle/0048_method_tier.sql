-- The Roadman Method — per-enrollment pricing tier.
--
-- Records whether the rider bought Standard ($297) or Premium ($397) so the
-- webhook and members area can gate Premium-only fulfilment (personalised
-- TrainingPeaks plan, Week-6 adjustment, Not Done Yet trial). Before this
-- column the checkout charged Standard regardless of selection.
--
-- Idempotent (IF NOT EXISTS). Safe to re-run.

ALTER TABLE "method_enrollments"
  ADD COLUMN IF NOT EXISTS "tier" text NOT NULL DEFAULT 'standard';

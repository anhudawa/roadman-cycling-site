-- Phase 1h: Resend webhook-driven delivery status columns.
-- email_messages.status values:
--   queued | sent | delivered | bounced | complained | failed

ALTER TABLE email_messages
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS opened_at    timestamptz,
  ADD COLUMN IF NOT EXISTS clicked_at   timestamptz;

CREATE INDEX IF NOT EXISTS email_messages_delivered_at_idx ON email_messages(delivered_at);
CREATE INDEX IF NOT EXISTS email_messages_opened_at_idx    ON email_messages(opened_at);
CREATE INDEX IF NOT EXISTS email_messages_resend_message_id_idx ON email_messages(resend_message_id);

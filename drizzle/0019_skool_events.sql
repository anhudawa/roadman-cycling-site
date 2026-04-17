-- Phase: capture every Skool webhook call so we can audit what Skool/Zapier
-- is actually sending and prove signups are being recorded.

CREATE TABLE IF NOT EXISTS skool_events (
  id             serial PRIMARY KEY,
  event_type     text NOT NULL,                    -- normalised: member_joined | member_updated | other | bad_payload | unauthorized
  source         text NOT NULL DEFAULT 'unknown',  -- skool_native | zapier | make | curl | unknown
  email          text,
  name           text,
  persona        text,
  raw_payload    jsonb NOT NULL,                   -- everything we received, for forensic replay
  status         text NOT NULL,                    -- accepted | skipped | error
  error_message  text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS skool_events_created_at_idx ON skool_events(created_at DESC);
CREATE INDEX IF NOT EXISTS skool_events_email_idx      ON skool_events(lower(email));
CREATE INDEX IF NOT EXISTS skool_events_status_idx     ON skool_events(status);

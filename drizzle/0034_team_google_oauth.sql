-- Phase: Google OAuth login + Calendar integration.
--
-- Each team_user can now link a Google account. We store:
--   - google_sub: Google's stable user id (the "sub" claim from OpenID)
--   - google_refresh_token: long-lived refresh token so we can call Calendar
--     API offline (only Anthony grants calendar scope; others grant only
--     openid/email/profile). Stored server-side only.
--   - google_linked_at: when the link was established.

ALTER TABLE team_users
  ADD COLUMN IF NOT EXISTS google_sub           text,
  ADD COLUMN IF NOT EXISTS google_refresh_token text,
  ADD COLUMN IF NOT EXISTS google_linked_at     timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS team_users_google_sub_idx
  ON team_users(google_sub)
  WHERE google_sub IS NOT NULL;

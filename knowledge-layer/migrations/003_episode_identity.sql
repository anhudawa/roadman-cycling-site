-- ============================================================================
-- Roadman Knowledge Layer — 003_episode_identity.sql
--
-- Decision (approved by Anthony, 2026-06-09): the RSS guid is the stable
-- unique key for episodes. Feed reality: itunes:episode covers only 783 of
-- 1,283 items, 35 numbers are used more than once, and 500 items carry no
-- number — so episode_number cannot be the identity key.
--
-- episode_number remains the member-facing display/citation number:
--   * nullable — populated only where the feed gives an UNAMBIGUOUS number
--     (used exactly once); duplicated numbers load as NULL for editorial
--     resolution (Ted, review-queue admin later)
--   * still unique where present
-- ============================================================================

alter table episodes add column rss_guid text;
alter table episodes add constraint episodes_rss_guid_key unique (rss_guid);

alter table episodes alter column episode_number drop not null;
-- (the unique constraint from 001 remains; Postgres permits multiple NULLs)

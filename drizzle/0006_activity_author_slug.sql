-- Phase 1g: add author_slug to contact_activities so My Day + activity filtering
-- can match the authenticated team user by stable slug rather than display name.

ALTER TABLE contact_activities ADD COLUMN IF NOT EXISTS author_slug text;

-- Backfill from team_users by case-insensitive name match.
UPDATE contact_activities ca
SET author_slug = tu.slug
FROM team_users tu
WHERE lower(ca.author_name) = lower(tu.name)
  AND ca.author_slug IS NULL;

CREATE INDEX IF NOT EXISTS contact_activities_author_slug_idx
  ON contact_activities(author_slug);

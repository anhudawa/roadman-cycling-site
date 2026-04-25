-- Phase: kanban pipeline for /admin/inbox.
-- Each contact_submission gets a pipeline stage so the team can triage from a
-- board instead of only a flat list.
--
-- Stage model (mirrors applications kanban):
--   new          $†’ just arrived, nobody acting
--   in_progress  $†’ assigned owner is actively handling it
--   replied      $†’ outbound reply sent, waiting on their response
--   follow_up    $†’ we owe them a nudge / next action
--   closed       $†’ resolved, archived from board

ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

-- Backfill: anything already read $†’ in_progress; unread stays new.
UPDATE contact_submissions
   SET status = 'in_progress'
 WHERE status = 'new' AND read_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS contact_submissions_status_idx ON contact_submissions(status);

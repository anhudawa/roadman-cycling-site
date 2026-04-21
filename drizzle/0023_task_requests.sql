-- Phase: peer-to-peer task requests on /admin/my-day.
--
-- Tasks can now be SENT from one team member to another and await acceptance
-- before they land in the receiver's "real" task list. Reply enables a
-- single-round-trip negotiation ("let's push this to next week") before the
-- task is accepted or declined.
--
-- request_status semantics:
--   NULL              → legacy / direct-owned task (no request flow)
--   'requested'       → sent but not yet accepted/declined
--   'accepted'        → receiver accepted; now behaves like a normal open task
--   'declined'        → receiver declined; stays in history but hidden from active lists
--
-- response_message holds the receiver's latest reply (e.g. "let's push to
-- next week"). responded_at tracks the most-recent action time.

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS request_status    text,
  ADD COLUMN IF NOT EXISTS response_message  text,
  ADD COLUMN IF NOT EXISTS responded_at      timestamptz;

CREATE INDEX IF NOT EXISTS tasks_request_status_idx
  ON tasks(request_status)
  WHERE request_status IS NOT NULL;

-- Phase: "My main focus" ordering on My Day.
--
-- Each task can be pinned into a per-assignee focus list with a numeric
-- position. Tasks with focus_order IS NULL live in "All other tasks"
-- (sorted by due date / creation), tasks with focus_order NOT NULL live
-- in "My main focus" (sorted by focus_order ascending).
--
-- We re-index the focus list on every move (1, 2, 3, $€¦) to keep ordering
-- simple, but the integer column gives us room to do sparse indexing
-- later if drag performance becomes an issue.

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS focus_order integer;

CREATE INDEX IF NOT EXISTS tasks_focus_order_idx
  ON tasks(assigned_to, focus_order)
  WHERE focus_order IS NOT NULL;

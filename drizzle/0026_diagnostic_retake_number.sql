-- Retake number for duplicate diagnostic submissions.
-- See spec §17: "Allow duplicate email submissions, but tag as 'retake'
-- in DB. Don't block — some users genuinely retake to see how their
-- profile shifts."
--
-- retake_number = 1 on first submission for an email, 2 on the second,
-- etc. Set at insert time in src/app/api/diagnostic/submit/route.ts by
-- counting prior rows for the normalised email.

ALTER TABLE diagnostic_submissions
  ADD COLUMN IF NOT EXISTS retake_number integer NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS diagnostic_submissions_retake_idx
  ON diagnostic_submissions(retake_number)
  WHERE retake_number > 1;

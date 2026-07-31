UPDATE "cohort_applications"
SET "status" = CASE "status"
  WHEN 'contacted' THEN 'contacted_once'
  WHEN 'responded' THEN 'contacted_once'
  WHEN 'offered' THEN 'final_outreach'
  WHEN 'follow_up' THEN 'final_outreach'
  WHEN 'accepted' THEN 'signed_up'
  ELSE "status"
END,
"signed_up_at" = CASE
  WHEN "status" = 'accepted' THEN COALESCE("signed_up_at", now())
  ELSE "signed_up_at"
END
WHERE "status" IN ('contacted', 'responded', 'offered', 'follow_up', 'accepted');

UPDATE "automation_rules"
SET "trigger_config" = jsonb_set(
  "trigger_config",
  '{toStage}',
  to_jsonb(
    CASE "trigger_config"->>'toStage'
      WHEN 'contacted' THEN 'contacted_once'
      WHEN 'offered' THEN 'final_outreach'
      WHEN 'accepted' THEN 'signed_up'
      ELSE "trigger_config"->>'toStage'
    END
  ),
  false
),
"updated_at" = now()
WHERE "trigger_type" = 'application.stage_changed'
  AND "trigger_config"->>'toStage' IN ('contacted', 'offered', 'accepted');

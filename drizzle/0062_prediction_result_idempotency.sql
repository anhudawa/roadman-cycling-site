DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "prediction_results"
    GROUP BY "prediction_id"
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate prediction results exist; review them before applying the unique index.';
  END IF;
END $$;--> statement-breakpoint
DROP INDEX IF EXISTS "prediction_results_prediction_id_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "prediction_results_prediction_id_idx"
  ON "prediction_results" ("prediction_id");

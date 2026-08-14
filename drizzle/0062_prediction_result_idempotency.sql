WITH ranked_results AS (
  SELECT
    "id",
    row_number() OVER (
      PARTITION BY "prediction_id"
      ORDER BY "submitted_at" DESC, "id" DESC
    ) AS row_rank
  FROM "prediction_results"
)
DELETE FROM "prediction_results"
WHERE "id" IN (
  SELECT "id"
  FROM ranked_results
  WHERE row_rank > 1
);--> statement-breakpoint
DROP INDEX IF EXISTS "prediction_results_prediction_id_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "prediction_results_prediction_id_idx"
  ON "prediction_results" ("prediction_id");

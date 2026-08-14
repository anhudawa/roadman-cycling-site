import { config } from "dotenv";
import { sql } from "drizzle-orm";

config({ path: ".env.local", quiet: true });

async function main() {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is required.");
  }

  const { db } = await import("../src/lib/db");

  await db.transaction(async (tx) => {
    const duplicateRows = await tx.execute<{ duplicateGroups: number }>(sql`
      SELECT count(*)::int AS "duplicateGroups"
      FROM (
        SELECT "prediction_id"
        FROM "prediction_results"
        GROUP BY "prediction_id"
        HAVING count(*) > 1
      ) duplicates
    `);

    const duplicateGroups = duplicateRows.rows[0]?.duplicateGroups ?? 0;
    if (duplicateGroups > 0) {
      throw new Error(
        `${duplicateGroups} duplicate prediction result group(s) found. No changes were made.`,
      );
    }

    await tx.execute(sql`
      DROP INDEX IF EXISTS "prediction_results_prediction_id_idx"
    `);
    await tx.execute(sql`
      CREATE UNIQUE INDEX "prediction_results_prediction_id_idx"
      ON "prediction_results" ("prediction_id")
    `);
  });

  console.log(
    "Prediction result uniqueness is active. No result rows were deleted.",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

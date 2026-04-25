import { config } from "dotenv";
import { sql } from "@vercel/postgres";

config({ path: ".env.local" });

async function main() {
  const before = await sql.query<{ status: string; n: number }>(
    `SELECT status, count(*)::int AS n FROM cohort_applications GROUP BY status ORDER BY status`
  );
  console.log("BEFORE:");
  for (const r of before.rows) console.log(`  ${r.status}: ${r.n}`);

  const r = await sql.query(
    `UPDATE cohort_applications SET status = 'contacted' WHERE status = 'qualified' RETURNING id`
  );
  console.log(`Migrated ${r.rowCount} qualified $†’ contacted`);

  const after = await sql.query<{ status: string; n: number }>(
    `SELECT status, count(*)::int AS n FROM cohort_applications GROUP BY status ORDER BY status`
  );
  console.log("AFTER:");
  for (const r of after.rows) console.log(`  ${r.status}: ${r.n}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

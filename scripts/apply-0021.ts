import { readFileSync } from "node:fs";
import { sql } from "@vercel/postgres";

async function main() {
  if (!process.env.POSTGRES_URL) throw new Error("POSTGRES_URL not set");
  const body = readFileSync("drizzle/0021_stripe_snapshot_cols.sql", "utf8");
  console.log("Applying drizzle/0021_stripe_snapshot_cols.sql …");
  await sql.query(body);
  const r = await sql.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'stripe_snapshots' ORDER BY ordinal_position`
  );
  console.log(`✓ stripe_snapshots columns:`);
  for (const row of r.rows) console.log(`  · ${row.column_name}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

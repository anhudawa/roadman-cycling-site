import { readFileSync } from "node:fs";
import { sql } from "@vercel/postgres";

async function main() {
  if (!process.env.POSTGRES_URL) throw new Error("POSTGRES_URL not set");
  const body = readFileSync("drizzle/0020_inbox_status.sql", "utf8");
  console.log("Applying drizzle/0020_inbox_status.sql as a single batch …");
  await sql.query(body);
  const r = await sql.query(
    `SELECT status, count(*)::int AS n FROM contact_submissions GROUP BY status`
  );
  console.log(`✓ contact_submissions rows by status:`);
  for (const row of r.rows) console.log(`  · ${row.status}: ${row.n}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { readFileSync } from "node:fs";
import { sql } from "@vercel/postgres";

async function main() {
  if (!process.env.POSTGRES_URL) throw new Error("POSTGRES_URL not set");
  const body = readFileSync("drizzle/0019_skool_events.sql", "utf8");
  // Run as one batch so CREATE TABLE + CREATE INDEX land in the same session
  // (Neon pooled driver runs each sql.query on a fresh connection otherwise).
  console.log("Applying drizzle/0019_skool_events.sql as a single batch $€¦");
  await sql.query(body);
  const r = await sql.query(
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_name = 'skool_events' ORDER BY ordinal_position`
  );
  console.log(`$œ“ skool_events has ${r.rowCount} columns:`);
  for (const row of r.rows) {
    console.log(`  $· ${row.column_name} (${row.data_type})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

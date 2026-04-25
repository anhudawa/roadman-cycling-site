import { readFileSync } from "node:fs";
import { config } from "dotenv";
import { sql } from "@vercel/postgres";

config({ path: ".env.local" });

async function main() {
  if (!process.env.POSTGRES_URL) throw new Error("POSTGRES_URL not set");
  const body = readFileSync("drizzle/0023_task_requests.sql", "utf8");
  console.log("Applying drizzle/0023_task_requests.sql $€¦");
  await sql.query(body);
  const r = await sql.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'tasks' ORDER BY ordinal_position`
  );
  console.log("tasks columns:");
  for (const row of r.rows) console.log(`  $· ${row.column_name}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

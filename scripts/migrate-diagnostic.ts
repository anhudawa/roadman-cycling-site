import { readFileSync } from "node:fs";
import { config } from "dotenv";
import { sql } from "@vercel/postgres";

/**
 * Applies the Plateau Diagnostic migrations (0025 + 0026) and verifies
 * the resulting table shape. Idempotent: both SQL files use
 * `IF NOT EXISTS`, so it's safe to re-run.
 *
 *   POSTGRES_URL=postgres://... npm run migrate:diagnostic
 *
 * Matches the pattern in scripts/apply-0024.ts $€” dotenv + @vercel/postgres,
 * no new runtime deps.
 */

config({ path: ".env.local" });

const MIGRATIONS = [
  "drizzle/0025_diagnostic_submissions.sql",
  "drizzle/0026_diagnostic_retake_number.sql",
] as const;

async function main() {
  if (!process.env.POSTGRES_URL) {
    throw new Error(
      "POSTGRES_URL is not set. Copy it from Vercel (Storage $†’ Postgres $†’ .env.local)."
    );
  }

  for (const file of MIGRATIONS) {
    const body = readFileSync(file, "utf8");
    console.log(`$†’ Applying ${file} $€¦`);
    await sql.query(body);
    console.log(`  $œ“ done`);
  }

  console.log("\nVerifying diagnostic_submissions shape:");
  const cols = await sql.query(
    `SELECT column_name, data_type
       FROM information_schema.columns
      WHERE table_name = 'diagnostic_submissions'
      ORDER BY ordinal_position`
  );
  if (cols.rows.length === 0) {
    throw new Error(
      "diagnostic_submissions not found after migration $€” something's wrong."
    );
  }
  for (const row of cols.rows) {
    console.log(`  $· ${row.column_name} (${row.data_type})`);
  }

  const [{ count }] = (
    await sql.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM diagnostic_submissions`
    )
  ).rows;
  console.log(`\nCurrent rows: ${count}`);
  console.log(
    "\nAll set. /plateau is ready to accept submissions once the env vars are configured (see docs/plateau-diagnostic.md)."
  );
}

main().catch((err) => {
  console.error("\n$œ— Migration failed:");
  console.error(err);
  process.exit(1);
});

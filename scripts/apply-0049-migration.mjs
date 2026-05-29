/**
 * One-shot applier for drizzle/0049_method_onboarding.sql.
 * Run: `set -a && source .env.local && set +a && node scripts/apply-0049-migration.mjs`
 *
 * Idempotent (uses IF NOT EXISTS). Safe to re-run.
 */
import { sql } from "@vercel/postgres";
import { readFile } from "node:fs/promises";

const path = new URL("../drizzle/0049_method_onboarding.sql", import.meta.url);
const migration = await readFile(path, "utf8");
const stripped = migration
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");
const statements = stripped
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

for (const stmt of statements) {
  const head = stmt.split("\n")[0].slice(0, 80);
  console.log("→", head);
  await sql.query(stmt);
}
console.log("✓ migration applied");

/**
 * One-shot applier for drizzle/0047_ask_auth.sql.
 * Run: `npm run dotenv -- node scripts/apply-0047-migration.mjs`
 * or `set -a && source .env.local && set +a && node scripts/apply-0047-migration.mjs`
 *
 * Idempotent (uses IF NOT EXISTS). Safe to re-run.
 */
import { sql } from "@vercel/postgres";
import { readFile } from "node:fs/promises";

const path = new URL("../drizzle/0047_ask_auth.sql", import.meta.url);
const migration = await readFile(path, "utf8");
// Strip line-comments before splitting — otherwise a leading `-- ...`
// block makes the first CREATE TABLE chunk look comment-only.
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

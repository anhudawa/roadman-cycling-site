#!/usr/bin/env node
// Applies drizzle/0027_mcp_tables.sql directly against the database.
// Run: node scripts/apply-mcp-migration.mjs

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
const dotenv = require("dotenv");
dotenv.config({ path: join(__dirname, "../.env.local") });

const { sql } = await import("@vercel/postgres");

const migrationPath = join(__dirname, "../drizzle/0027_mcp_tables.sql");
const migrationSQL = readFileSync(migrationPath, "utf-8");

// Strip single-line comments, split on semicolons, skip empty statements
const stripped = migrationSQL
  .split("\n")
  .map((line) => line.replace(/--.*$/, ""))
  .join("\n");

const statements = stripped
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

console.log(`Running ${statements.length} SQL statements...`);

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  const preview = stmt.slice(0, 80).replace(/\n/g, " ");
  try {
    await sql.query(stmt);
    console.log(`  ✓ [${i + 1}/${statements.length}] ${preview}`);
  } catch (err) {
    console.error(`  ✗ [${i + 1}/${statements.length}] ${preview}`);
    console.error(`    Error: ${err.message}`);
    process.exit(1);
  }
}

console.log("\n✓ Migration 0027_mcp_tables applied successfully");
process.exit(0);

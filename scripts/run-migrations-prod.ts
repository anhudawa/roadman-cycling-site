/**
 * Run pending Drizzle migrations (0028–0036) against production Neon DB.
 * Usage: POSTGRES_URL=... npx tsx scripts/run-migrations-prod.ts
 */
import { sql } from "@vercel/postgres";
import fs from "node:fs";
import path from "node:path";

const MIGRATIONS_DIR = path.join(process.cwd(), "drizzle");

const PENDING = [
  "0028_ask_roadman_and_rider_profiles.sql",
  "0029_phase2_saved_diagnostics.sql",
  "0030_paid_reports.sql",
  "0031_crm_phase1.sql",
  "0032_ted_community_agent.sql",
  "0033_ted_surface_drafts.sql",
  "0034_team_google_oauth.sql",
  "0035_paid_reports_usd.sql",
  "0036_report_prices.sql",
];

/**
 * Split a SQL file into individual executable statements.
 * Handles:
 *  - Drizzle --> statement-breakpoint markers (split on those if present)
 *  - Dollar-quoted strings (DO $$ ... $$ blocks)
 *  - Single-quoted strings
 *  - Standard semicolon delimiters
 */
function splitStatements(raw: string): string[] {
  // Drizzle-generated files use explicit breakpoints — fast path
  if (raw.includes("--> statement-breakpoint")) {
    return raw
      .split(/^--> statement-breakpoint$/m)
      .map((s) => s.trim())
      .filter((s) => hasActualSQL(s));
  }

  // Hand-written files: state-machine split on `;` respecting quoting
  const statements: string[] = [];
  let current = "";
  let i = 0;

  while (i < raw.length) {
    const ch = raw[i];

    // Single-line comment — consume to end of line
    if (ch === "-" && raw[i + 1] === "-") {
      const end = raw.indexOf("\n", i);
      current += end === -1 ? raw.slice(i) : raw.slice(i, end + 1);
      i = end === -1 ? raw.length : end + 1;
      continue;
    }

    // Dollar-quoted string: $tag$...$tag$ or $$...$$
    if (ch === "$") {
      const tagEnd = raw.indexOf("$", i + 1);
      if (tagEnd !== -1) {
        const tag = raw.slice(i, tagEnd + 1); // e.g. "$$" or "$body$"
        const closeIdx = raw.indexOf(tag, tagEnd + 1);
        if (closeIdx !== -1) {
          current += raw.slice(i, closeIdx + tag.length);
          i = closeIdx + tag.length;
          continue;
        }
      }
    }

    // Single-quoted string
    if (ch === "'") {
      let j = i + 1;
      while (j < raw.length) {
        if (raw[j] === "'" && raw[j + 1] === "'") {
          j += 2; // escaped quote
        } else if (raw[j] === "'") {
          j++;
          break;
        } else {
          j++;
        }
      }
      current += raw.slice(i, j);
      i = j;
      continue;
    }

    // Statement terminator
    if (ch === ";") {
      current += ";";
      const stmt = current.trim();
      if (hasActualSQL(stmt)) {
        statements.push(stmt);
      }
      current = "";
      i++;
      continue;
    }

    current += ch;
    i++;
  }

  // Flush any trailing content without semicolon
  const trailing = current.trim();
  if (hasActualSQL(trailing)) {
    statements.push(trailing);
  }

  return statements;
}

/** Returns true if the chunk contains at least one non-comment SQL keyword */
function hasActualSQL(s: string): boolean {
  if (!s || s === ";") return false;
  const nonComment = s
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .trim();
  return nonComment.length > 0;
}

async function runMigration(filename: string): Promise<void> {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  const raw = fs.readFileSync(filepath, "utf-8");
  const statements = splitStatements(raw);

  for (const stmt of statements) {
    await sql.query(stmt, []);
  }
}

async function main(): Promise<void> {
  const url = process.env.POSTGRES_URL ?? "";
  console.log("DB:", url.replace(/:([^:@]+)@/, ":***@"));
  console.log();

  for (const filename of PENDING) {
    process.stdout.write(`  applying ${filename} ... `);
    try {
      await runMigration(filename);
      console.log("done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes("already exists") ||
        msg.includes("duplicate column") ||
        msg.includes("already contains")
      ) {
        console.log(`skipped (${msg.slice(0, 100)})`);
      } else {
        console.log(`FAILED`);
        console.error("    error:", msg);
        process.exit(1);
      }
    }
  }

  console.log("\nAll migrations complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

#!/usr/bin/env tsx
// Seed ted_active_members from a CSV. Useful before the Playwright scanner
// is live so that surface-tag has candidates to pick from.
//
// CSV format (header required):
//   member_id,first_name,topic_tags
//   alice-123,Alice,"endurance,nutrition"
//   sean-456,Seán,culture
//
// Usage:
//   npx tsx agents/ted/scripts/seed-active-members.ts --file=path/to/members.csv
//   npx tsx agents/ted/scripts/seed-active-members.ts --file=members.csv --dry-run

import fs from "fs";
import path from "path";
import { loadEnv, findRepoRoot } from "../src/config.js";
import { upsertActiveMember } from "../src/lib/memory.js";
import { parseCsv } from "../src/lib/csv.js";

interface Row {
  memberId: string;
  firstName: string;
  topicTags: string[];
}

function parseRows(text: string): Row[] {
  const { headers, rows } = parseCsv(text);
  if (rows.length === 0) return [];
  const lowered = headers.map((h) => h.toLowerCase());
  const idx = {
    memberId: lowered.indexOf("member_id"),
    firstName: lowered.indexOf("first_name"),
    topicTags: lowered.indexOf("topic_tags"),
  };
  if (idx.memberId < 0 || idx.firstName < 0 || idx.topicTags < 0) {
    throw new Error("CSV must have columns: member_id, first_name, topic_tags");
  }

  const out: Row[] = [];
  for (const cols of rows) {
    if (cols.length < 3) continue;
    const memberId = cols[idx.memberId]?.trim();
    const firstName = cols[idx.firstName]?.trim();
    const tags = cols[idx.topicTags]
      ?.split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!memberId || !firstName) continue;
    out.push({ memberId, firstName, topicTags: tags ?? [] });
  }
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => a.startsWith("--file="))?.split("=")[1];
  const dryRun = args.includes("--dry-run");

  if (!file) {
    console.error("Usage: --file=path/to/members.csv [--dry-run]");
    process.exit(1);
  }

  const repoRoot = findRepoRoot();
  loadEnv(repoRoot);

  const absPath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
  }

  const rows = parseRows(fs.readFileSync(absPath, "utf-8"));
  console.log(`Parsed ${rows.length} rows from ${file}`);

  if (dryRun) {
    for (const r of rows.slice(0, 10)) {
      console.log(`  ${r.memberId.padEnd(24)} ${r.firstName.padEnd(20)} [${r.topicTags.join(", ")}]`);
    }
    if (rows.length > 10) console.log(`  ... and ${rows.length - 10} more`);
    console.log("\n(dry-run $— not writing to DB)");
    return;
  }

  let ok = 0;
  let failed = 0;
  for (const r of rows) {
    try {
      await upsertActiveMember(r);
      ok += 1;
    } catch (err) {
      failed += 1;
      console.error(`  Failed ${r.memberId}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  console.log(`\nDone. ${ok} upserted, ${failed} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

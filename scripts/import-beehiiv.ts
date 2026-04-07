/**
 * Import ClickFunnels contacts into Beehiiv
 *
 * Usage:
 *   npx tsx scripts/import-beehiiv.ts --csv path/to/cf-contacts-export.csv
 *   npx tsx scripts/import-beehiiv.ts --csv path/to/cf-contacts-export.csv --dry-run
 *   npx tsx scripts/import-beehiiv.ts --csv path/to/cf-contacts-export.csv --batch-size 50
 *
 * Requires BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID in .env.local
 */

import { readFileSync } from "fs";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

const API_KEY = process.env.BEEHIIV_API_KEY;
const PUB_ID = process.env.BEEHIIV_PUBLICATION_ID;
const BASE_URL = `https://api.beehiiv.com/v2/publications/${PUB_ID}/subscriptions`;

if (!API_KEY || !PUB_ID) {
  console.error("Missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID in .env.local");
  process.exit(1);
}

interface Contact {
  email: string;
  firstName: string;
  lastName: string;
  tags: string[];
}

function parseCSV(csvPath: string): Contact[] {
  const raw = readFileSync(csvPath, "utf-8");
  const lines = raw.split("\n").filter((l) => l.trim());
  if (lines.length < 2) {
    console.error("CSV has no data rows");
    process.exit(1);
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const emailIdx = headers.findIndex((h) => /email/i.test(h));
  const firstIdx = headers.findIndex((h) => /first.*name/i.test(h));
  const lastIdx = headers.findIndex((h) => /last.*name/i.test(h));
  const tagsIdx = headers.findIndex((h) => /tags/i.test(h));

  if (emailIdx === -1) {
    console.error("Could not find email column in CSV. Headers:", headers);
    process.exit(1);
  }

  const contacts: Contact[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Handle quoted CSV fields properly
    const fields = parseCSVLine(lines[i]);
    const email = fields[emailIdx]?.trim().toLowerCase();

    if (!email || !email.includes("@")) continue;

    contacts.push({
      email,
      firstName: firstIdx >= 0 ? fields[firstIdx]?.trim() || "" : "",
      lastName: lastIdx >= 0 ? fields[lastIdx]?.trim() || "" : "",
      tags: tagsIdx >= 0 && fields[tagsIdx]
        ? fields[tagsIdx].split(";").map((t: string) => t.trim()).filter(Boolean)
        : [],
    });
  }

  return contacts;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

async function createSubscription(contact: Contact): Promise<{ ok: boolean; status: number }> {
  const body: Record<string, unknown> = {
    email: contact.email,
    reactivate_existing: false,
    send_welcome_email: false,
    utm_source: "clickfunnels_migration",
  };

  if (contact.firstName) {
    body.custom_fields = [
      { name: "first_name", value: contact.firstName },
      ...(contact.lastName ? [{ name: "last_name", value: contact.lastName }] : []),
    ];
  }

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return { ok: res.ok, status: res.status };
}

async function importBatch(
  contacts: Contact[],
  batchSize: number,
  dryRun: boolean
): Promise<{ imported: number; skipped: number; errors: number }> {
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < contacts.length; i += batchSize) {
    const batch = contacts.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(contacts.length / batchSize);

    console.log(`Batch ${batchNum}/${totalBatches} (${batch.length} contacts)...`);

    if (dryRun) {
      imported += batch.length;
      continue;
    }

    const results = await Promise.allSettled(
      batch.map((c) => createSubscription(c))
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        if (result.value.ok) {
          imported++;
        } else if (result.value.status === 409) {
          skipped++; // Already exists
        } else {
          errors++;
        }
      } else {
        errors++;
      }
    }

    // Rate limit: Beehiiv allows ~10 req/s, pause between batches
    if (i + batchSize < contacts.length) {
      await new Promise((r) => setTimeout(r, batchSize * 120));
    }

    // Progress log every 10 batches
    if (batchNum % 10 === 0) {
      console.log(`  Progress: ${imported} imported, ${skipped} existing, ${errors} errors`);
    }
  }

  return { imported, skipped, errors };
}

async function main() {
  const args = process.argv.slice(2);
  const csvIdx = args.indexOf("--csv");
  const dryRun = args.includes("--dry-run");
  const batchSizeIdx = args.indexOf("--batch-size");

  if (csvIdx === -1 || !args[csvIdx + 1]) {
    console.error("Usage: npx tsx scripts/import-beehiiv.ts --csv <path> [--dry-run] [--batch-size 50]");
    process.exit(1);
  }

  const csvPath = resolve(args[csvIdx + 1]);
  const batchSize = batchSizeIdx >= 0 ? parseInt(args[batchSizeIdx + 1], 10) : 10;

  console.log(`Parsing CSV: ${csvPath}`);
  const contacts = parseCSV(csvPath);
  console.log(`Found ${contacts.length} valid contacts`);

  // Deduplicate by email
  const seen = new Set<string>();
  const unique = contacts.filter((c) => {
    if (seen.has(c.email)) return false;
    seen.add(c.email);
    return true;
  });
  console.log(`${unique.length} unique emails (${contacts.length - unique.length} duplicates removed)`);

  if (dryRun) {
    console.log("\n🏃 DRY RUN — no API calls will be made\n");
    console.log("Sample contacts:");
    unique.slice(0, 5).forEach((c) =>
      console.log(`  ${c.email} | ${c.firstName} ${c.lastName} | tags: ${c.tags.join(", ") || "none"}`)
    );
    console.log(`\nWould import ${unique.length} contacts to Beehiiv`);
    return;
  }

  console.log(`\nImporting ${unique.length} contacts (batch size: ${batchSize})...\n`);
  const { imported, skipped, errors } = await importBatch(unique, batchSize, dryRun);

  console.log(`\nDone!`);
  console.log(`  Imported: ${imported}`);
  console.log(`  Already existed: ${skipped}`);
  console.log(`  Errors: ${errors}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

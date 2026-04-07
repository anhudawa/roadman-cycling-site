import { readFileSync } from "fs";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

const API_KEY = process.env.BEEHIIV_API_KEY;
const PUB_ID = process.env.BEEHIIV_PUBLICATION_ID;
const BASE_URL = `https://api.beehiiv.com/v2/publications/${PUB_ID}/subscriptions`;

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) { fields.push(current); current = ""; }
    else current += ch;
  }
  fields.push(current);
  return fields;
}

async function main() {
  const raw = readFileSync("/Users/tedcrilly/Downloads/cf-contacts-export.csv", "utf-8");
  const lines = raw.split("\n").filter(l => l.trim());
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const emailIdx = headers.findIndex(h => /email/i.test(h));
  const tagsIdx = headers.findIndex(h => /tags/i.test(h));

  const emails: { email: string; tags: string }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    const email = fields[emailIdx]?.trim().toLowerCase();
    const tags = fields[tagsIdx]?.trim() || "";
    if (email && email.includes("@")) emails.push({ email, tags });
  }

  const seen = new Set<string>();
  const unique = emails.filter(e => { if (seen.has(e.email)) return false; seen.add(e.email); return true; });
  console.log(`Total unique emails: ${unique.length}`);

  // Test 20 random emails from different parts of the list
  const sample = [
    ...unique.slice(100, 105),
    ...unique.slice(5000, 5005),
    ...unique.slice(10000, 10005),
    ...unique.slice(20000, 20005),
  ];

  console.log(`\nTesting ${sample.length} emails for error details...\n`);

  for (const contact of sample) {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: contact.email,
        reactivate_existing: true,
        send_welcome_email: false,
        utm_source: "clickfunnels_migration",
      }),
    });

    const body = await res.text();
    if (!res.ok) {
      console.log(`FAIL [${res.status}] ${contact.email} | tags: ${contact.tags}`);
      console.log(`  Response: ${body.substring(0, 300)}`);
    } else {
      console.log(`OK   [${res.status}] ${contact.email}`);
    }
    await new Promise(r => setTimeout(r, 200));
  }

  // Domain analysis
  const domains = new Map<string, number>();
  for (const e of unique) {
    const domain = e.email.split("@")[1];
    domains.set(domain, (domains.get(domain) || 0) + 1);
  }
  const sorted = [...domains.entries()].sort((a, b) => b[1] - a[1]);
  console.log("\nTop 20 email domains:");
  sorted.slice(0, 20).forEach(([d, c]) => console.log(`  ${d}: ${c}`));

  // Tag analysis
  const tagCounts = new Map<string, number>();
  for (const e of unique) {
    if (e.tags) {
      e.tags.split(";").forEach(t => {
        const tag = t.trim();
        if (tag) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    }
  }
  const sortedTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);
  console.log("\nAll tags and counts:");
  sortedTags.forEach(([t, c]) => console.log(`  ${t}: ${c}`));
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});

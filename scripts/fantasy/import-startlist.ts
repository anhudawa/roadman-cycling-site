/**
 * Import (provisional or confirmed) Tour de France startlist riders
 * from a CSV — the only road into fantasy_riders besides the admin
 * startlist manager. Enforces the Section 6 verification protocol:
 * a source URL is mandatory, riders join as status=provisional, and
 * team-by-team confirmation happens later via --confirm-team.
 *
 * CSV columns (header row required):
 *   name,pcs_id,team,class,price,country
 *   - team must exactly match a fantasy_pro_teams.name
 *   - class: gc | sprint | climb | break
 *   - price: 4–24 (leave blank to default to 4 and let the pricing
 *     draft pass assign real values)
 *
 * Usage:
 *   npx tsx scripts/fantasy/import-startlist.ts startlist.csv --source-url=https://... [--dry-run]
 *   npx tsx scripts/fantasy/import-startlist.ts --confirm-team="Lidl–Trek" --source-url=https://...
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync } from "node:fs";

const DRY_RUN = process.argv.includes("--dry-run");

function getFlag(name: string): string | null {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3) : null;
}

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

interface RiderRow {
  name: string;
  pcsId: string | null;
  team: string;
  riderClass: "gc" | "sprint" | "climb" | "break";
  price: number;
  country: string | null;
}

function parseCsv(path: string): RiderRow[] {
  const lines = readFileSync(path, "utf8").split(/\r?\n/).filter((l) => l.trim());
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const expected = ["name", "pcs_id", "team", "class", "price", "country"];
  if (expected.some((col) => !header.includes(col))) {
    fail(`CSV header must contain: ${expected.join(",")} (got: ${header.join(",")})`);
  }
  const idx = Object.fromEntries(expected.map((col) => [col, header.indexOf(col)]));

  return lines.slice(1).map((line, i) => {
    const cells = line.split(",").map((c) => c.trim());
    const name = cells[idx.name];
    const riderClass = cells[idx.class] as RiderRow["riderClass"];
    const priceRaw = cells[idx.price];
    const price = priceRaw ? Number(priceRaw) : 4;
    if (!name) fail(`Row ${i + 2}: missing name`);
    if (!["gc", "sprint", "climb", "break"].includes(riderClass)) {
      fail(`Row ${i + 2} (${name}): class must be gc|sprint|climb|break, got "${riderClass}"`);
    }
    if (!Number.isInteger(price) || price < 4 || price > 24) {
      fail(`Row ${i + 2} (${name}): price must be an integer 4–24, got "${priceRaw}"`);
    }
    return {
      name,
      pcsId: cells[idx.pcs_id] || null,
      team: cells[idx.team],
      riderClass,
      price,
      country: cells[idx.country] || null,
    };
  });
}

async function main() {
  const sourceUrl = getFlag("source-url");
  if (!sourceUrl) {
    fail("--source-url is mandatory. No rider enters the database without a source. Ever.");
  }

  const { db } = await import("../../src/lib/db");
  const { fantasyProTeams, fantasyRiders } = await import("../../src/lib/db/schema");
  const { eq, and } = await import("drizzle-orm");

  const confirmTeam = getFlag("confirm-team");
  if (confirmTeam) {
    const [team] = await db
      .select()
      .from(fantasyProTeams)
      .where(eq(fantasyProTeams.name, confirmTeam));
    if (!team) fail(`Unknown team "${confirmTeam}"`);
    if (DRY_RUN) {
      console.log(`Dry run — would confirm all provisional riders of ${confirmTeam}`);
      return;
    }
    const updated = await db
      .update(fantasyRiders)
      .set({
        status: "confirmed",
        confirmedSource: sourceUrl,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(eq(fantasyRiders.proTeamId, team.id), eq(fantasyRiders.status, "provisional")),
      )
      .returning({ id: fantasyRiders.id });
    console.log(`✓ ${updated.length} riders of ${confirmTeam} confirmed (source: ${sourceUrl})`);
    return;
  }

  const csvPath = process.argv[2];
  if (!csvPath || csvPath.startsWith("--")) fail("Usage: import-startlist.ts <csv> --source-url=<url>");

  const rows = parseCsv(csvPath);
  console.log(`Parsed ${rows.length} riders from ${csvPath}`);

  const teams = await db.select().from(fantasyProTeams);
  const teamByName = new Map(teams.map((t) => [t.name, t]));

  const unknownTeams = [...new Set(rows.map((r) => r.team))].filter((t) => !teamByName.has(t));
  if (unknownTeams.length > 0) {
    fail(`Unknown teams in CSV (must match fantasy_pro_teams.name exactly):\n  ${unknownTeams.join("\n  ")}`);
  }

  const perTeam = new Map<string, number>();
  for (const row of rows) perTeam.set(row.team, (perTeam.get(row.team) ?? 0) + 1);
  for (const [team, count] of perTeam) {
    if (count > 8) fail(`${team} has ${count} riders — squads are 8 (provisional long-lists must be trimmed before import)`);
  }

  if (DRY_RUN) {
    console.log("Dry run — nothing written. Per-team counts:");
    for (const [team, count] of perTeam) console.log(`  ${team}: ${count}`);
    return;
  }

  let inserted = 0;
  let updatedCount = 0;
  for (const row of rows) {
    const team = teamByName.get(row.team)!;
    const values = {
      name: row.name,
      pcsId: row.pcsId,
      proTeamId: team.id,
      price: row.price,
      riderClass: row.riderClass,
      countryCode: row.country,
      status: "provisional" as const,
      sourceUrl,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    };
    if (row.pcsId) {
      const result = await db
        .insert(fantasyRiders)
        .values(values)
        .onConflictDoUpdate({ target: fantasyRiders.pcsId, set: values })
        .returning({ createdAt: fantasyRiders.createdAt, updatedAt: fantasyRiders.updatedAt });
      if (result[0].createdAt.getTime() === result[0].updatedAt.getTime()) inserted++;
      else updatedCount++;
    } else {
      await db.insert(fantasyRiders).values(values);
      inserted++;
    }
  }
  console.log(`✓ Startlist imported: ~${inserted} new, ~${updatedCount} updated, all status=provisional`);
  console.log(`  Source recorded on every row: ${sourceUrl}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

/**
 * Seed FICTIONAL demo riders so the game can be demoed end-to-end
 * before the real startlist exists. 8 riders per real team (184),
 * priced on the real curve, all flagged source_url 'demo://seed' so
 * the admin "Full demo wipe" removes every one of them.
 *
 * Names are deliberately invented (cycling-flavoured, no real pros) —
 * the fact-integrity rule means no real rider ever enters the database
 * without a source, demo included.
 *
 * Refuses to run unless game_config demoMode is true (set it in
 * admin → Fantasy → Config first) so demo riders can't accidentally
 * land in a live game.
 *
 * Run: npx tsx scripts/fantasy/seed-demo.ts [--dry-run]
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { generateDraftPrices, type PricingInput } from "../../src/lib/fantasy/pricing";

const DRY_RUN = process.argv.includes("--dry-run");
const DEMO_SOURCE = "demo://seed";

const FIRST_NAMES = [
  "Remi", "Jens", "Marco", "Tadhg", "Bram", "Luca", "Oier", "Sep", "Anders", "Mathis",
  "Cormac", "Pello", "Stijn", "Aurelio", "Magnus", "Diarmuid", "Thibault", "Iker", "Casper", "Lorcan",
  "Wout", "Esteban", "Niklas", "Fintan",
];
// Invented, cycling-flavoured surnames — none belong to real pros.
const LAST_NAMES = [
  "Bidon", "Echelon", "Lanterne", "Flamme-Rouge", "Soigneur", "Vandepeloton", "Musette", "Chasse-Patate",
  "Rouleur", "Puncheur", "Grimpeur", "Baroudeur", "Pavewinkel", "Cronoman", "Domestique", "Vlamberg",
  "Colza", "Ravito", "Bordure", "Tempo", "Carrera-Vieja", "Hors-Delai", "Sterrato",
];

const CLASS_PATTERN = ["gc", "climb", "sprint", "break", "climb", "break", "sprint", "break"] as const;

async function main() {
  const { db } = await import("../../src/lib/db");
  const { fantasyProTeams, fantasyRiders } = await import("../../src/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const { loadGameConfig } = await import("../../src/lib/fantasy/queries");

  const gameConfig = await loadGameConfig();
  if (!gameConfig.demoMode) {
    console.error("✗ demoMode is false — set it to true in admin → Fantasy → Config before seeding demo riders.");
    process.exit(1);
  }

  const teams = await db.select().from(fantasyProTeams);
  if (teams.length !== 23) {
    console.error(`✗ Expected 23 pro teams (run npm run fantasy:seed first), found ${teams.length}`);
    process.exit(1);
  }

  const existing = await db
    .select({ id: fantasyRiders.id })
    .from(fantasyRiders)
    .where(eq(fantasyRiders.sourceUrl, DEMO_SOURCE));
  if (existing.length > 0) {
    console.log(`✓ ${existing.length} demo riders already seeded — nothing to do.`);
    return;
  }

  // Deterministic fictional roster: 8 riders per team, names cycled so
  // every combination is unique across the 184.
  const roster: { name: string; teamId: number; riderClass: (typeof CLASS_PATTERN)[number]; pcsPoints: number }[] = [];
  teams.forEach((team, teamIdx) => {
    for (let slot = 0; slot < 8; slot++) {
      const i = teamIdx * 8 + slot;
      roster.push({
        name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[(teamIdx + slot * 5) % LAST_NAMES.length]}`,
        teamId: team.id,
        riderClass: CLASS_PATTERN[slot],
        // Synthetic PCS points: leaders score high, domestiques low,
        // with team-by-team variation so the price curve looks real.
        pcsPoints: Math.max(50, 4000 - teamIdx * 130 - slot * 420 + ((i * 37) % 250)),
      });
    }
  });

  const priceInputs: PricingInput[] = roster.map((rider, idx) => ({
    riderId: idx,
    pcsPoints: rider.pcsPoints,
    riderClass: rider.riderClass,
  }));
  const priceByIdx = new Map(generateDraftPrices(priceInputs).map((p) => [p.riderId, p.price]));

  if (DRY_RUN) {
    console.log("Dry run — first 10 of 184 demo riders:");
    roster.slice(0, 10).forEach((rider, idx) => {
      console.log(`  ${rider.name} (${rider.riderClass}, ${priceByIdx.get(idx)} cr)`);
    });
    return;
  }

  await db.insert(fantasyRiders).values(
    roster.map((rider, idx) => ({
      name: rider.name,
      proTeamId: rider.teamId,
      price: priceByIdx.get(idx) ?? 4,
      riderClass: rider.riderClass,
      status: "provisional" as const,
      sourceUrl: DEMO_SOURCE,
      verifiedAt: new Date(),
    })),
  );
  console.log("✓ 184 fictional demo riders seeded (source demo://seed)");
  console.log("  Demo away. The admin Full demo wipe removes all of them before launch.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

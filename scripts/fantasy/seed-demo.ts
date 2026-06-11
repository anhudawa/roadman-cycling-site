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
 * Optional extras so a beta group lands on a LIVE-looking game:
 *   --teams=12        create 12 demo players with budget-legal squads
 *   --with-results=5  generate + publish synthetic results for stages
 *                     1..5 through the real two-step pipeline
 *                     (publishStageScoring), including a Stage-9
 *                     abandon wave if you go that far
 *
 * Run: npx tsx scripts/fantasy/seed-demo.ts [--dry-run] [--teams=N] [--with-results=N]
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { generateDraftPrices, type PricingInput } from "../../src/lib/fantasy/pricing";

const DRY_RUN = process.argv.includes("--dry-run");
const DEMO_SOURCE = "demo://seed";

function intFlag(name: string): number {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  const value = arg ? Number(arg.slice(name.length + 3)) : 0;
  return Number.isInteger(value) && value > 0 ? value : 0;
}
const DEMO_TEAMS = intFlag("teams");
const WITH_RESULTS = Math.min(intFlag("with-results"), 21);

/** Deterministic PRNG so demo data is reproducible across resets. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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

  if (DEMO_TEAMS > 0) await seedDemoTeams(DEMO_TEAMS);
  if (WITH_RESULTS > 0) await seedDemoResults(WITH_RESULTS);

  console.log("  Demo away. The admin Full demo wipe removes all of it before launch.");
}

const DEMO_TEAM_NAMES = [
  "Watts Occurring", "Chain Gang AC", "The Autobus", "Sticky Bottle CC", "Half Wheel Heroes",
  "Flahute Collective", "Bonk Management", "Velominati Social Club", "Gruppetto Grandees",
  "Echelon Eight", "Domestique Union", "Cafe Stop Racing", "Crosswind Casualties",
  "Lanterne Rouge Lovers", "The Commissaires", "Broom Wagon Bandits",
];

/**
 * Demo players + budget-legal squads so the leaderboard isn't empty
 * when the beta group arrives. All tagged is_demo (and unverified, so
 * they can never receive email) — the full wipe removes them.
 */
async function seedDemoTeams(count: number): Promise<void> {
  const { db } = await import("../../src/lib/db");
  const { fantasyPlayers, fantasyRiders, fantasyTeams } = await import("../../src/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const { replaceSquadPreTour, setCaptain } = await import("../../src/lib/fantasy/queries");
  const { loadGameConfig } = await import("../../src/lib/fantasy/queries");
  const { validateSquad } = await import("../../src/lib/fantasy/rules");

  const config = await loadGameConfig();
  const riders = await db
    .select({
      id: fantasyRiders.id,
      price: fantasyRiders.price,
      proTeamId: fantasyRiders.proTeamId,
      status: fantasyRiders.status,
    })
    .from(fantasyRiders)
    .where(eq(fantasyRiders.sourceUrl, DEMO_SOURCE));

  let created = 0;
  for (let teamIdx = 0; teamIdx < Math.min(count, DEMO_TEAM_NAMES.length); teamIdx++) {
    const rand = mulberry32(1000 + teamIdx);
    // Greedy budget-legal pick: shuffle, take affordable riders while
    // reserving 4 credits per remaining slot, respect the team cap,
    // then verify with the real rules module.
    const shuffled = [...riders].sort(() => rand() - 0.5);
    const squad: typeof riders = [];
    const perTeam = new Map<number, number>();
    let spent = 0;
    for (const rider of shuffled) {
      if (squad.length === config.squadSize) break;
      const slotsLeft = config.squadSize - squad.length - 1;
      if (spent + rider.price + slotsLeft * 4 > config.budget) continue;
      if ((perTeam.get(rider.proTeamId) ?? 0) >= config.maxPerProTeam) continue;
      squad.push(rider);
      perTeam.set(rider.proTeamId, (perTeam.get(rider.proTeamId) ?? 0) + 1);
      spent += rider.price;
    }
    if (!validateSquad(squad, config).valid) continue;

    const [player] = await db
      .insert(fantasyPlayers)
      .values({
        email: `demo-player-${teamIdx + 1}@demo.invalid`,
        firstName: `Beta ${teamIdx + 1}`,
        country: "Ireland",
        consentAt: new Date(),
        isDemo: true,
      })
      .onConflictDoNothing()
      .returning({ id: fantasyPlayers.id });
    if (!player) continue; // already seeded on a previous run

    const [team] = await db
      .insert(fantasyTeams)
      .values({ playerId: player.id, name: DEMO_TEAM_NAMES[teamIdx] })
      .returning({ id: fantasyTeams.id });
    await replaceSquadPreTour(team.id, squad.map((r) => r.id));
    const captain = squad.reduce((best, r) => (r.price > best.price ? r : best), squad[0]);
    await setCaptain(team.id, 1, captain.id);
    created++;
  }
  console.log(`✓ ${created} demo teams created`);
}

/**
 * Generate plausible synthetic results for stages 1..N and publish
 * them through the real pipeline — exactly what Ted will do daily,
 * so the demo exercises scoring, leaderboards, and the points reveal
 * end to end. Stage 9 includes an abandon wave for drama.
 */
async function seedDemoResults(upToStage: number): Promise<void> {
  const { db } = await import("../../src/lib/db");
  const { fantasyRiders, fantasyStageResults, fantasyStages } = await import("../../src/lib/db/schema");
  const { eq, asc } = await import("drizzle-orm");
  const { publishStageScoring } = await import("../../src/lib/fantasy/queries");
  type StageResultData = import("../../src/lib/fantasy/scoring").StageResultData;

  const stages = await db.select().from(fantasyStages).orderBy(asc(fantasyStages.stageNumber));
  const riders = await db
    .select({ id: fantasyRiders.id, price: fantasyRiders.price, riderClass: fantasyRiders.riderClass })
    .from(fantasyRiders)
    .where(eq(fantasyRiders.sourceUrl, DEMO_SOURCE));

  const cumulative = new Map<number, number>();
  const out = new Set<number>();
  const byClass = (cls: string) => riders.filter((r) => r.riderClass === cls && !out.has(r.id));

  for (const stage of stages.slice(0, upToStage)) {
    const rand = mulberry32(500 + stage.stageNumber);
    const active = riders.filter((r) => !out.has(r.id));
    // Price-weighted shuffle: stars finish near the front more often,
    // with enough noise that the leaderboard moves stage to stage.
    const order = [...active]
      .map((r) => ({ r, score: r.price * 2 + rand() * 30 }))
      .sort((a, b) => b.score - a.score)
      .map(({ r }) => r);
    const top20 = order.slice(0, 20);
    top20.forEach((r, idx) => cumulative.set(r.id, (cumulative.get(r.id) ?? 0) + 20 - idx));

    const leader = (pool: typeof riders) =>
      pool.reduce((best, r) => ((cumulative.get(r.id) ?? 0) > (cumulative.get(best.id) ?? 0) ? r : best), pool[0]);

    const result: StageResultData = {
      stageNumber: stage.stageNumber,
      finishers: top20.map((r, idx) => ({ position: idx + 1, riderId: r.id })),
      jerseys: {
        yellow: leader(active).id,
        green: leader(byClass("sprint")).id,
        polkaDot: leader(byClass("climb")).id,
        white: leader(byClass("break")).id,
      },
      combativityRiderId: byClass("break")[Math.floor(rand() * 20)]?.id ?? top20[5].id,
    };
    if (stage.stageType === "mountain" || stage.stageType === "hilly") {
      const climbers = byClass("climb");
      result.komSummits = [
        { name: "Demo summit", top3: climbers.slice(0, 3).map((r) => r.id) },
      ];
    } else if (stage.stageType === "flat") {
      const sprinters = byClass("sprint");
      result.intermediateSprints = [
        { name: "Demo sprint", top3: sprinters.slice(0, 3).map((r) => r.id) },
      ];
    }
    if (stage.stageNumber === 9) {
      const casualties = order.slice(-2);
      result.abandons = casualties.map((r) => ({ riderId: r.id, reason: "DNF" as const }));
      casualties.forEach((r) => out.add(r.id));
    }

    await db
      .insert(fantasyStageResults)
      .values({
        stageNumber: stage.stageNumber,
        payload: result as unknown as Record<string, unknown>,
        status: "draft",
        enteredBy: "seed-demo",
        sourceUrl: DEMO_SOURCE,
      })
      .onConflictDoUpdate({
        target: fantasyStageResults.stageNumber,
        set: { payload: result as unknown as Record<string, unknown>, updatedAt: new Date() },
      });
    const published = await publishStageScoring(stage.stageNumber, "seed-demo");
    console.log(
      `✓ Stage ${stage.stageNumber} published: ${published.events} events, ${published.teams} teams scored`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

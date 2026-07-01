/**
 * Seed the Roadman Fantasy Tour reference data: 21 stages + 23 pro teams
 * from the verified data files in src/data/fantasy/, plus the official
 * "Roadman Clubhouse" league.
 *
 * Data-accuracy contract (Section 6.1): this script REFUSES to seed any
 * row whose data file is missing a source URL or verification timestamp,
 * and validates the stage table's internal consistency (21 stages,
 * strictly increasing dates, rest days after 9 and 15, total distance
 * within rounding tolerance of the announced 3,333 km).
 *
 * Riders are NOT seeded here — they enter via the startlist importer
 * (scripts/fantasy/import-startlist.ts) or the admin startlist manager,
 * each row carrying its own source. Never from model memory.
 *
 * Run: npx tsx scripts/fantasy/seed-fantasy.ts [--dry-run]
 * Idempotent — re-running updates existing rows by stage number / name.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync } from "node:fs";
import { join } from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");
const ANNOUNCED_TOTAL_KM = 3333;
const TOTAL_KM_TOLERANCE = 10;
const CLUBHOUSE_CODE = "RDMNCC";

interface StageRow {
  stageNumber: number;
  date: string;
  startTown: string;
  finishTown: string;
  distanceKm: number;
  stageType: "ttt" | "itt" | "flat" | "hilly" | "mountain";
  summitFinish: boolean;
  restDayAfter: boolean;
}

interface StagesFile {
  verification: {
    verifiedAt: string;
    primarySource: string;
    crossCheckSource: string;
    outstanding: string[];
  };
  stages: StageRow[];
}

interface TeamsFile {
  verification: { verifiedAt: string; primarySource: string; crossCheckSource: string };
  teams: { name: string; code: string; category: "worldteam" | "proteam"; jerseyHex: string }[];
}

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function validateStages(file: StagesFile): void {
  const { verification, stages } = file;
  if (!verification?.verifiedAt || !verification?.primarySource) {
    fail("stages-2026.json is missing verification metadata — refusing to seed");
  }
  if (stages.length !== 21) fail(`Expected 21 stages, got ${stages.length}`);

  let previousDate = "";
  let totalKm = 0;
  for (const [i, stage] of stages.entries()) {
    if (stage.stageNumber !== i + 1) fail(`Stage numbering broken at index ${i}`);
    if (stage.date <= previousDate) fail(`Stage ${stage.stageNumber} date is not after stage ${i}`);
    previousDate = stage.date;
    totalKm += stage.distanceKm;
    if (!stage.startTown || !stage.finishTown) fail(`Stage ${stage.stageNumber} missing towns`);
  }
  if (Math.abs(totalKm - ANNOUNCED_TOTAL_KM) > TOTAL_KM_TOLERANCE) {
    fail(`Total distance ${totalKm.toFixed(1)} km is more than ${TOTAL_KM_TOLERANCE} km from the announced ${ANNOUNCED_TOTAL_KM} km`);
  }
  const restDays = stages.filter((s) => s.restDayAfter).map((s) => s.stageNumber);
  if (restDays.join(",") !== "9,15") fail(`Rest days must follow stages 9 and 15, got: ${restDays.join(",")}`);
  if (stages[0].stageType !== "ttt") fail("Stage 1 must be the Barcelona TTT");
  console.log(`✓ Stage table validated (21 stages, ${totalKm.toFixed(1)} km, rest days after 9 & 15)`);
  for (const item of verification.outstanding ?? []) {
    console.log(`  ⚠ outstanding: ${item}`);
  }
}

function validateTeams(file: TeamsFile): void {
  const { verification, teams } = file;
  if (!verification?.verifiedAt || !verification?.primarySource) {
    fail("teams-2026.json is missing verification metadata — refusing to seed");
  }
  if (teams.length !== 23) fail(`Expected 23 teams, got ${teams.length}`);
  const worldteams = teams.filter((t) => t.category === "worldteam").length;
  const proteams = teams.filter((t) => t.category === "proteam").length;
  if (worldteams !== 18 || proteams !== 5) {
    fail(`Expected 18 WorldTeams + 5 ProTeams, got ${worldteams} + ${proteams}`);
  }
  if (new Set(teams.map((t) => t.name)).size !== 23) fail("Duplicate team names");
  console.log("✓ Team list validated (18 WorldTeams + 5 ProTeams)");
}

async function main() {
  const dataDir = join(process.cwd(), "src", "data", "fantasy");
  const stagesFile = JSON.parse(readFileSync(join(dataDir, "stages-2026.json"), "utf8")) as StagesFile;
  const teamsFile = JSON.parse(readFileSync(join(dataDir, "teams-2026.json"), "utf8")) as TeamsFile;

  validateStages(stagesFile);
  validateTeams(teamsFile);

  if (DRY_RUN) {
    console.log("Dry run — nothing written.");
    return;
  }

  const { db } = await import("../../src/lib/db");
  const { fantasyStages, fantasyProTeams, fantasyLeagues } = await import("../../src/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  const stageVerifiedAt = new Date(stagesFile.verification.verifiedAt);
  for (const stage of stagesFile.stages) {
    await db
      .insert(fantasyStages)
      .values({
        stageNumber: stage.stageNumber,
        date: stage.date,
        startTown: stage.startTown,
        finishTown: stage.finishTown,
        distanceKm: String(stage.distanceKm),
        stageType: stage.stageType,
        summitFinish: stage.summitFinish,
        restDayAfter: stage.restDayAfter,
        sourceUrl: stagesFile.verification.primarySource,
        crossCheckUrl: stagesFile.verification.crossCheckSource,
        verifiedAt: stageVerifiedAt,
      })
      .onConflictDoUpdate({
        target: fantasyStages.stageNumber,
        set: {
          date: stage.date,
          startTown: stage.startTown,
          finishTown: stage.finishTown,
          distanceKm: String(stage.distanceKm),
          stageType: stage.stageType,
          summitFinish: stage.summitFinish,
          restDayAfter: stage.restDayAfter,
          sourceUrl: stagesFile.verification.primarySource,
          crossCheckUrl: stagesFile.verification.crossCheckSource,
          verifiedAt: stageVerifiedAt,
        },
      });
  }
  console.log("✓ 21 stages seeded");

  const teamVerifiedAt = new Date(teamsFile.verification.verifiedAt);
  for (const team of teamsFile.teams) {
    await db
      .insert(fantasyProTeams)
      .values({
        name: team.name,
        code: team.code,
        category: team.category,
        jerseyHex: team.jerseyHex,
        sourceUrl: teamsFile.verification.primarySource,
        verifiedAt: teamVerifiedAt,
      })
      .onConflictDoUpdate({
        target: fantasyProTeams.name,
        set: {
          code: team.code,
          category: team.category,
          jerseyHex: team.jerseyHex,
          sourceUrl: teamsFile.verification.primarySource,
          verifiedAt: teamVerifiedAt,
        },
      });
  }
  console.log("✓ 23 pro teams seeded");

  const [clubhouse] = await db
    .select()
    .from(fantasyLeagues)
    .where(eq(fantasyLeagues.code, CLUBHOUSE_CODE));
  if (!clubhouse) {
    await db.insert(fantasyLeagues).values({
      code: CLUBHOUSE_CODE,
      name: "Roadman Clubhouse",
      isOfficial: true,
    });
    console.log(`✓ Roadman Clubhouse league created (code ${CLUBHOUSE_CODE})`);
  } else {
    console.log("✓ Roadman Clubhouse league already exists");
  }

  console.log("\nNext steps:");
  console.log("  1. Import the provisional startlist when PCS publishes it:");
  console.log("     npx tsx scripts/fantasy/import-startlist.ts <csv> --source-url=<url>");
  console.log("  2. Fill official stage start times in /admin/fantasy/stages as the roadbook lands.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

/**
 * Roadman Fantasy Tour — database service layer.
 *
 * Everything stateful lives here: config loading, effective-dated squad
 * reads, transfer application, the two-step results publish, and the
 * leaderboard rebuild. The scoring maths itself stays in scoring.ts
 * (pure) — this module only orchestrates it against Postgres.
 */

import { and, asc, eq, gte, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  fantasyCaptainPicks,
  fantasyGameConfig,
  fantasyLeagueMembers,
  fantasyLeagues,
  fantasyPlayers,
  fantasyProTeams,
  fantasyRiders,
  fantasyScoringEvents,
  fantasyStageResults,
  fantasyStages,
  fantasyTeamRiders,
  fantasyTeams,
  fantasyTeamStageScores,
  fantasyTeamTotals,
  fantasyTransfers,
  fantasyAuditLog,
} from "@/lib/db/schema";
import { LAUNCH_DEFAULTS, mergeConfig, type FantasyGameConfig } from "./config";
import {
  computeScoringEvents,
  computeTeamStageScore,
  computeTeamTotals,
  compareTeamsForRank,
  type StageResultData,
  type ScoringEvent,
} from "./scoring";

/* ─── Config ────────────────────────────────────────────────── */

export async function loadGameConfig(): Promise<FantasyGameConfig> {
  try {
    const rows = await db.select().from(fantasyGameConfig);
    const overrides: Record<string, unknown> = {};
    for (const row of rows) overrides[row.key] = row.value;
    return mergeConfig(overrides);
  } catch {
    // A config read must never take the game down — defaults are safe.
    return LAUNCH_DEFAULTS;
  }
}

export async function setConfigKey(key: string, value: unknown, actor: string): Promise<void> {
  await db
    .insert(fantasyGameConfig)
    .values({ key, value, updatedBy: actor })
    .onConflictDoUpdate({
      target: fantasyGameConfig.key,
      set: { value, updatedBy: actor, updatedAt: new Date() },
    });
  await audit(actor, "config.set", "game_config", key, { value });
}

/* ─── Stages & deadlines ────────────────────────────────────── */

export async function listStages() {
  return db.select().from(fantasyStages).orderBy(asc(fantasyStages.stageNumber));
}

/**
 * Transfer/captain deadline = official stage start (Section 4.3).
 * Until ASO publishes start times, fall back to 12:00 CEST on the
 * stage date — conservative enough to never lock late. The admin
 * stage manager fills real times as the roadbook lands.
 */
export function deadlineForStage(stage: { date: string; startTimeCest: Date | null }): Date {
  if (stage.startTimeCest) return stage.startTimeCest;
  return new Date(`${stage.date}T12:00:00+02:00`);
}

/** The next stage whose deadline hasn't passed (transfers target it). */
export async function nextOpenStage(now = new Date()) {
  const stages = await listStages();
  return stages.find((s) => deadlineForStage(s) > now) ?? null;
}

export async function isPreTour(now = new Date()): Promise<boolean> {
  const stages = await listStages();
  const stage1 = stages.find((s) => s.stageNumber === 1);
  return !stage1 || deadlineForStage(stage1) > now;
}

/* ─── Squads (effective-dated — never overwrite) ────────────── */

export async function getSquadAsOfStage(teamId: number, stageNumber: number) {
  return db
    .select({
      riderId: fantasyTeamRiders.riderId,
      effectiveFromStage: fantasyTeamRiders.effectiveFromStage,
      name: fantasyRiders.name,
      price: fantasyRiders.price,
      riderClass: fantasyRiders.riderClass,
      status: fantasyRiders.status,
      proTeamId: fantasyRiders.proTeamId,
    })
    .from(fantasyTeamRiders)
    .innerJoin(fantasyRiders, eq(fantasyRiders.id, fantasyTeamRiders.riderId))
    .where(
      and(
        eq(fantasyTeamRiders.teamId, teamId),
        lte(fantasyTeamRiders.effectiveFromStage, stageNumber),
        or(
          isNull(fantasyTeamRiders.effectiveToStage),
          gte(fantasyTeamRiders.effectiveToStage, stageNumber),
        ),
      ),
    );
}

/**
 * Replace the whole squad during the pre-Tour window (unlimited edits).
 * Pre-Tour rows are all effectiveFromStage = 1 with no history to keep,
 * so old selections are deleted, not closed.
 */
export async function replaceSquadPreTour(teamId: number, riderIds: number[]): Promise<void> {
  await db.delete(fantasyTeamRiders).where(eq(fantasyTeamRiders.teamId, teamId));
  await db.insert(fantasyTeamRiders).values(
    riderIds.map((riderId) => ({
      teamId,
      riderId,
      effectiveFromStage: 1,
      addedVia: "initial" as const,
    })),
  );
}

/** Apply one validated in-Tour transfer: close the old row, open the new. */
export async function applyTransfer(input: {
  teamId: number;
  riderOutId: number;
  riderInId: number;
  effectiveFromStage: number;
  kind: "standard" | "rest_day_bonus" | "grace";
}): Promise<void> {
  await db
    .update(fantasyTeamRiders)
    .set({ effectiveToStage: input.effectiveFromStage - 1 })
    .where(
      and(
        eq(fantasyTeamRiders.teamId, input.teamId),
        eq(fantasyTeamRiders.riderId, input.riderOutId),
        isNull(fantasyTeamRiders.effectiveToStage),
      ),
    );
  await db.insert(fantasyTeamRiders).values({
    teamId: input.teamId,
    riderId: input.riderInId,
    effectiveFromStage: input.effectiveFromStage,
    addedVia: input.kind === "grace" ? "grace" : "transfer",
  });
  await db.insert(fantasyTransfers).values(input);
}

export async function getTransferLedger(teamId: number) {
  return db
    .select({
      effectiveFromStage: fantasyTransfers.effectiveFromStage,
      kind: fantasyTransfers.kind,
    })
    .from(fantasyTransfers)
    .where(eq(fantasyTransfers.teamId, teamId));
}

export async function setCaptain(teamId: number, stageNumber: number, riderId: number): Promise<void> {
  await db
    .insert(fantasyCaptainPicks)
    .values({ teamId, stageNumber, riderId })
    .onConflictDoUpdate({
      target: [fantasyCaptainPicks.teamId, fantasyCaptainPicks.stageNumber],
      set: { riderId, updatedAt: new Date() },
    });
}

/* ─── Results → scoring publish (Section 6.3) ───────────────── */

async function buildStageContext(stageNumber: number) {
  const [stage] = await db
    .select()
    .from(fantasyStages)
    .where(eq(fantasyStages.stageNumber, stageNumber));
  if (!stage) throw new Error(`Stage ${stageNumber} not found`);
  const riders = await db
    .select({
      id: fantasyRiders.id,
      proTeamId: fantasyRiders.proTeamId,
      abandonedAfterStage: fantasyRiders.abandonedAfterStage,
    })
    .from(fantasyRiders);
  return { stageType: stage.stageType, riders };
}

/** Compute (but don't store) events + sample scores for the preview step. */
export async function previewStageScoring(stageNumber: number): Promise<ScoringEvent[]> {
  const [resultRow] = await db
    .select()
    .from(fantasyStageResults)
    .where(eq(fantasyStageResults.stageNumber, stageNumber));
  if (!resultRow) throw new Error(`No results entered for stage ${stageNumber}`);
  const config = await loadGameConfig();
  const ctx = await buildStageContext(stageNumber);
  return computeScoringEvents(resultRow.payload as unknown as StageResultData, ctx, config);
}

/**
 * Publish (or re-publish after a correction) one stage's scores.
 * Idempotent: wipes and regenerates the stage's scoring events, then
 * recomputes every team's score for that stage and rebuilds totals.
 */
export async function publishStageScoring(stageNumber: number, actor: string): Promise<{ events: number; teams: number }> {
  const [resultRow] = await db
    .select()
    .from(fantasyStageResults)
    .where(eq(fantasyStageResults.stageNumber, stageNumber));
  if (!resultRow) throw new Error(`No results entered for stage ${stageNumber}`);

  const config = await loadGameConfig();
  const result = resultRow.payload as unknown as StageResultData;
  const ctx = await buildStageContext(stageNumber);

  // Record abandons on the rider rows before computing downstream stages.
  for (const abandon of result.abandons ?? []) {
    await db
      .update(fantasyRiders)
      .set({ status: "abandoned", abandonedAfterStage: stageNumber, updatedAt: new Date() })
      .where(eq(fantasyRiders.id, abandon.riderId));
  }

  const events = computeScoringEvents(result, ctx, config);

  await db.delete(fantasyScoringEvents).where(eq(fantasyScoringEvents.stageNumber, stageNumber));
  if (events.length > 0) {
    await db.insert(fantasyScoringEvents).values(
      events.map((e) => ({ ...e, resultVersion: resultRow.version })),
    );
  }

  // Score every team for this stage against its squad-as-of-stage.
  const teams = await db.select({ id: fantasyTeams.id }).from(fantasyTeams);
  const captains = await db
    .select()
    .from(fantasyCaptainPicks)
    .where(eq(fantasyCaptainPicks.stageNumber, stageNumber));
  const captainByTeam = new Map(captains.map((c) => [c.teamId, c.riderId]));

  for (const team of teams) {
    const squad = await getSquadAsOfStage(team.id, stageNumber);
    const score = computeTeamStageScore(
      stageNumber,
      squad.map((r) => r.riderId),
      captainByTeam.get(team.id) ?? null,
      events,
      config,
    );
    await db
      .insert(fantasyTeamStageScores)
      .values({
        teamId: team.id,
        stageNumber,
        points: score.points,
        captainRiderId: score.captainRiderId,
        breakdown: { perRider: score.perRider } as Record<string, unknown>,
        computedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [fantasyTeamStageScores.teamId, fantasyTeamStageScores.stageNumber],
        set: {
          points: score.points,
          captainRiderId: score.captainRiderId,
          breakdown: { perRider: score.perRider } as Record<string, unknown>,
          computedAt: new Date(),
        },
      });
  }

  await rebuildLeaderboard();

  await db
    .update(fantasyStageResults)
    .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(fantasyStageResults.stageNumber, stageNumber));

  await audit(actor, "scoring.publish", "stage", String(stageNumber), {
    events: events.length,
    teams: teams.length,
    resultVersion: resultRow.version,
  });

  return { events: events.length, teams: teams.length };
}

/** Rebuild the computed totals + global ranks (the only thing /leaderboard reads). */
export async function rebuildLeaderboard(): Promise<void> {
  const config = await loadGameConfig();
  const teams = await db
    .select({ id: fantasyTeams.id, createdAt: fantasyTeams.createdAt })
    .from(fantasyTeams);
  const allScores = await db
    .select({
      teamId: fantasyTeamStageScores.teamId,
      stageNumber: fantasyTeamStageScores.stageNumber,
      points: fantasyTeamStageScores.points,
    })
    .from(fantasyTeamStageScores);

  const scoresByTeam = new Map<number, { stageNumber: number; points: number }[]>();
  for (const row of allScores) {
    const list = scoresByTeam.get(row.teamId) ?? [];
    list.push(row);
    scoresByTeam.set(row.teamId, list);
  }

  const ranked = teams
    .map((team) => {
      const stageScores = scoresByTeam.get(team.id) ?? [];
      return {
        teamId: team.id,
        createdAt: team.createdAt,
        lastScoredStage: stageScores.reduce((max, s) => Math.max(max, s.stageNumber), 0) || null,
        ...computeTeamTotals(stageScores, config),
      };
    })
    .sort(compareTeamsForRank);

  for (let i = 0; i < ranked.length; i++) {
    const t = ranked[i];
    await db
      .insert(fantasyTeamTotals)
      .values({
        teamId: t.teamId,
        totalPoints: t.totalPoints,
        week1Points: t.week1Points,
        week2Points: t.week2Points,
        week3Points: t.week3Points,
        bestStagePoints: t.bestStagePoints,
        globalRank: i + 1,
        lastScoredStage: t.lastScoredStage,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: fantasyTeamTotals.teamId,
        set: {
          totalPoints: t.totalPoints,
          week1Points: t.week1Points,
          week2Points: t.week2Points,
          week3Points: t.week3Points,
          bestStagePoints: t.bestStagePoints,
          globalRank: i + 1,
          lastScoredStage: t.lastScoredStage,
          updatedAt: new Date(),
        },
      });
  }
}

/* ─── Players, teams, leagues ───────────────────────────────── */

export async function getPlayerByEmail(email: string) {
  const [player] = await db
    .select()
    .from(fantasyPlayers)
    .where(eq(fantasyPlayers.email, email.toLowerCase()));
  return player ?? null;
}

export async function getTeamForPlayer(playerId: number) {
  const [team] = await db
    .select()
    .from(fantasyTeams)
    .where(eq(fantasyTeams.playerId, playerId));
  return team ?? null;
}

export async function listRidersWithTeams() {
  return db
    .select({
      id: fantasyRiders.id,
      name: fantasyRiders.name,
      price: fantasyRiders.price,
      riderClass: fantasyRiders.riderClass,
      status: fantasyRiders.status,
      countryCode: fantasyRiders.countryCode,
      proTeamId: fantasyRiders.proTeamId,
      proTeamName: fantasyProTeams.name,
      proTeamCode: fantasyProTeams.code,
      jerseyHex: fantasyProTeams.jerseyHex,
    })
    .from(fantasyRiders)
    .innerJoin(fantasyProTeams, eq(fantasyProTeams.id, fantasyRiders.proTeamId))
    .orderBy(sql`${fantasyRiders.price} DESC`, asc(fantasyRiders.name));
}

const LEAGUE_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L

export function generateLeagueCode(random: () => number = Math.random): string {
  return Array.from(
    { length: 6 },
    () => LEAGUE_CODE_ALPHABET[Math.floor(random() * LEAGUE_CODE_ALPHABET.length)],
  ).join("");
}

export async function createLeague(name: string, playerId: number): Promise<{ id: number; code: string }> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateLeagueCode();
    try {
      const [league] = await db
        .insert(fantasyLeagues)
        .values({ code, name, createdByPlayerId: playerId })
        .returning({ id: fantasyLeagues.id, code: fantasyLeagues.code });
      await db.insert(fantasyLeagueMembers).values({ leagueId: league.id, playerId });
      return league;
    } catch {
      // Code collision (unique index) — retry with a fresh code.
    }
  }
  throw new Error("Could not generate a unique league code");
}

export async function joinLeague(code: string, playerId: number) {
  const [league] = await db
    .select()
    .from(fantasyLeagues)
    .where(eq(fantasyLeagues.code, code.toUpperCase()));
  if (!league) return null;
  await db
    .insert(fantasyLeagueMembers)
    .values({ leagueId: league.id, playerId })
    .onConflictDoNothing();
  return league;
}

export async function leagueStandings(leagueId: number) {
  return db
    .select({
      rank: fantasyTeamTotals.globalRank,
      totalPoints: fantasyTeamTotals.totalPoints,
      teamName: fantasyTeams.name,
      teamId: fantasyTeams.id,
      playerFirstName: fantasyPlayers.firstName,
    })
    .from(fantasyLeagueMembers)
    .innerJoin(fantasyPlayers, eq(fantasyPlayers.id, fantasyLeagueMembers.playerId))
    .innerJoin(fantasyTeams, eq(fantasyTeams.playerId, fantasyPlayers.id))
    .leftJoin(fantasyTeamTotals, eq(fantasyTeamTotals.teamId, fantasyTeams.id))
    .where(eq(fantasyLeagueMembers.leagueId, leagueId))
    .orderBy(sql`${fantasyTeamTotals.totalPoints} DESC NULLS LAST`);
}

export async function leaguesForPlayer(playerId: number) {
  return db
    .select({
      id: fantasyLeagues.id,
      code: fantasyLeagues.code,
      name: fantasyLeagues.name,
      isOfficial: fantasyLeagues.isOfficial,
    })
    .from(fantasyLeagueMembers)
    .innerJoin(fantasyLeagues, eq(fantasyLeagues.id, fantasyLeagueMembers.leagueId))
    .where(eq(fantasyLeagueMembers.playerId, playerId));
}

/* ─── Audit ─────────────────────────────────────────────────── */

export async function audit(
  actor: string,
  action: string,
  entity: string,
  entityId: string | null,
  detail?: Record<string, unknown>,
): Promise<void> {
  try {
    await db.insert(fantasyAuditLog).values({ actor, action, entity, entityId, detail });
  } catch (error) {
    // The audit trail must never break the action it records.
    console.error("[fantasy] audit write failed", error);
  }
}

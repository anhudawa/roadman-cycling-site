/**
 * Roadman Fantasy Tour — demo reset (pre-launch only).
 *
 * The game gets demoed internally between build and launch: fictional
 * riders seeded, test teams created, fake results published. Before
 * the real Tour everything demo must go, without touching the verified
 * reference data (stages, the 23 real teams) or — in the scoring-only
 * scope — real players' squads.
 *
 * Two scopes:
 *
 *  - "scoring": un-runs the Tour. Deletes results, scoring events,
 *    team stage scores, totals, transfers, and captain picks beyond
 *    Stage 1; collapses every squad's effective-dated history back to
 *    a fresh Stage-1 selection; restores riders flagged abandoned
 *    during the demo (back to confirmed if they have a confirmed
 *    source, provisional otherwise). Players and teams survive.
 *
 *  - "demo-full": "scoring" plus deletes every is_demo player with
 *    their team, squad rows, league memberships, auth tokens, and any
 *    non-official league they created — and deletes the fictional
 *    demo riders (source_url 'demo://seed'). The Roadman Clubhouse
 *    league always survives.
 *
 * Both scopes are preview-then-confirm in the admin UI and fully
 * audit-logged. Neither touches fantasy_stages, fantasy_pro_teams,
 * game config, or the audit log itself.
 */

import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  fantasyAuthTokens,
  fantasyCaptainPicks,
  fantasyLeagueMembers,
  fantasyLeagues,
  fantasyPlayers,
  fantasyRiders,
  fantasyScoringEvents,
  fantasyStageResults,
  fantasyTeamRiders,
  fantasyTeams,
  fantasyTeamStageScores,
  fantasyTeamTotals,
  fantasyTransfers,
} from "@/lib/db/schema";
import { audit } from "./queries";

export const DEMO_RIDER_SOURCE = "demo://seed";

export type ResetScope = "scoring" | "demo-full";

export interface ResetPreview {
  scope: ResetScope;
  stageResults: number;
  scoringEvents: number;
  teamStageScores: number;
  transfers: number;
  abandonedRidersToRestore: number;
  demoPlayers: number;
  demoRiders: number;
  demoLeagues: number;
}

export async function previewReset(scope: ResetScope): Promise<ResetPreview> {
  const [stageResults, scoringEvents, teamStageScores, transfers, abandoned, demoPlayers, demoRiders] =
    await Promise.all([
      db.select({ id: fantasyStageResults.id }).from(fantasyStageResults),
      db.select({ id: fantasyScoringEvents.id }).from(fantasyScoringEvents),
      db.select({ id: fantasyTeamStageScores.id }).from(fantasyTeamStageScores),
      db.select({ id: fantasyTransfers.id }).from(fantasyTransfers),
      db
        .select({ id: fantasyRiders.id })
        .from(fantasyRiders)
        .where(isNotNull(fantasyRiders.abandonedAfterStage)),
      db.select({ id: fantasyPlayers.id }).from(fantasyPlayers).where(eq(fantasyPlayers.isDemo, true)),
      db
        .select({ id: fantasyRiders.id })
        .from(fantasyRiders)
        .where(eq(fantasyRiders.sourceUrl, DEMO_RIDER_SOURCE)),
    ]);

  const demoLeagues = scope === "demo-full" ? await listDemoLeagueIds() : [];

  return {
    scope,
    stageResults: stageResults.length,
    scoringEvents: scoringEvents.length,
    teamStageScores: teamStageScores.length,
    transfers: transfers.length,
    abandonedRidersToRestore: abandoned.length,
    demoPlayers: scope === "demo-full" ? demoPlayers.length : 0,
    demoRiders: scope === "demo-full" ? demoRiders.length : 0,
    demoLeagues: demoLeagues.length,
  };
}

/** Non-official leagues created by demo players. */
async function listDemoLeagueIds(): Promise<number[]> {
  const rows = await db
    .select({ id: fantasyLeagues.id })
    .from(fantasyLeagues)
    .innerJoin(fantasyPlayers, eq(fantasyPlayers.id, fantasyLeagues.createdByPlayerId))
    .where(and(eq(fantasyPlayers.isDemo, true), eq(fantasyLeagues.isOfficial, false)));
  return rows.map((r) => r.id);
}

export async function performReset(scope: ResetScope, actor: string): Promise<ResetPreview> {
  const preview = await previewReset(scope);

  // --- Scoring artifacts (both scopes) ---
  await db.delete(fantasyScoringEvents);
  await db.delete(fantasyTeamStageScores);
  await db.delete(fantasyTeamTotals);
  await db.delete(fantasyStageResults);
  await db.delete(fantasyTransfers);
  await db.delete(fantasyCaptainPicks);

  // Restore riders the demo results marked abandoned: back to confirmed
  // when a confirmation source exists, otherwise back to provisional.
  await db
    .update(fantasyRiders)
    .set({ status: "confirmed", abandonedAfterStage: null, updatedAt: new Date() })
    .where(and(isNotNull(fantasyRiders.abandonedAfterStage), isNotNull(fantasyRiders.confirmedSource)));
  await db
    .update(fantasyRiders)
    .set({ status: "provisional", abandonedAfterStage: null, updatedAt: new Date() })
    .where(isNotNull(fantasyRiders.abandonedAfterStage));

  // Collapse squad history: drop closed rows (transferred-out riders),
  // re-open every current row as a fresh Stage-1 initial pick.
  await db.delete(fantasyTeamRiders).where(isNotNull(fantasyTeamRiders.effectiveToStage));
  await db.update(fantasyTeamRiders).set({ effectiveFromStage: 1, addedVia: "initial" });

  if (scope === "demo-full") {
    const demoPlayerRows = await db
      .select({ id: fantasyPlayers.id, email: fantasyPlayers.email })
      .from(fantasyPlayers)
      .where(eq(fantasyPlayers.isDemo, true));
    const demoPlayerIds = demoPlayerRows.map((p) => p.id);

    if (demoPlayerIds.length > 0) {
      const demoTeams = await db
        .select({ id: fantasyTeams.id })
        .from(fantasyTeams)
        .where(inArray(fantasyTeams.playerId, demoPlayerIds));
      const demoTeamIds = demoTeams.map((t) => t.id);

      if (demoTeamIds.length > 0) {
        await db.delete(fantasyTeamRiders).where(inArray(fantasyTeamRiders.teamId, demoTeamIds));
        await db.delete(fantasyTeams).where(inArray(fantasyTeams.id, demoTeamIds));
      }
      await db
        .delete(fantasyLeagueMembers)
        .where(inArray(fantasyLeagueMembers.playerId, demoPlayerIds));

      const demoLeagueIds = await listDemoLeagueIds();
      if (demoLeagueIds.length > 0) {
        await db
          .delete(fantasyLeagueMembers)
          .where(inArray(fantasyLeagueMembers.leagueId, demoLeagueIds));
        await db.delete(fantasyLeagues).where(inArray(fantasyLeagues.id, demoLeagueIds));
      }

      await db.delete(fantasyAuthTokens).where(
        inArray(
          fantasyAuthTokens.email,
          demoPlayerRows.map((p) => p.email),
        ),
      );
      await db.delete(fantasyPlayers).where(inArray(fantasyPlayers.id, demoPlayerIds));
    }

    // Fictional demo riders: remove any lingering squad references
    // (a non-demo tester picking demo riders), then the riders.
    const demoRiders = await db
      .select({ id: fantasyRiders.id })
      .from(fantasyRiders)
      .where(eq(fantasyRiders.sourceUrl, DEMO_RIDER_SOURCE));
    const demoRiderIds = demoRiders.map((r) => r.id);
    if (demoRiderIds.length > 0) {
      await db.delete(fantasyTeamRiders).where(inArray(fantasyTeamRiders.riderId, demoRiderIds));
      await db.delete(fantasyCaptainPicks).where(inArray(fantasyCaptainPicks.riderId, demoRiderIds));
      await db.delete(fantasyRiders).where(inArray(fantasyRiders.id, demoRiderIds));
    }
  }

  await audit(actor, "game.reset", "game", scope, preview as unknown as Record<string, unknown>);
  return preview;
}

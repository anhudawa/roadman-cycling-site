import { NextResponse, type NextRequest } from "next/server";
import { and, eq, isNull, isNotNull, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  fantasyLeagueMembers,
  fantasyLeagues,
  fantasyPlayers,
  fantasyTeams,
  fantasyTeamStageScores,
  fantasyTeamTotals,
} from "@/lib/db/schema";
import { verifyBearer } from "@/lib/security/bearer";
import { mintDeepLinkToken } from "@/lib/fantasy/auth";
import {
  renderDailyStageEmail,
  renderRestDayEmail,
  sendRenderedEmail,
} from "@/lib/fantasy/emails";
import { deadlineForStage, listStages } from "@/lib/fantasy/queries";
import { syncPlayerToBeehiiv } from "@/lib/fantasy/marketing";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_BEEHIIV_RETRIES = 5;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return verifyBearer(req.headers.get("authorization"), secret);
}

function todayInParis(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
}

/**
 * GET /api/cron/fantasy-daily-email — fires 06:30 Irish time every
 * morning of the Tour (vercel.json schedules it for July only).
 *
 *  - Stage morning → the daily stage email (Section 5.2): position,
 *    stage + Roadman take, fantasy angle, deadline, one deep-link CTA.
 *  - Rest-day morning → "bonus transfer unlocked" email.
 *  - Every run → Beehiiv retry queue sweep (verified players whose
 *    sync hasn't landed, capped at 5 attempts).
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = todayInParis();
  const stages = await listStages();
  const todayStage = stages.find((s) => s.date === today) ?? null;
  const restDay = !todayStage
    ? stages.find((s) => {
        if (!s.restDayAfter) return false;
        const next = new Date(`${s.date}T00:00:00Z`);
        next.setUTCDate(next.getUTCDate() + 1);
        return next.toISOString().slice(0, 10) === today;
      })
    : null;

  // Beehiiv retry queue runs whether or not there's an email today.
  const pendingSync = await db
    .select()
    .from(fantasyPlayers)
    .where(
      and(
        isNotNull(fantasyPlayers.verifiedAt),
        isNull(fantasyPlayers.beehiivSyncedAt),
        isNull(fantasyPlayers.deletedAt),
        lt(fantasyPlayers.beehiivSyncAttempts, MAX_BEEHIIV_RETRIES),
      ),
    )
    .limit(200);
  for (const player of pendingSync) {
    await syncPlayerToBeehiiv(player);
  }

  if (!todayStage && !restDay) {
    return NextResponse.json({ ok: true, sent: 0, beehiivRetries: pendingSync.length, note: "No stage or rest day today." });
  }

  // Recipients: verified, consented, not deleted, with a team.
  const recipients = await db
    .select({
      playerId: fantasyPlayers.id,
      email: fantasyPlayers.email,
      firstName: fantasyPlayers.firstName,
      teamId: fantasyTeams.id,
      teamName: fantasyTeams.name,
      globalRank: fantasyTeamTotals.globalRank,
      totalPoints: fantasyTeamTotals.totalPoints,
      lastScoredStage: fantasyTeamTotals.lastScoredStage,
    })
    .from(fantasyPlayers)
    .innerJoin(fantasyTeams, eq(fantasyTeams.playerId, fantasyPlayers.id))
    .leftJoin(fantasyTeamTotals, eq(fantasyTeamTotals.teamId, fantasyTeams.id))
    .where(
      and(
        isNotNull(fantasyPlayers.verifiedAt),
        isNotNull(fantasyPlayers.consentAt),
        isNull(fantasyPlayers.deletedAt),
      ),
    );

  const totalPlayers = recipients.length;

  // League ranks, computed once and grouped per player.
  const memberships = await db
    .select({
      playerId: fantasyLeagueMembers.playerId,
      leagueId: fantasyLeagueMembers.leagueId,
      leagueName: fantasyLeagues.name,
      totalPoints: fantasyTeamTotals.totalPoints,
    })
    .from(fantasyLeagueMembers)
    .innerJoin(fantasyLeagues, eq(fantasyLeagues.id, fantasyLeagueMembers.leagueId))
    .innerJoin(fantasyTeams, eq(fantasyTeams.playerId, fantasyLeagueMembers.playerId))
    .leftJoin(fantasyTeamTotals, eq(fantasyTeamTotals.teamId, fantasyTeams.id));
  const byLeague = new Map<number, { playerId: number; points: number; leagueName: string }[]>();
  for (const m of memberships) {
    const list = byLeague.get(m.leagueId) ?? [];
    list.push({ playerId: m.playerId, points: m.totalPoints ?? 0, leagueName: m.leagueName });
    byLeague.set(m.leagueId, list);
  }
  const leagueRanksByPlayer = new Map<number, { name: string; rank: number; size: number }[]>();
  for (const members of byLeague.values()) {
    members.sort((a, b) => b.points - a.points);
    members.forEach((m, idx) => {
      const list = leagueRanksByPlayer.get(m.playerId) ?? [];
      list.push({ name: m.leagueName, rank: idx + 1, size: members.length });
      leagueRanksByPlayer.set(m.playerId, list);
    });
  }

  // Last published stage's points per team (the "you scored N" hook).
  const lastStage = todayStage ? todayStage.stageNumber - 1 : (restDay?.stageNumber ?? 0);
  const lastScores =
    lastStage >= 1
      ? await db
          .select({ teamId: fantasyTeamStageScores.teamId, points: fantasyTeamStageScores.points })
          .from(fantasyTeamStageScores)
          .where(eq(fantasyTeamStageScores.stageNumber, lastStage))
      : [];
  const lastScoreByTeam = new Map(lastScores.map((s) => [s.teamId, s.points]));

  let sent = 0;
  let failed = 0;
  for (const recipient of recipients) {
    const deepLinkToken = mintDeepLinkToken(recipient.email);
    const rendered = todayStage
      ? renderDailyStageEmail({
          to: recipient.email,
          firstName: recipient.firstName,
          teamName: recipient.teamName,
          globalRank: recipient.globalRank,
          totalPlayers,
          lastStagePoints: lastScoreByTeam.get(recipient.teamId) ?? null,
          lastStageNumber: lastStage >= 1 ? lastStage : null,
          miniLeagues: (leagueRanksByPlayer.get(recipient.playerId) ?? []).slice(0, 3),
          stage: todayStage,
          roadmanTake: todayStage.roadmanTake,
          deadline: deadlineForStage(todayStage),
          deepLinkToken,
        })
      : renderRestDayEmail({
          firstName: recipient.firstName,
          globalRank: recipient.globalRank,
          totalPlayers,
          deepLinkToken,
          weekLabel: restDay!.stageNumber === 9 ? "week two" : "the final week",
        });

    const ok = await sendRenderedEmail(
      recipient.email,
      rendered,
      todayStage ? `fantasy-stage-${todayStage.stageNumber}` : "fantasy-rest-day",
    );
    if (ok) sent++;
    else failed++;
  }

  return NextResponse.json({
    ok: true,
    mode: todayStage ? `stage-${todayStage.stageNumber}` : "rest-day",
    sent,
    failed,
    beehiivRetries: pendingSync.length,
  });
}

import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyLeagues, fantasyPlayers, fantasyTeams, fantasyTeamTotals } from "@/lib/db/schema";
import { leagueStandings } from "@/lib/fantasy/queries";

export const runtime = "nodejs";

const PAGE_SIZE = 50;

/**
 * GET /api/fantasy/leaderboard?league=CODE&week=1&page=0
 *
 * Reads only the computed fantasy_team_totals table (rebuilt on every
 * scoring publish), never live aggregates — Section 7's "survive a
 * viral Facebook post" requirement. Edge-cached for 60s.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const leagueCode = url.searchParams.get("league")?.toUpperCase() ?? null;
  const week = url.searchParams.get("week");
  const page = Math.max(0, Number(url.searchParams.get("page") ?? 0) || 0);

  try {
    if (leagueCode) {
      const [league] = await db
        .select()
        .from(fantasyLeagues)
        .where(eq(fantasyLeagues.code, leagueCode));
      if (!league) return NextResponse.json({ error: "Unknown league code." }, { status: 404 });
      const standings = await leagueStandings(league.id);
      return NextResponse.json(
        { league: { name: league.name, code: league.code, isOfficial: league.isOfficial }, standings },
        { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
      );
    }

    const weekColumn =
      week === "1"
        ? fantasyTeamTotals.week1Points
        : week === "2"
          ? fantasyTeamTotals.week2Points
          : week === "3"
            ? fantasyTeamTotals.week3Points
            : null;

    const rows = await db
      .select({
        rank: fantasyTeamTotals.globalRank,
        totalPoints: fantasyTeamTotals.totalPoints,
        weekPoints: weekColumn ?? sql<number>`0`,
        bestStagePoints: fantasyTeamTotals.bestStagePoints,
        teamName: fantasyTeams.name,
        playerFirstName: fantasyPlayers.firstName,
        country: fantasyPlayers.country,
      })
      .from(fantasyTeamTotals)
      .innerJoin(fantasyTeams, eq(fantasyTeams.id, fantasyTeamTotals.teamId))
      .innerJoin(fantasyPlayers, eq(fantasyPlayers.id, fantasyTeams.playerId))
      .orderBy(weekColumn ? desc(weekColumn) : sql`${fantasyTeamTotals.globalRank} ASC NULLS LAST`)
      .limit(PAGE_SIZE)
      .offset(page * PAGE_SIZE);

    return NextResponse.json(
      { standings: rows, page, pageSize: PAGE_SIZE, week: week ?? null },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error("[fantasy/leaderboard] failed:", error);
    return NextResponse.json({ error: "Could not load the leaderboard." }, { status: 500 });
  }
}

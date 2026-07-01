import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyPlayers, fantasyTeams, fantasyTeamTotals } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Standings",
  description: "The Roadman Fantasy Tour global leaderboard — and the weekly podiums.",
};

export const revalidate = 60;

const PAGE_SIZE = 50;

const WEEK_TABS = [
  { key: null, label: "OVERALL" },
  { key: "1", label: "WEEK 1" },
  { key: "2", label: "WEEK 2" },
  { key: "3", label: "WEEK 3" },
] as const;

/**
 * Reads only the computed totals table (rebuilt on publish) — the page
 * itself is revalidated every 60s, so a viral moment hits the cache,
 * not Postgres.
 */
export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; page?: string }>;
}) {
  const { week, page: pageParam } = await searchParams;
  const page = Math.max(0, Number(pageParam ?? 0) || 0);
  const weekColumn =
    week === "1"
      ? fantasyTeamTotals.week1Points
      : week === "2"
        ? fantasyTeamTotals.week2Points
        : week === "3"
          ? fantasyTeamTotals.week3Points
          : null;

  let rows: {
    rank: number | null;
    points: number;
    teamName: string;
    playerFirstName: string;
    country: string | null;
  }[] = [];
  try {
    rows = await db
      .select({
        rank: fantasyTeamTotals.globalRank,
        points: weekColumn ?? fantasyTeamTotals.totalPoints,
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
  } catch {
    // Pre-launch: table empty or unreachable — render the empty state.
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-heading text-5xl tracking-wide">STANDINGS</h1>
      <nav aria-label="Leaderboard weeks" className="mt-6 flex gap-2">
        {WEEK_TABS.map((tab) => {
          const active = (week ?? null) === tab.key;
          return (
            <Link
              key={tab.label}
              href={tab.key ? `/fantasy/leaderboard?week=${tab.key}` : "/fantasy/leaderboard"}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-4 py-2 font-heading text-sm tracking-widest transition-colors ${
                active ? "bg-coral text-charcoal" : "bg-white/10 text-off-white/70 hover:bg-white/20"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-xl border border-white/10 bg-deep-purple/40 p-8 text-center">
          <h2 className="font-heading text-2xl tracking-wide">NOBODY HAS SCORED YET</h2>
          <p className="mx-auto mt-3 max-w-md text-off-white/70">
            First points land when Stage 1 finishes in Barcelona on 4 July.{" "}
            <Link href="/fantasy/build" className="text-coral underline">
              Make sure you&apos;re on the startline.
            </Link>
          </p>
        </div>
      ) : (
        <ol className="mt-6 divide-y divide-white/5">
          {rows.map((row, i) => {
            const position = week ? page * PAGE_SIZE + i + 1 : (row.rank ?? page * PAGE_SIZE + i + 1);
            return (
              <li key={`${row.teamName}-${i}`} className="flex items-center gap-4 py-3">
                <span
                  className={`w-12 shrink-0 text-right font-heading text-xl tabular-nums ${
                    position <= 3 ? "text-coral" : "text-off-white/50"
                  }`}
                >
                  {position}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{row.teamName}</p>
                  <p className="truncate text-xs text-mid-grey">
                    {row.playerFirstName}
                    {row.country ? ` · ${row.country}` : ""}
                  </p>
                </div>
                <span className="font-heading text-2xl tabular-nums">{row.points}</span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-8 flex justify-between">
        {page > 0 ? (
          <Link
            href={`/fantasy/leaderboard?${week ? `week=${week}&` : ""}page=${page - 1}`}
            className="text-sm text-off-white/70 hover:text-off-white"
          >
            ← Previous 50
          </Link>
        ) : (
          <span />
        )}
        {rows.length === PAGE_SIZE && (
          <Link
            href={`/fantasy/leaderboard?${week ? `week=${week}&` : ""}page=${page + 1}`}
            className="text-sm text-off-white/70 hover:text-off-white"
          >
            Next 50 →
          </Link>
        )}
      </div>
    </div>
  );
}

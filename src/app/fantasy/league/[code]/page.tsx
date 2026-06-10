import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyLeagues } from "@/lib/db/schema";
import { leagueStandings } from "@/lib/fantasy/queries";
import { JoinLeagueButton } from "@/components/features/fantasy/JoinLeagueButton";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `League ${code.toUpperCase()}`,
    description: "A Roadman Fantasy Tour mini-league. Join with the code and take it personally.",
  };
}

/** The share-link landing: standings + a one-tap join (Section 4.5). */
export default async function LeaguePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const normalised = code.toUpperCase();

  let league: { id: number; name: string; code: string; isOfficial: boolean } | null = null;
  let standings: Awaited<ReturnType<typeof leagueStandings>> = [];
  try {
    const [row] = await db.select().from(fantasyLeagues).where(eq(fantasyLeagues.code, normalised));
    if (row) {
      league = row;
      standings = await leagueStandings(row.id);
    }
  } catch {
    // DB unreachable — treat as not found rather than erroring the share link.
  }
  if (!league) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="font-heading text-sm tracking-[0.3em] text-coral">
        MINI-LEAGUE · CODE {league.code}
        {league.isOfficial ? " · OFFICIAL" : ""}
      </p>
      <h1 className="mt-2 font-heading text-5xl tracking-wide">{league.name.toUpperCase()}</h1>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <JoinLeagueButton code={league.code} />
        <p className="text-sm text-mid-grey">
          No team yet?{" "}
          <Link href="/fantasy/build" className="text-coral underline">
            Build one first
          </Link>{" "}
          — it takes five minutes.
        </p>
      </div>

      {standings.length === 0 ? (
        <p className="mt-10 text-off-white/70">
          Nobody on the board yet. First in gets the bragging rights by default.
        </p>
      ) : (
        <ol className="mt-8 divide-y divide-white/5">
          {standings.map((row, i) => (
            <li key={row.teamId} className="flex items-center gap-4 py-3">
              <span
                className={`w-10 shrink-0 text-right font-heading text-xl tabular-nums ${
                  i < 3 ? "text-coral" : "text-off-white/50"
                }`}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{row.teamName}</p>
                <p className="truncate text-xs text-mid-grey">{row.playerFirstName}</p>
              </div>
              <span className="font-heading text-2xl tabular-nums">{row.totalPoints ?? 0}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

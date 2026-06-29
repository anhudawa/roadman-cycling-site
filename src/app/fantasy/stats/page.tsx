import type { Metadata } from "next";
import Link from "next/link";
import { dreamTeam } from "@/lib/fantasy/scoring";
import {
  getAllScoringEvents,
  getCaptaincy,
  getOwnership,
  listRidersWithTeams,
  loadGameConfig,
  nextOpenStage,
} from "@/lib/fantasy/queries";

export const metadata: Metadata = {
  title: "Stats",
  description:
    "The numbers behind the Roadman Fantasy Tour: most-picked riders, most-captained, and the Dream Team of the race so far.",
};

export const revalidate = 300;

interface StatRow {
  label: string;
  value: string;
}

function StatList({ title, subtitle, rows }: { title: string; subtitle: string; rows: StatRow[] }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="font-heading text-2xl tracking-wide">{title}</h2>
      <p className="mt-1 text-sm text-mid-grey">{subtitle}</p>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-off-white/60">Nothing here yet — it fills in as the game does.</p>
      ) : (
        <ol className="mt-4 divide-y divide-white/5">
          {rows.map((row, i) => (
            <li key={row.label} className="flex items-center gap-3 py-2">
              <span
                className={`w-7 shrink-0 text-right font-heading text-lg tabular-nums ${
                  i < 3 ? "text-jersey-yellow" : "text-off-white/50"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate">{row.label}</span>
              <span className="font-heading text-lg tabular-nums text-off-white/90">{row.value}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/**
 * The stats hub (FPL's most-read surface, translated): effective
 * ownership, captaincy, and the Dream Team. This page is what makes
 * differentials a strategy — if 60% of teams have a rider, owning him
 * protects your rank; owning the 2% rider who wins is how you climb.
 */
export default async function StatsPage() {
  let mostPicked: StatRow[] = [];
  let mostCaptained: StatRow[] = [];
  let dream: StatRow[] = [];
  let captainStageNumber: number | null = null;

  try {
    const [riders, ownership, events, openStage, config] = await Promise.all([
      listRidersWithTeams(),
      getOwnership(),
      getAllScoringEvents(),
      nextOpenStage(),
      loadGameConfig(),
    ]);
    const nameById = new Map(riders.map((r) => [r.id, `${r.name} (${r.proTeamCode})`]));

    if (ownership.totalTeams > 0) {
      mostPicked = [...ownership.byRider.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([riderId, holders]) => ({
          label: nameById.get(riderId) ?? "—",
          value: `${Math.round((holders / ownership.totalTeams) * 1000) / 10}%`,
        }));
    }

    if (openStage) {
      captainStageNumber = openStage.stageNumber;
      const captaincy = await getCaptaincy(openStage.stageNumber);
      const totalCaptains = captaincy.reduce((sum, c) => sum + c.count, 0);
      mostCaptained = captaincy.map((c) => ({
        label: c.name,
        value: totalCaptains > 0 ? `${Math.round((c.count / totalCaptains) * 100)}%` : String(c.count),
      }));
    }

    dream = dreamTeam(events, config.squadSize).map((entry) => ({
      label: nameById.get(entry.riderId) ?? "—",
      value: `${entry.points} pts`,
    }));
  } catch {
    // DB unreachable — every list renders its empty state.
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-heading text-5xl tracking-wide">THE NUMBERS</h1>
      <p className="mt-3 max-w-2xl text-off-white/70">
        Ownership is the meta-game: highly-picked riders protect your rank, low-picked riders move
        it. Captaincy is conviction. The Dream Team is the squad nobody actually picked.
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <StatList
          title="MOST PICKED"
          subtitle="Share of all teams holding the rider right now"
          rows={mostPicked}
        />
        <StatList
          title="MOST CAPTAINED"
          subtitle={
            captainStageNumber
              ? `Armband share for Stage ${captainStageNumber}`
              : "Armband share for the next stage"
          }
          rows={mostCaptained}
        />
        <StatList
          title="DREAM TEAM"
          subtitle="The highest-scoring eight of the Tour so far"
          rows={dream}
        />
      </div>

      <p className="mt-8 text-sm text-mid-grey">
        Want the rider nobody owns before he wins on the Alpe?{" "}
        <Link href="/fantasy/team" className="text-jersey-yellow underline">
          Your transfers are waiting.
        </Link>
      </p>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { LAUNCH_DEFAULTS, type FantasyGameConfig } from "@/lib/fantasy/config";
import { loadGameConfig } from "@/lib/fantasy/queries";

export const metadata: Metadata = {
  title: "Rules & scoring",
  description:
    "The full Roadman Fantasy Tour rulebook: 100 credits, 8 riders, every points table, transfers, deadlines, and how the Girona training camp gets won.",
};

export const revalidate = 300;

/**
 * The rulebook renders from the same config object the scoring engine
 * runs on (admin overrides included), so the published numbers can
 * never drift from how points are actually awarded.
 */
async function getConfig(): Promise<FantasyGameConfig> {
  try {
    return await loadGameConfig();
  } catch {
    return LAUNCH_DEFAULTS;
  }
}

function ordinal(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10 <= 3 ? n % 10 : 0]}`;
}

function PointsTable({ rows, caption }: { rows: [string, string | number][]; caption: string }) {
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">{caption}</caption>
      <tbody>
        {rows.map(([label, points]) => (
          <tr key={label} className="border-b border-white/5">
            <td className="py-1.5 pr-4 text-off-white/75">{label}</td>
            <td className="py-1.5 text-right font-heading text-lg tabular-nums text-jersey-yellow">{points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RuleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-heading text-3xl tracking-wide">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-off-white/80">{children}</div>
    </section>
  );
}

export default async function RulesPage() {
  const c = await getConfig();

  // The team-picking lock, shown in Irish time (matches the audience and
  // the daily-email framing). Falls back to a generic phrase if unset.
  const pickingDeadlineLabel = c.pickingDeadlineIso
    ? new Date(c.pickingDeadlineIso).toLocaleString("en-IE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Dublin",
      }) + " Irish time"
    : "the Stage 1 start";

  const finishRows: [string, number][] = c.stageFinishPoints.map((points, idx) => [
    ordinal(idx + 1),
    points,
  ]);
  const finalGcRows: [string, number][] = c.finalGcPoints
    .slice(0, 10)
    .map((points, idx) => [ordinal(idx + 1), points] as [string, number])
    .concat([[`11th–${ordinal(c.finalGcPoints.length)}`, c.finalGcPoints[10]]]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="font-heading text-sm tracking-[0.3em] text-jersey-yellow">FREE TO PLAY · NO ENTRY FEE</p>
      <h1 className="mt-2 font-heading text-5xl tracking-wide sm:text-6xl">THE RULEBOOK</h1>
      <p className="mt-4 text-lg text-off-white/80">
        Everything below is exactly how the scoring engine works — this page reads from the same
        configuration the game runs on. If a jury decision changes a result, every score on this
        page&apos;s rules gets recomputed automatically.
      </p>

      <RuleSection title="What you're playing for">
        <p>
          The overall winner gets a <strong className="text-off-white">place at the Roadman
          training camp in Girona</strong> — riding, coaching, and the full camp experience on us.
          Flights and transfers are not included; you get yourself to Girona, we do the rest.
          No cash alternative. Further prizes are announced before Stage 1 and listed on the{" "}
          <Link href="/fantasy/terms" className="text-jersey-yellow underline">
            game terms
          </Link>{" "}
          page.
        </p>
      </RuleSection>

      <RuleSection title="Building your team">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-off-white">{c.squadSize} riders, {c.budget} credits.</strong>{" "}
            Prices run from 24 down to 4 and are fixed for the whole Tour.
          </li>
          <li>
            Max <strong className="text-off-white">{c.maxPerProTeam} riders from any one trade
            team</strong> — no buying a whole squad.
          </li>
          <li>
            At least {c.minCheapRiders.count} rider priced{" "}
            <strong className="text-off-white">{c.minCheapRiders.maxPrice} credits or less</strong>.
            Depth picks win this game.
          </li>
          <li>
            Unlimited free changes until {pickingDeadlineLabel}, when your squad locks for Stage 1.
            Squads are labelled provisional
            until teams confirm their riders — if a rider you picked doesn&apos;t start, you get a
            free swap in the grace window.
          </li>
        </ul>
      </RuleSection>

      <RuleSection title="Captain">
        <p>
          One captain per stage, scores <strong className="text-off-white">×{c.captainMultiplier} on
          everything</strong>. Change him as often as you like before each stage rolls out — sprinter
          for Bordeaux, climber for Alpe d&apos;Huez. If your captain abandons, his replacement
          earns normal points until you captain someone else.
        </p>
      </RuleSection>

      <RuleSection title="Transfers">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-off-white">{c.transfersTotal} transfers</strong> for the three
            weeks, max <strong className="text-off-white">{c.transfersPerStage} between any two
            stages</strong>.
          </li>
          <li>
            Each rest day (13 and 20 July) unlocks{" "}
            <strong className="text-off-white">+{c.restDayBonusTransfers} bonus transfer</strong>,
            on top of whatever you have left{c.restDayBonusExemptFromStageCap ? " and exempt from the per-stage cap" : ""}.
          </li>
          <li>
            A rider who leaves the race scores nothing from that point but is{" "}
            <strong className="text-off-white">not replaced for free</strong>. Transfers are the
            resource — spend them well. (Exception: riders flagged DNS before Stage 1, swapped free
            in the grace window.)
          </li>
          <li>
            Transfers and captain picks <strong className="text-off-white">lock at the official
            stage start time</strong>, shown in your local time on your team page and in the daily
            email.
          </li>
        </ul>
      </RuleSection>

      {(c.chips.wildcardEnabled || c.chips.tripleCaptainEnabled) && (
        <RuleSection title="Chips">
          <p>One of each for the whole Tour. Played for the next stage, reversible until roll-out.</p>
          <ul className="list-disc space-y-1.5 pl-5">
            {c.chips.wildcardEnabled && (
              <li>
                <strong className="text-off-white">Wildcard</strong> — rebuild your whole squad for
                one stage: every transfer that day is free and doesn&apos;t count against your{" "}
                {c.transfersTotal}. Once you&apos;ve made wildcard transfers, the chip is committed.
              </li>
            )}
            {c.chips.tripleCaptainEnabled && (
              <li>
                <strong className="text-off-white">Triple Captain</strong> — your captain scores{" "}
                ×{c.chips.tripleCaptainMultiplier} instead of ×{c.captainMultiplier} for one stage.
                Two summit finishes on Alpe d&apos;Huez say hello.
              </li>
            )}
          </ul>
        </RuleSection>
      )}

      <RuleSection title="Stage finish points">
        <p>Awarded from the official result of every stage:</p>
        <div className="grid gap-x-10 sm:grid-cols-2">
          <PointsTable caption="Stage finish points, positions 1 to 10" rows={finishRows.slice(0, 10)} />
          <PointsTable caption="Stage finish points, positions 11 to 20" rows={finishRows.slice(10)} />
        </div>
        <p className="text-sm text-mid-grey">
          Stage 1 (the Barcelona team time trial) scores each rider&apos;s individual recorded
          position at {Math.round(c.tttFactor * 100)}% of the table above. If the organisers only
          publish per-team results, riders score by team finishing order instead: winning team{" "}
          {c.tttTeamFallbackPoints[0]}, 2nd {c.tttTeamFallbackPoints[1]}, 3rd{" "}
          {c.tttTeamFallbackPoints[2]}, 4th–10th {c.tttTeamFallbackPoints[3]}, the rest{" "}
          {c.tttTeamFallbackPoints[c.tttTeamFallbackPoints.length - 1]}.
        </p>
      </RuleSection>

      <RuleSection title="Jerseys & in-stage points">
        <div className="grid gap-x-10 sm:grid-cols-2">
          <PointsTable
            caption="Daily jersey points"
            rows={[
              ["Yellow jersey, per day held", c.jerseyDailyPoints.yellow],
              ["Green jersey, per day held", c.jerseyDailyPoints.green],
              ["Polka dot jersey, per day held", c.jerseyDailyPoints.polkaDot],
              ["White jersey, per day held", c.jerseyDailyPoints.white],
            ]}
          />
          <PointsTable
            caption="In-stage event points"
            rows={[
              [
                "Intermediate sprint top 3",
                c.intermediateSprintPoints.join(" / "),
              ],
              ["HC / Cat-1 summit top 3", c.komSummitPoints.join(" / ")],
              ["Combativity award", c.combativityPoints],
              ["Breakaway survivor in the top 10", `+${c.breakawayBonusPoints}`],
            ]}
          />
        </div>
      </RuleSection>

      <RuleSection title="Final classifications (after Stage 21)">
        <div className="grid gap-x-10 sm:grid-cols-2">
          <PointsTable caption="Final general classification points" rows={finalGcRows} />
          <PointsTable
            caption="Final jersey points"
            rows={[
              ["Final green / polka dot, 1st", c.finalGreenPoints[0]],
              ["Final green / polka dot, 2nd", c.finalGreenPoints[1]],
              ["Final green / polka dot, 3rd", c.finalGreenPoints[2]],
              ["Final white jersey", c.finalWhitePoints[0]],
            ]}
          />
        </div>
      </RuleSection>

      <RuleSection title="Leagues & winning">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Everyone is in the global league automatically.</li>
          <li>
            Mini-leagues: create one, share the 6-character code, unlimited members and unlimited
            leagues per player. The Saturday group ride deserves a leaderboard.
          </li>
          <li>
            Weekly podiums: best score in Stages {c.weeks.week1[0]}–{c.weeks.week1[1]},{" "}
            {c.weeks.week2[0]}–{c.weeks.week2[1]}, and {c.weeks.week3[0]}–{c.weeks.week3[1]} each
            get their own leaderboard — a bad first week doesn&apos;t end your Tour.
          </li>
          <li>
            Ties break on highest single-stage score, then earliest team creation. Sign up early.
          </li>
        </ul>
      </RuleSection>

      <RuleSection title="Results & corrections">
        <p>
          Points come from official race results only — never live timing. When the jury relegates
          or disqualifies a rider after the finish, the stage is rescored and every team and league
          updates automatically, including retrospectively. The published tables on this page are
          the rules of record.
        </p>
      </RuleSection>

      <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-white/10 pt-8">
        <Link
          href="/fantasy/build"
          className="rounded-md bg-jersey-yellow px-8 py-4 font-heading text-lg tracking-[0.15em] text-charcoal transition-colors hover:bg-jersey-yellow-deep"
        >
          BUILD YOUR TEAM →
        </Link>
        <Link href="/fantasy/terms" className="text-sm text-off-white/70 underline hover:text-off-white">
          Full game terms
        </Link>
      </div>
    </div>
  );
}

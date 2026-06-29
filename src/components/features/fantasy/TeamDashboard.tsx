"use client";

/**
 * The logged-in team page — where the daily email's "Make your changes"
 * deep link lands. Three jobs, in order of emotional priority:
 *
 *  1. The points reveal (Section 8.3): when a stage publishes, each
 *     rider's points count up, captain doubling shown explicitly
 *     ("32 → C ×2 = 64"). Checking your score should feel like opening
 *     a race result.
 *  2. Transfers + captain before the next deadline, inside the transfer
 *     economy (the rules are enforced server-side; this UI just makes
 *     them legible).
 *  3. Mini-leagues: create, join, share — the growth loop.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { StageStrip, type StageStripStage } from "./StageStrip";
import { DemoBanner } from "./TeamBuilder";

interface SquadRider {
  riderId: number;
  name: string;
  price: number;
  riderClass: "gc" | "sprint" | "climb" | "break";
  status: string;
  proTeamId: number;
}

interface MarketRider {
  id: number;
  name: string;
  price: number;
  riderClass: string;
  status: string;
  proTeamName: string;
  jerseyHex: string | null;
}

interface TeamPayload {
  team: { id: number; name: string };
  player: { id: number; firstName: string; email: string; verified: boolean };
  preTour: boolean;
  openStage: { stageNumber: number; deadline: string } | null;
  squad: SquadRider[];
  captainByStage: Record<string, number>;
  transferBudget: {
    standardRemaining: number;
    bonusesRemaining: number;
    usedThisStage: number;
  } | null;
  chips: {
    enabled: { wildcardEnabled: boolean; tripleCaptainEnabled: boolean; tripleCaptainMultiplier: number };
    played: { chip: "wildcard" | "triple_captain"; stageNumber: number }[];
  };
  totals: {
    totalPoints: number;
    globalRank: number | null;
    previousRank: number | null;
    bestStagePoints: number;
  } | null;
  stageScores: {
    stageNumber: number;
    points: number;
    captainRiderId: number | null;
    breakdown: { perRider?: { riderId: number; basePoints: number; isCaptain: boolean; totalPoints: number }[] };
  }[];
  leagues: { id: number; code: string; name: string; isOfficial: boolean }[];
}

interface BuilderData {
  riders: MarketRider[];
  stages: StageStripStage[];
  demoMode?: boolean;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function useCountUp(target: number, durationMs = 900): number {
  // Reduced-motion users get the final number immediately, no ticker.
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0));
  const started = useRef(false);
  useEffect(() => {
    if (started.current || prefersReducedMotion()) return;
    started.current = true;
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);
  return value;
}

function Deadline({ iso }: { iso: string }) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const update = () => {
      const ms = new Date(iso).getTime() - Date.now();
      if (ms <= 0) {
        setLabel("locked — riders are rolling");
        return;
      }
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      setLabel(
        `${new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} your time (${h}h ${m}m away)`,
      );
    };
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, [iso]);
  return <span className="text-jersey-yellow">{label}</span>;
}

export function TeamDashboard() {
  const [data, setData] = useState<TeamPayload | null>(null);
  const [market, setMarket] = useState<BuilderData | null>(null);
  const [status, setStatus] = useState<"loading" | "unauthed" | "ready">("loading");
  const [transferOut, setTransferOut] = useState<SquadRider | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const reload = useCallback(() => {
    fetch("/api/fantasy/team")
      .then((r) => {
        if (r.status === 401 || r.status === 404) {
          setStatus("unauthed");
          return null;
        }
        return r.json();
      })
      .then((payload) => {
        if (payload) {
          setData(payload);
          setStatus("ready");
        }
      })
      .catch(() => setStatus("unauthed"));
  }, []);

  useEffect(() => {
    reload();
    fetch("/api/fantasy/builder-data")
      .then((r) => r.json())
      .then(setMarket)
      .catch(() => {});
  }, [reload]);

  useWelcomeLeadPixel(data?.player.id);

  const lastScore = useMemo(() => {
    if (!data?.stageScores.length) return null;
    return [...data.stageScores].sort((a, b) => b.stageNumber - a.stageNumber)[0];
  }, [data]);

  const stripStages = useMemo(() => {
    if (!market) return [];
    const pointsByStage = new Map(data?.stageScores.map((s) => [s.stageNumber, s.points]) ?? []);
    return market.stages.map((s) => ({ ...s, points: pointsByStage.get(s.stageNumber) ?? null }));
  }, [market, data]);

  async function setCaptain(riderId: number) {
    const response = await fetch("/api/fantasy/captain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ riderId }),
    });
    const payload = await response.json();
    setNotice(response.ok ? `Captain set for Stage ${payload.stageNumber}.` : payload.error);
    if (response.ok) reload();
  }

  async function makeTransfer(riderInId: number) {
    if (!transferOut) return;
    const response = await fetch("/api/fantasy/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ riderOutId: transferOut.riderId, riderInId }),
    });
    const payload = await response.json();
    setNotice(
      response.ok
        ? payload.kind === "grace"
          ? "Swapped free — that one was on the house."
          : payload.kind === "wildcard"
            ? `Wildcard transfer — free and uncounted, effective Stage ${payload.effectiveFromStage}.`
            : `Transfer made (${payload.kind === "rest_day_bonus" ? "rest-day bonus" : "standard"}), effective Stage ${payload.effectiveFromStage}.`
        : payload.error,
    );
    setTransferOut(null);
    if (response.ok) reload();
  }

  if (status === "loading") {
    return <p className="py-24 text-center text-mid-grey">Fetching your team…</p>;
  }

  if (status === "unauthed" || !data) {
    return <SignInPanel />;
  }

  const openStageNumber = data.openStage?.stageNumber ?? null;
  const captainForOpen = openStageNumber ? data.captainByStage[String(openStageNumber)] : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {market?.demoMode && (
        <div className="mb-6">
          <DemoBanner />
        </div>
      )}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-mid-grey">{data.player.firstName}&apos;s squad</p>
          <h1 className="font-heading text-4xl tracking-wide">{data.team.name.toUpperCase()}</h1>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-xs uppercase tracking-widest text-mid-grey">Total</p>
            <p className="font-heading text-3xl text-jersey-yellow">{data.totals?.totalPoints ?? 0}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-mid-grey">Global</p>
            <p className="font-heading text-3xl">
              {data.totals?.globalRank ? `#${data.totals.globalRank.toLocaleString()}` : "—"}
              <RankArrow rank={data.totals?.globalRank ?? null} previous={data.totals?.previousRank ?? null} />
            </p>
          </div>
        </div>
      </header>

      {!data.player.verified && (
        <p className="mt-4 rounded-md border border-warn/40 bg-warn-tint px-4 py-3 text-sm text-warn">
          Your team isn&apos;t locked in yet — tap the link in your email to verify. No link?
          Check spam, or request a fresh one from the sign-in box on /fantasy.
        </p>
      )}

      {notice && (
        <p
          role="status"
          className="mt-4 rounded-md border border-white/15 bg-white/5 px-4 py-3 text-sm text-off-white"
        >
          {notice}
        </p>
      )}

      {stripStages.length > 0 && (
        <StageStrip className="mt-8" stages={stripStages} todayStageNumber={openStageNumber} />
      )}

      {/* Points reveal for the most recent scored stage */}
      {lastScore && (
        <section aria-label={`Stage ${lastScore.stageNumber} points`} className="mt-8">
          <h2 className="font-heading text-2xl tracking-wide">
            STAGE {lastScore.stageNumber}:{" "}
            <PointsTicker value={lastScore.points} className="text-jersey-yellow" /> PTS
          </h2>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {(lastScore.breakdown.perRider ?? [])
              .slice()
              .sort((a, b) => b.totalPoints - a.totalPoints)
              .map((row) => {
                const rider = data.squad.find((r) => r.riderId === row.riderId);
                const name = rider?.name ?? `Rider ${row.riderId}`;
                return (
                  <li
                    key={row.riderId}
                    className="flex items-center justify-between rounded-md bg-white/[0.04] px-3 py-2 text-sm"
                  >
                    <span className="truncate">{name}</span>
                    <span className="font-heading text-base tabular-nums">
                      {row.isCaptain ? (
                        <span>
                          {row.basePoints} <span className="text-jersey-yellow">→ C ×2 = {row.totalPoints}</span>
                        </span>
                      ) : (
                        <span className={row.totalPoints > 0 ? "text-off-white" : "text-mid-grey"}>
                          {row.totalPoints}
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
          </ul>
        </section>
      )}

      {/* Squad + captain + transfers */}
      <section aria-label="Your squad" className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-heading text-2xl tracking-wide">THE EIGHT</h2>
          {data.openStage && (
            <p className="text-sm text-mid-grey">
              Stage {data.openStage.stageNumber} locks at <Deadline iso={data.openStage.deadline} />
              {data.transferBudget && !data.preTour && (
                <span>
                  {" "}
                  · {data.transferBudget.standardRemaining} transfers
                  {data.transferBudget.bonusesRemaining > 0 &&
                    ` + ${data.transferBudget.bonusesRemaining} bonus`}{" "}
                  left
                </span>
              )}
            </p>
          )}
        </div>
        <ul className="mt-4 divide-y divide-white/5">
          {data.squad.map((rider) => (
            <li key={rider.riderId} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {rider.name}
                  {rider.status === "abandoned" && (
                    <span className="ml-2 rounded bg-bad-tint px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-bad">
                      out of the race
                    </span>
                  )}
                </p>
                <p className="text-xs text-mid-grey">{rider.price} cr · {rider.riderClass.toUpperCase()}</p>
              </div>
              {data.openStage && (
                <button
                  type="button"
                  onClick={() => setCaptain(rider.riderId)}
                  aria-pressed={captainForOpen === rider.riderId}
                  className={`rounded px-2.5 py-1.5 font-heading text-xs tracking-widest transition-colors ${
                    captainForOpen === rider.riderId
                      ? "bg-jersey-yellow text-charcoal"
                      : "bg-white/10 text-off-white/70 hover:bg-white/20"
                  }`}
                >
                  C ×2
                </button>
              )}
              {data.openStage && !data.preTour && (
                <button
                  type="button"
                  onClick={() => setTransferOut(rider)}
                  className="rounded px-2.5 py-1.5 text-xs text-off-white/60 transition-colors hover:bg-white/10 hover:text-off-white"
                >
                  Transfer out
                </button>
              )}
            </li>
          ))}
        </ul>
        {data.preTour && (
          <p className="mt-3 text-sm text-mid-grey">
            Until Stage 1 you can{" "}
            <Link href="/fantasy/build" className="text-jersey-yellow underline">
              rebuild your whole squad
            </Link>{" "}
            free, as often as you like.
          </p>
        )}
      </section>

      {!data.preTour && data.openStage && (
        <ChipsPanel
          chips={data.chips}
          openStageNumber={data.openStage.stageNumber}
          onChanged={(message) => {
            setNotice(message);
            reload();
          }}
        />
      )}

      <ShareCardPanel
        teamName={data.team.name}
        squadNames={data.squad.map((r) => r.name)}
        lastScore={lastScore ? { stageNumber: lastScore.stageNumber, points: lastScore.points } : null}
        globalRank={data.totals?.globalRank ?? null}
      />

      <LeaguesPanel leagues={data.leagues} onChanged={reload} teamName={data.team.name} />

      {transferOut && market && (
        <TransferModal
          out={transferOut}
          market={market.riders}
          squadIds={data.squad.map((r) => r.riderId)}
          onPick={makeTransfer}
          onClose={() => setTransferOut(null)}
        />
      )}
    </div>
  );
}

/**
 * Client half of the Meta CAPI dedup pair (Section 5.1): the server
 * fires a CAPI Lead with event_id `fantasy-signup-{playerId}` on first
 * verification; the verify redirect lands here with ?welcome=1 and we
 * fire the matching browser pixel event with the same eventID so Meta
 * counts the signup once. No-ops when the consent-gated pixel isn't
 * loaded. The param is stripped so a reload can't re-fire.
 */
function useWelcomeLeadPixel(playerId: number | undefined) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current || !playerId) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("welcome") !== "1") return;
    fired.current = true;
    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
    if (typeof fbq === "function") {
      fbq("track", "Lead", { content_name: "fantasy-tour-2026" }, { eventID: `fantasy-signup-${playerId}` });
    }
    url.searchParams.delete("welcome");
    window.history.replaceState(null, "", url.pathname + url.search);
  }, [playerId]);
}

function PointsTicker({ value, className }: { value: number; className?: string }) {
  const shown = useCountUp(value);
  return <span className={`tabular-nums ${className ?? ""}`}>{shown}</span>;
}

function TransferModal({
  out,
  market,
  squadIds,
  onPick,
  onClose,
}: {
  out: SquadRider;
  market: MarketRider[];
  squadIds: number[];
  onPick: (riderInId: number) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const candidates = useMemo(
    () =>
      market
        .filter(
          (r) =>
            !squadIds.includes(r.id) &&
            r.status !== "abandoned" &&
            r.status !== "removed" &&
            r.status !== "dns" &&
            (!search.trim() || r.name.toLowerCase().includes(search.trim().toLowerCase())),
        )
        .sort((a, b) => b.price - a.price),
    [market, squadIds, search],
  );
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Replace ${out.name}`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[80vh] w-full max-w-md flex-col rounded-t-2xl border border-white/10 bg-deep-purple p-5 sm:rounded-2xl">
        <h2 className="font-heading text-2xl tracking-wide">
          OUT: {out.name.toUpperCase()} ({out.price} CR)
        </h2>
        <p className="mt-1 text-sm text-mid-grey">
          Pick his replacement. The new squad must still pass budget and team caps — the server
          will tell you straight if it doesn&apos;t.
        </p>
        <input
          type="search"
          autoFocus
          placeholder="Search riders"
          aria-label="Search replacement riders"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-3 rounded-md border border-white/15 bg-charcoal px-3 py-2 text-off-white placeholder:text-mid-grey"
        />
        <ul className="mt-3 flex-1 divide-y divide-white/5 overflow-y-auto">
          {candidates.map((rider) => (
            <li key={rider.id}>
              <button
                type="button"
                onClick={() => onPick(rider.id)}
                className="flex w-full items-center gap-3 px-1 py-2.5 text-left transition-colors hover:bg-white/5"
              >
                <span
                  aria-hidden="true"
                  className="h-8 w-1 shrink-0 rounded-full"
                  style={{ background: rider.jerseyHex ?? "#4C1273" }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{rider.name}</span>
                  <span className="block truncate text-xs text-mid-grey">{rider.proTeamName}</span>
                </span>
                <span className="font-heading text-lg">{rider.price}</span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 rounded-md bg-white/10 px-5 py-2.5 font-heading tracking-widest text-off-white hover:bg-white/20"
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}

/** Green up / red down vs the previous scored stage (FPL-style). */
export function RankArrow({ rank, previous }: { rank: number | null; previous: number | null }) {
  if (rank == null || previous == null || rank === previous) return null;
  const up = rank < previous;
  const delta = Math.abs(previous - rank);
  return (
    <span
      className={`ml-2 align-middle font-heading text-base ${up ? "text-good" : "text-bad"}`}
      aria-label={`${up ? "Up" : "Down"} ${delta} place${delta === 1 ? "" : "s"} since the last stage`}
      title={`${up ? "Up" : "Down"} ${delta} since the last stage`}
    >
      {up ? "\u25B2" : "\u25BC"}
      {delta.toLocaleString()}
    </span>
  );
}

const CHIP_COPY = {
  wildcard: {
    name: "WILDCARD",
    blurb: "Rebuild your whole squad for one stage — every transfer free and uncounted.",
  },
  triple_captain: {
    name: "TRIPLE CAPTAIN",
    blurb: "Your captain scores \u00d73 instead of \u00d72 for one stage. Save it for the Alpe.",
  },
} as const;

/**
 * Chips (the FPL signature): one Wildcard and one Triple Captain per
 * Tour. Played for the next open stage, cancellable until roll-out
 * (a wildcard with transfers already made is committed).
 */
function ChipsPanel({
  chips,
  openStageNumber,
  onChanged,
}: {
  chips: TeamPayload["chips"];
  openStageNumber: number;
  onChanged: (message: string) => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  async function play(chip: "wildcard" | "triple_captain", method: "POST" | "DELETE") {
    setBusy(chip);
    try {
      const response = await fetch("/api/fantasy/chips", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chip }),
      });
      const payload = await response.json();
      onChanged(
        response.ok
          ? method === "POST"
            ? `${CHIP_COPY[chip].name} played for Stage ${payload.stageNumber}.`
            : `${CHIP_COPY[chip].name} taken back.`
          : payload.error,
      );
    } finally {
      setBusy(null);
    }
  }

  const visible = (["wildcard", "triple_captain"] as const).filter((chip) =>
    chip === "wildcard" ? chips.enabled.wildcardEnabled : chips.enabled.tripleCaptainEnabled,
  );
  if (visible.length === 0) return null;

  return (
    <section aria-label="Chips" className="mt-10">
      <h2 className="font-heading text-2xl tracking-wide">CHIPS</h2>
      <p className="mt-1 text-sm text-mid-grey">One of each for the whole Tour. Choose the moment.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {visible.map((chip) => {
          const played = chips.played.find((c) => c.chip === chip);
          const pending = played?.stageNumber === openStageNumber;
          return (
            <div
              key={chip}
              className={`rounded-xl border p-4 ${
                pending ? "border-jersey-yellow bg-jersey-yellow/10" : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-heading text-xl tracking-wide">{CHIP_COPY[chip].name}</h3>
                {played && (
                  <span className={`text-xs uppercase tracking-wider ${pending ? "text-jersey-yellow" : "text-mid-grey"}`}>
                    {pending ? `Active \u00b7 Stage ${played.stageNumber}` : `Played \u00b7 Stage ${played.stageNumber}`}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-off-white/70">{CHIP_COPY[chip].blurb}</p>
              <div className="mt-3">
                {!played && (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => play(chip, "POST")}
                    className="rounded-md bg-jersey-yellow px-4 py-2 font-heading text-sm tracking-widest text-charcoal hover:bg-jersey-yellow-deep disabled:opacity-60"
                  >
                    {busy === chip ? "PLAYING\u2026" : `PLAY FOR STAGE ${openStageNumber}`}
                  </button>
                )}
                {pending && (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => play(chip, "DELETE")}
                    className="rounded-md bg-white/10 px-4 py-2 font-heading text-sm tracking-widest text-off-white hover:bg-white/20 disabled:opacity-60"
                  >
                    TAKE IT BACK
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Shareable cards (Section 8.4): brand-styled OG images rendered by
 * /api/og/fantasy. Web Share API with the image attached where the
 * platform allows it; clipboard text + link everywhere else.
 */
function ShareCardPanel({
  teamName,
  squadNames,
  lastScore,
  globalRank,
}: {
  teamName: string;
  squadNames: string[];
  lastScore: { stageNumber: number; points: number } | null;
  globalRank: number | null;
}) {
  const [message, setMessage] = useState<string | null>(null);

  function cardUrl(): string {
    const base = `${window.location.origin}/api/og/fantasy`;
    if (lastScore) {
      const params = new URLSearchParams({
        card: "stage",
        team: teamName,
        stage: String(lastScore.stageNumber),
        points: String(lastScore.points),
      });
      if (globalRank) params.set("standing", `global #${globalRank.toLocaleString()}`);
      return `${base}?${params}`;
    }
    const surnames = squadNames.map((n) => n.split(" ").slice(-1)[0]).join("|");
    return `${base}?${new URLSearchParams({ card: "team", team: teamName, riders: surnames })}`;
  }

  async function share() {
    const url = cardUrl();
    const text = lastScore
      ? `Stage ${lastScore.stageNumber}: ${lastScore.points} pts for "${teamName}" in the Roadman Fantasy Tour.`
      : `"${teamName}" is in the Roadman Fantasy Tour.`;
    const gameUrl = `${window.location.origin}/fantasy`;
    try {
      const blob = await fetch(url).then((r) => r.blob());
      const file = new File([blob], "roadman-fantasy.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${text} ${gameUrl}` });
        return;
      }
    } catch {
      // Card fetch or share failed — fall through to the clipboard path.
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${gameUrl}\n${url}`);
      setMessage("Copied — card image link included.");
    } catch {
      window.open(url, "_blank", "noopener");
    }
  }

  return (
    <section aria-label="Share" className="mt-10">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-deep-purple/40 p-4">
        <div>
          <h2 className="font-heading text-xl tracking-wide">
            {lastScore ? `BRAG ABOUT STAGE ${lastScore.stageNumber}` : "SHOW OFF YOUR EIGHT"}
          </h2>
          <p className="text-xs text-mid-grey">A card for the group chat, in full Roadman colours.</p>
        </div>
        <button
          type="button"
          onClick={share}
          className="shrink-0 rounded-md bg-jersey-yellow px-4 py-2.5 font-heading text-sm tracking-widest text-charcoal hover:bg-jersey-yellow-deep"
        >
          SHARE CARD
        </button>
      </div>
      {message && (
        <p role="status" className="mt-2 text-sm text-jersey-yellow">
          {message}
        </p>
      )}
    </section>
  );
}

function LeaguesPanel({
  leagues,
  onChanged,
  teamName,
}: {
  leagues: { id: number; code: string; name: string; isOfficial: boolean }[];
  onChanged: () => void;
  teamName: string;
}) {
  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const response = await fetch("/api/fantasy/leagues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: createName }),
    });
    const payload = await response.json();
    setMessage(response.ok ? `League live — code ${payload.code}. Share it.` : payload.error);
    if (response.ok) {
      setCreateName("");
      onChanged();
    }
  }

  async function join(e: React.FormEvent) {
    e.preventDefault();
    const response = await fetch("/api/fantasy/leagues/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: joinCode }),
    });
    const payload = await response.json();
    setMessage(response.ok ? `You're in "${payload.name}".` : payload.error);
    if (response.ok) {
      setJoinCode("");
      onChanged();
    }
  }

  async function share(code: string, name: string) {
    const url = `${window.location.origin}/fantasy/league/${code}`;
    const text = `"${teamName}" is in. Join my Roadman Fantasy Tour league "${name}" — code ${code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Roadman Fantasy Tour", text, url });
        return;
      } catch {
        // Cancelled — fall through to clipboard.
      }
    }
    await navigator.clipboard.writeText(`${text}\n${url}`);
    setMessage("Invite copied — paste it in the club chat.");
  }

  return (
    <section aria-label="Mini-leagues" className="mt-10">
      <h2 className="font-heading text-2xl tracking-wide">MINI-LEAGUES</h2>
      {message && (
        <p role="status" className="mt-2 text-sm text-jersey-yellow">
          {message}
        </p>
      )}
      <ul className="mt-3 space-y-2">
        {leagues.map((league) => (
          <li
            key={league.id}
            className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5"
          >
            <Link href={`/fantasy/league/${league.code}`} className="min-w-0 flex-1 truncate hover:text-jersey-yellow">
              {league.name}
              {league.isOfficial && (
                <span className="ml-2 rounded bg-jersey-yellow/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-jersey-yellow">
                  official
                </span>
              )}
            </Link>
            <code className="font-heading tracking-[0.2em] text-off-white/70">{league.code}</code>
            <button
              type="button"
              onClick={() => share(league.code, league.name)}
              className="rounded bg-white/10 px-3 py-1.5 text-xs text-off-white hover:bg-white/20"
            >
              Share
            </button>
          </li>
        ))}
        {leagues.length === 0 && (
          <li className="text-sm text-mid-grey">
            No leagues yet. The Saturday group ride deserves a leaderboard.
          </li>
        )}
      </ul>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <form onSubmit={create} className="flex gap-2">
          <input
            required
            maxLength={60}
            placeholder="New league name"
            aria-label="New league name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-white/15 bg-charcoal px-3 py-2 text-sm text-off-white placeholder:text-mid-grey"
          />
          <button
            type="submit"
            className="rounded-md bg-jersey-yellow px-4 py-2 font-heading text-sm tracking-widest text-charcoal hover:bg-jersey-yellow-deep"
          >
            CREATE
          </button>
        </form>
        <form onSubmit={join} className="flex gap-2">
          <input
            required
            maxLength={6}
            placeholder="Join with code"
            aria-label="League code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="min-w-0 flex-1 rounded-md border border-white/15 bg-charcoal px-3 py-2 font-heading text-sm tracking-[0.2em] text-off-white placeholder:font-body placeholder:tracking-normal placeholder:text-mid-grey"
          />
          <button
            type="submit"
            className="rounded-md bg-white/10 px-4 py-2 font-heading text-sm tracking-widest text-off-white hover:bg-white/20"
          >
            JOIN
          </button>
        </form>
      </div>
    </section>
  );
}

function SignInPanel() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function requestLink(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/fantasy/auth/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-heading text-4xl tracking-wide">YOUR TEAM LIVES HERE</h1>
      {sent ? (
        <p className="mt-4 text-off-white/75">
          If that address has a team, a sign-in link is on its way. One tap and you&apos;re back in.
        </p>
      ) : (
        <>
          <p className="mt-4 text-off-white/70">
            Signed up already? Enter your email and we&apos;ll send the one-tap link. No team yet?{" "}
            <Link href="/fantasy/build" className="text-jersey-yellow underline">
              Build one in five minutes.
            </Link>
          </p>
          <form onSubmit={requestLink} className="mt-6 flex gap-2">
            <input
              required
              type="email"
              placeholder="you@example.com"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-white/15 bg-charcoal px-3 py-3 text-off-white placeholder:text-mid-grey"
            />
            <button
              type="submit"
              className="rounded-md bg-jersey-yellow px-5 py-3 font-heading tracking-widest text-charcoal hover:bg-jersey-yellow-deep"
            >
              SEND LINK
            </button>
          </form>
        </>
      )}
    </div>
  );
}

"use client";

/**
 * The team builder — the signature surface (Section 8.1).
 *
 * A road-cycling formation: the 8 picks sit as an echelon (a diagonal
 * paceline, the formation a crosswind forces) rather than a soccer
 * pitch. Fully usable WITHOUT signup — the email gate only fires on
 * "Save your team" (sunk-cost conversion, Section 3). The draft lives
 * in localStorage so a returning visitor finds their half-built squad
 * exactly where they left it.
 *
 * Validation runs the same pure rules module the server enforces, so
 * the feedback is instant and never lies.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { LAUNCH_DEFAULTS, type FantasyGameConfig } from "@/lib/fantasy/config";
import { validateSquad, type SelectableRider } from "@/lib/fantasy/rules";

const DRAFT_KEY = "roadman-fantasy-draft-v1";

interface BuilderRider {
  id: number;
  name: string;
  price: number;
  riderClass: "gc" | "sprint" | "climb" | "break";
  status: string;
  countryCode: string | null;
  proTeamId: number;
  proTeamName: string;
  proTeamCode: string;
  jerseyHex: string | null;
}

interface BuilderData {
  riders: BuilderRider[];
  rules: Pick<
    FantasyGameConfig,
    "budget" | "squadSize" | "maxPerProTeam" | "minCheapRiders" | "captainMultiplier"
  >;
}

const CLASS_LABEL: Record<BuilderRider["riderClass"], string> = {
  gc: "GC",
  sprint: "Sprint",
  climb: "Climb",
  break: "Break",
};

type SortKey = "price-desc" | "price-asc" | "name";

function loadDraft(): { selectedIds: number[]; captainId: number | null } {
  if (typeof window === "undefined") return { selectedIds: [], captainId: null };
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
    if (draft && Array.isArray(draft.selectedIds)) {
      return {
        selectedIds: draft.selectedIds.filter((id: unknown): id is number => typeof id === "number"),
        captainId: typeof draft.captainId === "number" ? draft.captainId : null,
      };
    }
  } catch {
    // Corrupt draft — start fresh.
  }
  return { selectedIds: [], captainId: null };
}

export function TeamBuilder() {
  const [data, setData] = useState<BuilderData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>(() => loadDraft().selectedIds);
  const [captainId, setCaptainId] = useState<number | null>(() => loadDraft().captainId);
  const [classFilter, setClassFilter] = useState<BuilderRider["riderClass"] | null>(null);
  const [teamFilter, setTeamFilter] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("price-desc");
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => {
    fetch("/api/fantasy/builder-data")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((payload: BuilderData) => setData(payload))
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ selectedIds, captainId }));
    } catch {
      // Private browsing — drafts just won't persist.
    }
  }, [selectedIds, captainId]);

  const rules = data?.rules ?? LAUNCH_DEFAULTS;
  const riderById = useMemo(
    () => new Map((data?.riders ?? []).map((r) => [r.id, r])),
    [data],
  );
  const selection = useMemo(
    () => selectedIds.map((id) => riderById.get(id)).filter((r): r is BuilderRider => !!r),
    [selectedIds, riderById],
  );
  const spent = selection.reduce((sum, r) => sum + r.price, 0);
  const remaining = rules.budget - spent;

  const verdict = useMemo(
    () =>
      validateSquad(
        selection.map(
          (r): SelectableRider => ({
            id: r.id,
            price: r.price,
            proTeamId: r.proTeamId,
            status: r.status as SelectableRider["status"],
          }),
        ),
        { ...LAUNCH_DEFAULTS, ...rules } as FantasyGameConfig,
      ),
    [selection, rules],
  );

  const toggleRider = useCallback(
    (riderId: number) => {
      setSelectedIds((current) => {
        if (current.includes(riderId)) {
          if (captainId === riderId) setCaptainId(null);
          return current.filter((id) => id !== riderId);
        }
        if (current.length >= rules.squadSize) return current;
        return [...current, riderId];
      });
    },
    [rules.squadSize, captainId],
  );

  const teams = useMemo(() => {
    const seen = new Map<number, { id: number; name: string; code: string }>();
    for (const r of data?.riders ?? []) {
      if (!seen.has(r.proTeamId)) seen.set(r.proTeamId, { id: r.proTeamId, name: r.proTeamName, code: r.proTeamCode });
    }
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const visibleRiders = useMemo(() => {
    let riders = data?.riders ?? [];
    if (classFilter) riders = riders.filter((r) => r.riderClass === classFilter);
    if (teamFilter) riders = riders.filter((r) => r.proTeamId === teamFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      riders = riders.filter(
        (r) => r.name.toLowerCase().includes(q) || r.proTeamName.toLowerCase().includes(q),
      );
    }
    return [...riders].sort((a, b) => {
      if (sort === "price-desc") return b.price - a.price || a.name.localeCompare(b.name);
      if (sort === "price-asc") return a.price - b.price || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
  }, [data, classFilter, teamFilter, search, sort]);

  if (loadError) {
    return (
      <p className="mx-auto max-w-2xl px-4 py-20 text-center text-off-white/70">
        The game data didn&apos;t load. Refresh to try again — if it keeps happening, the peloton
        broke something and we&apos;re on it.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-8">
      {/* Budget bar — fills coral as you spend. */}
      <div className="sticky top-14 z-30 -mx-4 border-b border-white/10 bg-charcoal/95 px-4 py-3 backdrop-blur">
        <div className="flex items-baseline justify-between">
          <h1 className="font-heading text-2xl tracking-wide">YOUR EIGHT</h1>
          <p className="font-heading text-2xl tabular-nums" aria-live="polite">
            <span className={remaining < 0 ? "text-bad" : "text-coral"}>{spent}</span>
            <span className="text-off-white/40"> / {rules.budget} CR</span>
          </p>
        </div>
        <div
          role="progressbar"
          aria-valuenow={Math.min(spent, rules.budget)}
          aria-valuemin={0}
          aria-valuemax={rules.budget}
          aria-label="Budget spent"
          className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${remaining < 0 ? "bg-bad" : "bg-coral"}`}
            style={{ width: `${Math.min(100, (spent / rules.budget) * 100)}%` }}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mid-grey">
          <span className={selection.length === rules.squadSize ? "text-good" : ""}>
            {selection.length}/{rules.squadSize} riders
          </span>
          <span>max {rules.maxPerProTeam} per trade team</span>
          <span>
            ≥{rules.minCheapRiders.count} rider at ≤{rules.minCheapRiders.maxPrice} cr
          </span>
          {selection.length === rules.squadSize &&
            verdict.errors.map((e) => (
              <span key={e.code} className="text-bad">
                {e.message}
              </span>
            ))}
        </div>
      </div>

      {/* The echelon — 8 slots fanned diagonally like a crosswind paceline. */}
      <section aria-label="Your squad" className="mt-8">
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: rules.squadSize }, (_, i) => {
            const rider = selection[i];
            return (
              <li
                key={i}
                className="sm:motion-safe:transition-transform"
                style={{ ["--echelon" as string]: `${(i % 4) * 14}px` }}
              >
                <div className="sm:translate-y-[var(--echelon)]">
                  {rider ? (
                    <div
                      className="relative overflow-hidden rounded-lg border border-white/15 bg-deep-purple/50 p-3 motion-safe:animate-[fadeIn_0.2s_ease-out]"
                      style={{ borderTopColor: rider.jerseyHex ?? "#4C1273", borderTopWidth: 3 }}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-heading text-base leading-tight tracking-wide">
                          {rider.name.toUpperCase()}
                        </p>
                        <span className="font-heading text-lg leading-none text-coral">{rider.price}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-off-white/60">
                        {rider.proTeamCode} · {CLASS_LABEL[rider.riderClass]}
                        {rider.status === "provisional" && (
                          <span className="text-warn" title="Squad not yet confirmed by the team">
                            {" "}
                            · prov.
                          </span>
                        )}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setCaptainId(captainId === rider.id ? null : rider.id)}
                          aria-pressed={captainId === rider.id}
                          className={`rounded px-2 py-1 font-heading text-xs tracking-widest transition-colors ${
                            captainId === rider.id
                              ? "bg-coral text-charcoal"
                              : "bg-white/10 text-off-white/70 hover:bg-white/20"
                          }`}
                        >
                          C ×{rules.captainMultiplier}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleRider(rider.id)}
                          aria-label={`Remove ${rider.name}`}
                          className="rounded px-2 py-1 text-xs text-off-white/50 transition-colors hover:bg-bad-tint hover:text-bad"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-[104px] items-center justify-center rounded-lg border border-dashed border-white/20 text-mid-grey motion-safe:animate-pulse">
                      <span className="font-heading text-sm tracking-widest">SLOT {i + 1}</span>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-xs text-mid-grey sm:mt-16">
          Tap <span className="font-heading text-coral">C ×2</span> on the rider you want
          captaining Stage 1 — he scores double, and you can change him before every stage.
        </p>
      </section>

      {/* Rider market */}
      <section aria-label="Pick riders" className="mt-10">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1" role="group" aria-label="Filter by rider class">
            {(["gc", "sprint", "climb", "break"] as const).map((cls) => (
              <button
                key={cls}
                type="button"
                aria-pressed={classFilter === cls}
                onClick={() => setClassFilter(classFilter === cls ? null : cls)}
                className={`rounded-full px-3 py-1.5 font-heading text-sm tracking-widest transition-colors ${
                  classFilter === cls
                    ? "bg-coral text-charcoal"
                    : "bg-white/10 text-off-white/70 hover:bg-white/20"
                }`}
              >
                {CLASS_LABEL[cls].toUpperCase()}
              </button>
            ))}
          </div>
          <select
            aria-label="Filter by trade team"
            value={teamFilter ?? ""}
            onChange={(e) => setTeamFilter(e.target.value ? Number(e.target.value) : null)}
            className="rounded-md border border-white/15 bg-charcoal px-3 py-1.5 text-sm text-off-white"
          >
            <option value="">All teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Sort riders"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-md border border-white/15 bg-charcoal px-3 py-1.5 text-sm text-off-white"
          >
            <option value="price-desc">Price: high to low</option>
            <option value="price-asc">Price: low to high</option>
            <option value="name">Name A–Z</option>
          </select>
          <input
            type="search"
            placeholder="Search rider or team"
            aria-label="Search riders"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-40 flex-1 rounded-md border border-white/15 bg-charcoal px-3 py-1.5 text-sm text-off-white placeholder:text-mid-grey"
          />
        </div>

        {!data ? (
          <p className="py-16 text-center text-mid-grey">Loading the peloton…</p>
        ) : data.riders.length === 0 ? (
          <div className="mt-8 rounded-xl border border-white/10 bg-deep-purple/40 p-8 text-center">
            <h2 className="font-heading text-2xl tracking-wide">THE STARTLIST IS LANDING</h2>
            <p className="mx-auto mt-3 max-w-md text-off-white/70">
              Teams name their eight in the days before the 1 July presentation in Barcelona.
              The provisional startlist drops here the moment it&apos;s verified — every rider,
              every price.
            </p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-white/5">
            {visibleRiders.map((rider) => {
              const picked = selectedIds.includes(rider.id);
              const squadFull = selection.length >= rules.squadSize;
              const unavailable = rider.status === "removed" || rider.status === "dns" || rider.status === "abandoned";
              return (
                <li key={rider.id} className="flex items-center gap-3 py-2.5">
                  <span
                    aria-hidden="true"
                    className="h-9 w-1 shrink-0 rounded-full"
                    style={{ background: rider.jerseyHex ?? "#4C1273" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-off-white">
                      {rider.name}
                      {rider.status === "provisional" && (
                        <span className="ml-2 rounded bg-warn-tint px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-warn">
                          provisional
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-mid-grey">
                      {rider.proTeamName} · {CLASS_LABEL[rider.riderClass]}
                    </p>
                  </div>
                  <span className="font-heading text-xl tabular-nums text-off-white/90">{rider.price}</span>
                  <button
                    type="button"
                    onClick={() => toggleRider(rider.id)}
                    disabled={unavailable || (!picked && (squadFull || rider.price > remaining))}
                    aria-label={picked ? `Remove ${rider.name}` : `Add ${rider.name}`}
                    className={`w-20 rounded-md px-3 py-2 font-heading text-sm tracking-widest transition-all motion-safe:active:scale-95 ${
                      picked
                        ? "bg-white/15 text-off-white hover:bg-bad-tint hover:text-bad"
                        : "bg-coral text-charcoal hover:bg-coral-hover disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-mid-grey"
                    }`}
                  >
                    {picked ? "IN ✓" : "ADD"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Save bar — thumb reach, always visible. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-charcoal/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="text-sm text-mid-grey">
            {verdict.valid && selection.length === rules.squadSize
              ? "Squad legal. Lock it in."
              : `${selection.length}/${rules.squadSize} picked · ${remaining} cr left`}
          </p>
          <button
            type="button"
            onClick={() => setGateOpen(true)}
            disabled={!verdict.valid || selection.length !== rules.squadSize}
            className="rounded-md bg-coral px-6 py-3 font-heading text-base tracking-[0.15em] text-charcoal transition-colors hover:bg-coral-hover disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-mid-grey"
          >
            SAVE YOUR TEAM →
          </button>
        </div>
      </div>

      {gateOpen && (
        <EmailGate
          riderIds={selectedIds}
          captainRiderId={captainId}
          onClose={() => setGateOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * The email gate (Section 5.1) — fires only after the squad is built.
 * Email + first name + country + explicit consent; the magic link is
 * the double opt-in.
 */
function EmailGate({
  riderIds,
  captainRiderId,
  onClose,
}: {
  riderIds: number[];
  captainRiderId: number | null;
  onClose: () => void;
}) {
  const [teamName, setTeamName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [persona, setPersona] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"form" | "sending" | "sent" | "error">("form");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError(null);
    try {
      const response = await fetch("/api/fantasy/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          country: country || null,
          riderPersona: persona || null,
          consent,
          teamName,
          riderIds,
          captainRiderId,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "That didn't save. Try again.");
        setState("form");
        return;
      }
      setState("sent");
    } catch {
      setError("Network dropped — like a bad feed zone. Try again.");
      setState("form");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Save your team"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-t-2xl border border-white/10 bg-deep-purple p-6 sm:rounded-2xl">
        {state === "sent" ? (
          <div className="text-center">
            <h2 className="font-heading text-3xl tracking-wide">CHECK YOUR INBOX</h2>
            <p className="mt-3 text-off-white/75">
              One tap on the link locks your team in. The link works once and lasts 24 hours —
              after that, free edits until Stage 1 rolls out of Barcelona.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-md bg-white/10 px-6 py-3 font-heading tracking-widest text-off-white hover:bg-white/20"
            >
              BACK TO MY TEAM
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h2 className="font-heading text-3xl tracking-wide">SAVE YOUR TEAM</h2>
            <p className="mt-2 text-sm text-off-white/60">
              Free to play. Your email is the login — no password, ever.
            </p>
            <div className="mt-4 space-y-3">
              <input
                required
                maxLength={60}
                placeholder="Team name (make it sting)"
                aria-label="Team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full rounded-md border border-white/15 bg-charcoal px-3 py-2.5 text-off-white placeholder:text-mid-grey"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  maxLength={60}
                  placeholder="First name"
                  aria-label="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-md border border-white/15 bg-charcoal px-3 py-2.5 text-off-white placeholder:text-mid-grey"
                />
                <input
                  maxLength={60}
                  placeholder="Country"
                  aria-label="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-md border border-white/15 bg-charcoal px-3 py-2.5 text-off-white placeholder:text-mid-grey"
                />
              </div>
              <input
                required
                type="email"
                placeholder="you@example.com"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-white/15 bg-charcoal px-3 py-2.5 text-off-white placeholder:text-mid-grey"
              />
              <select
                aria-label="What kind of rider are you?"
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                className="w-full rounded-md border border-white/15 bg-charcoal px-3 py-2.5 text-sm text-off-white"
              >
                <option value="">What kind of rider are you? (optional)</option>
                <option value="time-crunched">Time-crunched and fighting for form</option>
                <option value="event-chaser">Training for a big event</option>
                <option value="racer">Racing — results matter</option>
                <option value="long-game">In it for the long game</option>
              </select>
              <label className="flex items-start gap-2 text-sm text-off-white/75">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 accent-[#F16363]"
                />
                <span>
                  Send me the daily Tour stage email and Roadman updates. Unsubscribe any time.
                </span>
              </label>
            </div>
            {error && (
              <p role="alert" className="mt-3 text-sm text-bad">
                {error}
              </p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-white/10 px-5 py-3 font-heading tracking-widest text-off-white hover:bg-white/20"
              >
                NOT YET
              </button>
              <button
                type="submit"
                disabled={state === "sending"}
                className="flex-1 rounded-md bg-coral px-5 py-3 font-heading tracking-[0.15em] text-charcoal hover:bg-coral-hover disabled:opacity-60"
              >
                {state === "sending" ? "SENDING…" : "SEND MY MAGIC LINK"}
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-mid-grey">16+ · GDPR-compliant · free forever</p>
          </form>
        )}
      </div>
    </div>
  );
}

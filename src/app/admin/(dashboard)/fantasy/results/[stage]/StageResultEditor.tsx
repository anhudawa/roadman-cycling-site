"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ScoringEvent, StageResultData } from "@/lib/fantasy/scoring";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Num,
  Select,
} from "@/components/admin/ui";

export interface EditorRider {
  id: number;
  name: string;
  status: string;
  abandonedAfterStage: number | null;
  proTeamCode: string;
}

export interface EditorProTeam {
  id: number;
  name: string;
}

const FINISHER_SLOTS = 20;
const ABANDON_REASONS = ["DNS", "DNF", "HD", "DSQ"] as const;
const JERSEY_LABELS = [
  ["yellow", "Yellow (GC)"],
  ["green", "Green (points)"],
  ["polkaDot", "Polka dot (KOM)"],
  ["white", "White (young rider)"],
] as const;

interface SprintGroup {
  name: string;
  top3: [string, string, string];
}

interface AbandonRow {
  riderId: string;
  reason: string;
}

function emptyGroup(): SprintGroup {
  return { name: "", top3: ["", "", ""] };
}

/** Hoisted so re-renders don't remount the select (and drop focus). */
function RiderSelect({
  riders,
  value,
  onChange,
  label,
}: {
  riders: EditorRider[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <Select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">—</option>
      {riders.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name} ({r.proTeamCode})
        </option>
      ))}
    </Select>
  );
}

/** Position-indexed slots ("" = empty) from a list of explicit positions. */
function slotsFromFinishers(
  finishers: { position: number; riderId: number }[] | undefined,
  count: number,
): string[] {
  const slots = Array.from({ length: count }, () => "");
  for (const f of finishers ?? []) {
    if (f.position >= 1 && f.position <= count) slots[f.position - 1] = String(f.riderId);
  }
  return slots;
}

function slotsFromIds(ids: number[] | undefined, count: number): string[] {
  const slots = Array.from({ length: count }, () => "");
  (ids ?? []).forEach((id, i) => {
    if (i < count) slots[i] = String(id);
  });
  return slots;
}

export function StageResultEditor({
  stageNumber,
  stageType,
  riders,
  proTeams,
  initialPayload,
  initialSourceUrl,
  initialStatus,
  initialVersion,
}: {
  stageNumber: number;
  stageType: "ttt" | "itt" | "flat" | "hilly" | "mountain";
  riders: EditorRider[];
  proTeams: EditorProTeam[];
  initialPayload: StageResultData | null;
  initialSourceUrl: string;
  initialStatus: "draft" | "previewed" | "published" | null;
  initialVersion: number | null;
}) {
  const router = useRouter();
  const isTtt = stageType === "ttt";
  const isFinalStage = stageNumber === 21;

  const [finishers, setFinishers] = useState<string[]>(() =>
    slotsFromFinishers(initialPayload?.finishers, FINISHER_SLOTS),
  );
  const [tttTeams, setTttTeams] = useState<string[]>(() => {
    const slots = Array.from({ length: proTeams.length }, () => "");
    for (const t of initialPayload?.tttTeams ?? []) {
      if (t.position >= 1 && t.position <= proTeams.length) {
        slots[t.position - 1] = String(t.proTeamId);
      }
    }
    return slots;
  });
  const [jerseys, setJerseys] = useState<Record<string, string>>(() => ({
    yellow: initialPayload?.jerseys?.yellow ? String(initialPayload.jerseys.yellow) : "",
    green: initialPayload?.jerseys?.green ? String(initialPayload.jerseys.green) : "",
    polkaDot: initialPayload?.jerseys?.polkaDot ? String(initialPayload.jerseys.polkaDot) : "",
    white: initialPayload?.jerseys?.white ? String(initialPayload.jerseys.white) : "",
  }));
  const [sprints, setSprints] = useState<SprintGroup[]>(() =>
    (initialPayload?.intermediateSprints ?? []).map((s) => ({
      name: s.name ?? "",
      top3: [
        s.top3[0] ? String(s.top3[0]) : "",
        s.top3[1] ? String(s.top3[1]) : "",
        s.top3[2] ? String(s.top3[2]) : "",
      ],
    })),
  );
  const [koms, setKoms] = useState<SprintGroup[]>(() =>
    (initialPayload?.komSummits ?? []).map((s) => ({
      name: s.name ?? "",
      top3: [
        s.top3[0] ? String(s.top3[0]) : "",
        s.top3[1] ? String(s.top3[1]) : "",
        s.top3[2] ? String(s.top3[2]) : "",
      ],
    })),
  );
  const [combativity, setCombativity] = useState(
    initialPayload?.combativityRiderId ? String(initialPayload.combativityRiderId) : "",
  );
  const [breakaway, setBreakaway] = useState<string[]>(() =>
    (initialPayload?.breakawayBonusRiderIds ?? []).map(String),
  );
  const [abandons, setAbandons] = useState<AbandonRow[]>(() =>
    (initialPayload?.abandons ?? []).map((a) => ({
      riderId: String(a.riderId),
      reason: a.reason,
    })),
  );
  const [finalGc, setFinalGc] = useState<string[]>(() =>
    slotsFromIds(initialPayload?.final?.gc, 20),
  );
  const [finalGreen, setFinalGreen] = useState<string[]>(() =>
    slotsFromIds(initialPayload?.final?.green, 3),
  );
  const [finalPolkaDot, setFinalPolkaDot] = useState<string[]>(() =>
    slotsFromIds(initialPayload?.final?.polkaDot, 3),
  );
  const [finalWhite, setFinalWhite] = useState<string[]>(() =>
    slotsFromIds(initialPayload?.final?.white, 1),
  );
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl);

  const [status, setStatus] = useState(initialStatus);
  const [version, setVersion] = useState(initialVersion);
  const [busy, setBusy] = useState<"save" | "preview" | "publish" | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [preview, setPreview] = useState<ScoringEvent[] | null>(null);
  const [publishSummary, setPublishSummary] = useState<{
    events: number;
    teams: number;
  } | null>(null);

  const riderName = new Map(riders.map((r) => [r.id, `${r.name} (${r.proTeamCode})`]));

  function setSlot(setter: (fn: (prev: string[]) => string[]) => void, index: number, value: string) {
    setter((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  /** Ordered lists must be filled from the top with no gaps. */
  function takePrefix(slots: string[], label: string, problems: string[]): number[] {
    const firstEmpty = slots.findIndex((v) => v === "");
    const end = firstEmpty === -1 ? slots.length : firstEmpty;
    if (slots.slice(end).some((v) => v !== "")) {
      problems.push(`${label}: fill positions from the top without gaps`);
    }
    return slots.slice(0, end).map(Number);
  }

  function buildPayload(): { payload: Record<string, unknown> } | { problems: string[] } {
    const problems: string[] = [];
    const payload: Record<string, unknown> = { stageNumber };

    const finisherRows = finishers
      .map((riderId, idx) => ({ position: idx + 1, riderId }))
      .filter((row) => row.riderId !== "")
      .map((row) => ({ position: row.position, riderId: Number(row.riderId) }));
    const finisherIds = finisherRows.map((r) => r.riderId);
    if (new Set(finisherIds).size !== finisherIds.length) {
      problems.push("The same rider appears in more than one finish position");
    }
    if (finisherRows.length > 0) payload.finishers = finisherRows;

    if (isTtt) {
      const teamRows = tttTeams
        .map((proTeamId, idx) => ({ position: idx + 1, proTeamId }))
        .filter((row) => row.proTeamId !== "")
        .map((row) => ({ position: row.position, proTeamId: Number(row.proTeamId) }));
      const teamIds = teamRows.map((r) => r.proTeamId);
      if (new Set(teamIds).size !== teamIds.length) {
        problems.push("The same team appears in more than one TTT position");
      }
      if (teamRows.length > 0) payload.tttTeams = teamRows;
    }

    const jerseyEntries = Object.entries(jerseys).filter(([, v]) => v !== "");
    if (jerseyEntries.length > 0) {
      payload.jerseys = Object.fromEntries(jerseyEntries.map(([k, v]) => [k, Number(v)]));
    }

    const buildGroups = (groups: SprintGroup[], label: string) =>
      groups
        .map((g, i) => ({
          name: g.name.trim() || undefined,
          top3: takePrefix(g.top3, `${label} ${i + 1}`, problems),
        }))
        .filter((g) => g.top3.length > 0);
    const sprintGroups = buildGroups(sprints, "Sprint");
    if (sprintGroups.length > 0) payload.intermediateSprints = sprintGroups;
    const komGroups = buildGroups(koms, "KOM");
    if (komGroups.length > 0) payload.komSummits = komGroups;

    if (combativity !== "") payload.combativityRiderId = Number(combativity);

    const breakawayIds = breakaway.filter((v) => v !== "").map(Number);
    if (breakawayIds.length > 0) payload.breakawayBonusRiderIds = breakawayIds;

    const abandonRows = abandons
      .filter((a) => a.riderId !== "")
      .map((a) => ({ riderId: Number(a.riderId), reason: a.reason }));
    if (abandonRows.length > 0) payload.abandons = abandonRows;

    if (isFinalStage) {
      const final = {
        gc: takePrefix(finalGc, "Final GC", problems),
        green: takePrefix(finalGreen, "Final green", problems),
        polkaDot: takePrefix(finalPolkaDot, "Final polka dot", problems),
        white: takePrefix(finalWhite, "Final white", problems),
      };
      if (Object.values(final).some((list) => list.length > 0)) payload.final = final;
    }

    if (problems.length > 0) return { problems };
    return { payload };
  }

  async function saveDraft(): Promise<boolean> {
    setErrors([]);
    setNotice(null);
    setPublishSummary(null);
    const built = buildPayload();
    if ("problems" in built) {
      setErrors(built.problems);
      return false;
    }
    const res = await fetch(`/api/admin/fantasy/results/${stageNumber}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: built.payload, sourceUrl: sourceUrl.trim() }),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      setErrors(
        Array.isArray(data.errors)
          ? data.errors.map(String)
          : [typeof data.error === "string" ? data.error : "Save failed"],
      );
      return false;
    }
    setStatus("draft");
    setVersion(typeof data.version === "number" ? data.version : version);
    setPreview(null);
    return true;
  }

  async function handleSave() {
    setBusy("save");
    try {
      if (await saveDraft()) setNotice("Draft saved.");
    } finally {
      setBusy(null);
    }
  }

  async function handlePreview() {
    setBusy("preview");
    try {
      // Preview always scores what's on screen, so save the draft first.
      if (!(await saveDraft())) return;
      const res = await fetch("/api/admin/fantasy/results/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageNumber }),
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        setErrors([typeof data.error === "string" ? data.error : "Preview failed"]);
        return;
      }
      setPreview((data.events as ScoringEvent[]) ?? []);
      setStatus("previewed");
      setNotice(null);
    } finally {
      setBusy(null);
    }
  }

  async function handlePublish() {
    if (
      !window.confirm(
        `Publish stage ${stageNumber} scores? This wipes and rewrites the stage's scoring events, recomputes every team, and rebuilds the leaderboard.`,
      )
    ) {
      return;
    }
    setBusy("publish");
    setErrors([]);
    try {
      const res = await fetch("/api/admin/fantasy/results/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageNumber }),
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        setErrors([typeof data.error === "string" ? data.error : "Publish failed"]);
        return;
      }
      setStatus("published");
      setPublishSummary({
        events: Number(data.events ?? 0),
        teams: Number(data.teams ?? 0),
      });
      setNotice(null);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  const previewByRider = preview
    ? [...preview
        .reduce((map, event) => {
          const list = map.get(event.riderId) ?? [];
          list.push(event);
          map.set(event.riderId, list);
          return map;
        }, new Map<number, ScoringEvent[]>())
        .entries()]
        .map(([riderId, events]) => ({
          riderId,
          events,
          total: events.reduce((sum, e) => sum + e.points, 0),
        }))
        .sort((a, b) => b.total - a.total)
    : null;

  return (
    <div className="space-y-6">
      {errors.length > 0 && (
        <div className="rounded-[var(--radius-admin-md)] border border-[var(--color-bad)]/30 bg-[var(--color-bad-tint)] px-4 py-3 text-sm text-[var(--color-bad)]">
          {errors.map((e, i) => (
            <p key={i}>{e}</p>
          ))}
        </div>
      )}
      {notice && (
        <div className="rounded-[var(--radius-admin-md)] border border-[var(--color-good)]/30 bg-[var(--color-good-tint)] px-4 py-3 text-sm text-[var(--color-good)]">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Finishers */}
        <Card>
          <CardHeader
            title="Top-20 finishers"
            subtitle={
              isTtt
                ? "Individual positions at the line — used when ASO publishes individual TTT times"
                : "Official stage classification, 1st through 20th"
            }
          />
          <CardBody compact className="pt-0 space-y-2">
            {finishers.map((value, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-8 text-right text-sm text-foreground-subtle font-mono tabular-nums">
                  {idx + 1}.
                </span>
                <RiderSelect
                riders={riders}
                  label={`Finisher position ${idx + 1}`}
                  value={value}
                  onChange={(v) => setSlot(setFinishers, idx, v)}
                />
              </div>
            ))}
          </CardBody>
        </Card>

        <div className="space-y-6">
          {/* TTT team order */}
          {isTtt && (
            <Card>
              <CardHeader
                title="TTT team order"
                subtitle="Fallback when individual times aren't published (config key tttIndividualTimes = false)"
              />
              <CardBody compact className="pt-0 space-y-2">
                {tttTeams.map((value, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-8 text-right text-sm text-foreground-subtle font-mono tabular-nums">
                      {idx + 1}.
                    </span>
                    <Select
                      aria-label={`TTT team position ${idx + 1}`}
                      value={value}
                      onChange={(e) => setSlot(setTttTeams, idx, e.target.value)}
                    >
                      <option value="">—</option>
                      {proTeams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {/* Jerseys */}
          <Card>
            <CardHeader title="Jersey holders" subtitle="After the stage" />
            <CardBody compact className="pt-0 space-y-2">
              {JERSEY_LABELS.map(([key, label]) => (
                <div key={key} className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <span className="text-sm text-foreground-muted">{label}</span>
                  <RiderSelect
                riders={riders}
                    label={label}
                    value={jerseys[key]}
                    onChange={(v) => setJerseys((prev) => ({ ...prev, [key]: v }))}
                  />
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Combativity + breakaway */}
          <Card>
            <CardHeader title="Combativity & breakaway" />
            <CardBody compact className="pt-0 space-y-3">
              <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                <span className="text-sm text-foreground-muted">Combativity</span>
                <RiderSelect riders={riders} label="Combativity" value={combativity} onChange={setCombativity} />
              </div>
              <div>
                <p className="text-sm text-foreground-muted mb-2">
                  Breakaway bonus (top-10 finishers from the break that stayed away)
                </p>
                <div className="space-y-2">
                  {breakaway.map((value, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <RiderSelect
                riders={riders}
                        label={`Breakaway rider ${idx + 1}`}
                        value={value}
                        onChange={(v) => setSlot(setBreakaway, idx, v)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBreakaway((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBreakaway((prev) => [...prev, ""])}
                  >
                    Add rider
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Abandons */}
          <Card>
            <CardHeader
              title="Abandons"
              subtitle="Riders leaving the race on this stage — they keep today's points, score nothing after"
            />
            <CardBody compact className="pt-0 space-y-2">
              {abandons.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <RiderSelect
                riders={riders}
                    label={`Abandon ${idx + 1}`}
                    value={row.riderId}
                    onChange={(v) =>
                      setAbandons((prev) =>
                        prev.map((r, i) => (i === idx ? { ...r, riderId: v } : r)),
                      )
                    }
                  />
                  <Select
                    aria-label={`Abandon ${idx + 1} reason`}
                    value={row.reason}
                    onChange={(e) =>
                      setAbandons((prev) =>
                        prev.map((r, i) => (i === idx ? { ...r, reason: e.target.value } : r)),
                      )
                    }
                    className="w-24"
                  >
                    {ABANDON_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAbandons((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAbandons((prev) => [...prev, { riderId: "", reason: "DNF" }])}
              >
                Add abandon
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Sprints and KOMs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(
          [
            ["Intermediate sprints", sprints, setSprints],
            ["KOM summits (HC/Cat-1)", koms, setKoms],
          ] as const
        ).map(([title, groups, setGroups]) => (
          <Card key={title}>
            <CardHeader title={title} subtitle="Top 3 in order" />
            <CardBody compact className="pt-0 space-y-4">
              {groups.map((group, gIdx) => (
                <div
                  key={gIdx}
                  className="rounded-[var(--radius-admin-md)] border border-[var(--color-border)] p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      aria-label={`${title} ${gIdx + 1} name`}
                      value={group.name}
                      onChange={(e) =>
                        setGroups((prev) =>
                          prev.map((g, i) => (i === gIdx ? { ...g, name: e.target.value } : g)),
                        )
                      }
                      placeholder="Name (e.g. Col du Tourmalet)"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setGroups((prev) => prev.filter((_, i) => i !== gIdx))}
                    >
                      Remove
                    </Button>
                  </div>
                  {group.top3.map((value, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-8 text-right text-sm text-foreground-subtle font-mono tabular-nums">
                        {idx + 1}.
                      </span>
                      <RiderSelect
                riders={riders}
                        label={`${title} ${gIdx + 1} position ${idx + 1}`}
                        value={value}
                        onChange={(v) =>
                          setGroups((prev) =>
                            prev.map((g, i) =>
                              i === gIdx
                                ? {
                                    ...g,
                                    top3: g.top3.map((t, j) => (j === idx ? v : t)) as [
                                      string,
                                      string,
                                      string,
                                    ],
                                  }
                                : g,
                            ),
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGroups((prev) => [...prev, emptyGroup()])}
              >
                Add group
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Final classifications — stage 21 only */}
      {isFinalStage && (
        <Card>
          <CardHeader
            title="Final classifications"
            subtitle="Paris only — final GC top 20, green/polka dot top 3, white winner"
          />
          <CardBody compact className="pt-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-foreground-muted">Final GC</p>
              {finalGc.map((value, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-8 text-right text-sm text-foreground-subtle font-mono tabular-nums">
                    {idx + 1}.
                  </span>
                  <RiderSelect
                riders={riders}
                    label={`Final GC ${idx + 1}`}
                    value={value}
                    onChange={(v) => setSlot(setFinalGc, idx, v)}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {(
                [
                  ["Final green", finalGreen, setFinalGreen],
                  ["Final polka dot", finalPolkaDot, setFinalPolkaDot],
                  ["Final white", finalWhite, setFinalWhite],
                ] as const
              ).map(([label, slots, setSlots]) => (
                <div key={label} className="space-y-2">
                  <p className="text-sm text-foreground-muted">{label}</p>
                  {slots.map((value, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-8 text-right text-sm text-foreground-subtle font-mono tabular-nums">
                        {idx + 1}.
                      </span>
                      <RiderSelect
                riders={riders}
                        label={`${label} ${idx + 1}`}
                        value={value}
                        onChange={(v) => setSlot(setSlots, idx, v)}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Source + actions */}
      <Card>
        <CardBody compact className="space-y-4">
          <div className="max-w-xl">
            <label htmlFor="result-source" className="block text-xs text-foreground-muted mb-1.5">
              Source URL (official results page)
            </label>
            <Input
              id="result-source"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={handleSave} loading={busy === "save"}>
              Save draft
            </Button>
            <Button variant="secondary" onClick={handlePreview} loading={busy === "preview"}>
              Preview scores
            </Button>
            <Button
              variant="primary"
              onClick={handlePublish}
              loading={busy === "publish"}
              disabled={status === null}
            >
              Publish
            </Button>
            <span className="text-sm text-foreground-subtle">
              {status ? `Current: ${status} · v${version}` : "Not saved yet"}
            </span>
          </div>
        </CardBody>
      </Card>

      {publishSummary && (
        <div className="rounded-[var(--radius-admin-md)] border border-[var(--color-good)]/30 bg-[var(--color-good-tint)] px-4 py-3 text-sm text-[var(--color-good)]">
          Published: {publishSummary.events} scoring events written, {publishSummary.teams}{" "}
          team scores recomputed, leaderboard rebuilt.
        </div>
      )}

      {/* Preview */}
      {previewByRider && (
        <Card>
          <CardHeader
            title="Score preview"
            subtitle="Computed events grouped by rider — eyeball these against the official result before publishing"
          />
          {previewByRider.length === 0 ? (
            <CardBody compact className="pt-0">
              <p className="text-sm text-foreground-subtle">
                No scoring events — the payload is empty or every rider is inactive.
              </p>
            </CardBody>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left px-6 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                      Rider
                    </th>
                    <th className="text-left px-6 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                      Events (rule · points · source)
                    </th>
                    <th className="text-right px-6 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {previewByRider.map((row) => (
                    <tr
                      key={row.riderId}
                      className="border-b border-[var(--color-border)] last:border-b-0 align-top"
                    >
                      <td className="px-6 py-2.5 text-sm text-off-white whitespace-nowrap">
                        {riderName.get(row.riderId) ?? `Rider #${row.riderId}`}
                      </td>
                      <td className="px-6 py-2.5 text-sm text-foreground-muted">
                        {row.events.map((event, i) => (
                          <span key={i} className="block">
                            {event.rule} · <Num>{event.points}</Num> · {event.sourceRef}
                          </span>
                        ))}
                      </td>
                      <td className="px-6 py-2.5 text-right">
                        <Num className="text-sm text-off-white">{row.total}</Num>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

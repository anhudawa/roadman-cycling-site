"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  APPLICATION_STAGES,
  STAGE_COLORS,
  STAGE_LABELS,
  type ApplicationStage,
} from "@/lib/crm/pipeline";

export interface KanbanApplication {
  id: number;
  name: string;
  email: string;
  goal: string;
  hours: string;
  ftp: string | null;
  frustration: string;
  cohort: string;
  persona: string | null;
  status: string;
  readAt: string | null;
  createdAt: string;
  contactId: number | null;
  owner?: string | null;
}

const OWNER_OPTIONS: { value: string | null; label: string }[] = [
  { value: null, label: "Unassigned" },
  { value: "sarah", label: "Sarah" },
  { value: "wes", label: "Wes" },
  { value: "matthew", label: "Matthew" },
  { value: "ted", label: "Ted" },
];

export type StageMap = Record<ApplicationStage, KanbanApplication[]>;

interface Props {
  initialStages: StageMap;
  cohorts: string[];
  initialCohort: string;
}

const PERSONA_COLORS: Record<string, string> = {
  plateau: "bg-red-500/10 text-red-400 border-red-500/20",
  "event-prep": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  comeback: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  listener: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function truncate(s: string, n: number): string {
  if (!s) return "";
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "$€¦";
}

export function PipelineBoard({ initialStages, cohorts, initialCohort }: Props) {
  const router = useRouter();
  const [stages, setStages] = useState<StageMap>(initialStages);
  const [cohort, setCohort] = useState(initialCohort);
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragFrom, setDragFrom] = useState<ApplicationStage | null>(null);
  const [hoverStage, setHoverStage] = useState<ApplicationStage | null>(null);
  const [detail, setDetail] = useState<KanbanApplication | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingCohort, setLoadingCohort] = useState(false);
  const [ownerMenuFor, setOwnerMenuFor] = useState<number | null>(null);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (ownerMenuFor === null) return;
    const close = () => setOwnerMenuFor(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [ownerMenuFor]);

  async function assignOwner(
    app: KanbanApplication,
    nextOwner: string | null
  ) {
    if (!app.contactId) {
      setError("No contact linked to this application");
      window.setTimeout(() => setError(null), 4000);
      return;
    }
    setAssigningId(app.id);
    setOwnerMenuFor(null);
    const prev = stages;
    setStages((s) => {
      const next: StageMap = { ...s };
      for (const stage of APPLICATION_STAGES) {
        next[stage] = s[stage].map((c) =>
          c.id === app.id ? { ...c, owner: nextOwner } : c
        );
      }
      return next;
    });
    try {
      const res = await fetch(`/api/admin/crm/contacts/${app.contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: nextOwner }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setError(null);
    } catch (err) {
      setStages(prev);
      setError(err instanceof Error ? err.message : "Failed to assign");
      window.setTimeout(() => setError(null), 4000);
    } finally {
      setAssigningId(null);
    }
  }

  const totalCount = useMemo(
    () =>
      APPLICATION_STAGES.reduce(
        (sum, s) => sum + (stages[s]?.length ?? 0),
        0
      ),
    [stages]
  );

  async function changeCohort(next: string) {
    setCohort(next);
    setLoadingCohort(true);
    try {
      const url = `/api/admin/applications?view=kanban${
        next !== "all" ? `&cohort=${encodeURIComponent(next)}` : ""
      }`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setStages(data.stages as StageMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoadingCohort(false);
    }
  }

  function findCard(id: number): { stage: ApplicationStage; card: KanbanApplication } | null {
    for (const s of APPLICATION_STAGES) {
      const c = stages[s].find((x) => x.id === id);
      if (c) return { stage: s, card: c };
    }
    return null;
  }

  async function moveCard(id: number, from: ApplicationStage, to: ApplicationStage) {
    if (from === to) return;
    const found = findCard(id);
    if (!found) return;

    // optimistic
    const prev = stages;
    setStages((s) => {
      const next: StageMap = { ...s };
      next[from] = s[from].filter((c) => c.id !== id);
      next[to] = [{ ...found.card, status: to }, ...s[to]];
      return next;
    });

    try {
      const res = await fetch(`/api/admin/applications/${id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: to }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setError(null);

      // Suggest an email template when moving to accepted/rejected.
      if ((to === "accepted" || to === "rejected") && found.card.contactId) {
        const templateSlug = to === "accepted" ? "cohort-welcome" : "cohort-rejection";
        router.push(
          `/admin/contacts/${found.card.contactId}?email=${encodeURIComponent(templateSlug)}`
        );
      }
    } catch (err) {
      setStages(prev);
      setError(err instanceof Error ? err.message : "Failed to move card");
      window.setTimeout(() => setError(null), 4000);
    }
  }

  function openCard(app: KanbanApplication) {
    if (app.contactId) {
      router.push(`/admin/contacts/${app.contactId}`);
    } else {
      setDetail(app);
    }
  }

  async function deleteCard(id: number) {
    setDeletingId(id);
    const prev = stages;
    setStages((s) => {
      const next: StageMap = { ...s };
      for (const stage of APPLICATION_STAGES) {
        next[stage] = s[stage].filter((c) => c.id !== id);
      }
      return next;
    });
    setDetail((d) => (d && d.id === id ? null : d));
    try {
      const res = await fetch("/api/admin/applications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setError(null);
    } catch (err) {
      setStages(prev);
      setError(err instanceof Error ? err.message : "Failed to delete");
      window.setTimeout(() => setError(null), 4000);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-foreground-subtle text-xs tracking-widest uppercase">
          Cohort
        </label>
        <select
          value={cohort}
          onChange={(e) => changeCohort(e.target.value)}
          disabled={loadingCohort}
          className="bg-[var(--color-sunken)] border border-[var(--color-border-strong)] text-[var(--color-fg)] text-sm rounded-[var(--radius-admin-md)] px-3 py-1.5 focus-ring focus:border-[var(--color-border-focus)]"
        >
          <option value="all">All cohorts</option>
          {cohorts.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="sr-only">{totalCount} applications</span>
        {error && (
          <span className="ml-auto text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-lg">
            {error}
          </span>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory xl:overflow-x-visible xl:snap-none pb-4 -mx-2 px-2 scrollbar-thin">
        {APPLICATION_STAGES.map((stage) => {
          const color = STAGE_COLORS[stage];
          const cards = stages[stage] ?? [];
          const isHover = hoverStage === stage;
          // "Rejected" gets a low-saturation red tint even when empty so the
          // column is obviously a drop target. All other empty columns keep
          // a neutral dashed border.
          const isRejected = stage === "rejected";
          return (
            <div
              key={stage}
              onDragOver={(e) => {
                e.preventDefault();
                if (hoverStage !== stage) setHoverStage(stage);
              }}
              onDragLeave={() => {
                if (hoverStage === stage) setHoverStage(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setHoverStage(null);
                if (dragId !== null && dragFrom) {
                  moveCard(dragId, dragFrom, stage);
                }
                setDragId(null);
                setDragFrom(null);
              }}
              className={`shrink-0 w-[85vw] sm:w-64 lg:w-60 xl:flex-1 xl:shrink xl:min-w-0 snap-start flex flex-col rounded-xl border bg-background-elevated/70 transition ${
                isHover
                  ? "border-dashed border-[var(--color-info)]/60 bg-[var(--color-info-tint)]"
                  : isRejected && cards.length === 0
                    ? "border-[var(--color-bad)]/25 bg-[var(--color-bad-tint)]/40"
                    : cards.length === 0
                      ? "border-white/[0.04]"
                      : "border-white/10"
              }`}
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <span className={`w-2 h-2 rounded-full ${color.dot}`} />
                <h3 className="font-heading tracking-wider uppercase text-off-white text-xs">
                  {STAGE_LABELS[stage]}
                </h3>
                <span
                  className={`ml-auto min-w-[22px] text-center text-[11px] font-heading tabular-nums px-1.5 py-0.5 rounded-full ${
                    cards.length === 0
                      ? "text-foreground-subtle bg-white/[0.04]"
                      : "text-off-white bg-white/10"
                  }`}
                >
                  {cards.length}
                </span>
              </div>
              <div className="flex-1 p-2 space-y-2 min-h-[120px]">
                {cards.length === 0 && (
                  <div
                    className={`text-xs text-center py-8 border border-dashed rounded-lg ${
                      isRejected
                        ? "text-[var(--color-bad)]/70 border-[var(--color-bad)]/20"
                        : "text-foreground-subtle border-white/5"
                    }`}
                  >
                    {isRejected ? "Drop rejected apps here" : "No applications"}
                  </div>
                )}
                {cards.map((app) => {
                  const dragging = dragId === app.id;
                  return (
                    <div
                      key={app.id}
                      role="button"
                      tabIndex={0}
                      draggable
                      onDragStart={(e) => {
                        setDragId(app.id);
                        setDragFrom(stage);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", String(app.id));
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setDragFrom(null);
                        setHoverStage(null);
                      }}
                      onClick={() => openCard(app)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openCard(app);
                        }
                      }}
                      className={`group relative block w-full text-left p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-elevated)] hover:border-[var(--color-border-strong)] hover:bg-white/[0.04] transition cursor-grab active:cursor-grabbing ${
                        dragging ? `opacity-40 scale-[0.98] ring-1 ${color.ring}` : ""
                      } ${deletingId === app.id ? "opacity-40 pointer-events-none" : ""}`}
                    >
                      <InlineDelete
                        disabled={deletingId !== null}
                        onConfirm={() => deleteCard(app.id)}
                      />
                      <div className="flex items-start gap-2 mb-1 pr-6">
                        <span className="text-off-white text-sm font-semibold truncate">
                          {app.name}
                        </span>
                        <span className="ml-auto text-foreground-subtle text-[10px] shrink-0">
                          {timeAgo(app.createdAt)}
                        </span>
                      </div>
                      <p className="text-foreground-muted text-xs truncate mb-1">
                        {truncate(app.goal, 70)}
                      </p>
                      <p className="text-foreground-subtle text-[11px] leading-snug mb-2">
                        {truncate(app.frustration, 80)}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {app.persona && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                              PERSONA_COLORS[app.persona] ?? PERSONA_COLORS.listener
                            }`}
                          >
                            {app.persona}
                          </span>
                        )}
                        <span className="text-foreground-subtle text-[10px]">
                          {app.hours}
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOwnerMenuFor(ownerMenuFor === app.id ? null : app.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              setOwnerMenuFor(ownerMenuFor === app.id ? null : app.id);
                            }
                          }}
                          className={`relative ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium border capitalize cursor-pointer ${
                            app.owner
                              ? "bg-[var(--color-raised)] text-[var(--color-fg)] border-[var(--color-border-strong)]"
                              : "border-dashed border-[var(--color-border-strong)] text-[var(--color-fg-subtle)]"
                          } ${assigningId === app.id ? "opacity-60" : ""}`}
                          aria-label="Assign owner"
                        >
                          {app.owner
                            ? `${app.owner.charAt(0).toUpperCase()} $· ${app.owner}`
                            : "unassigned"}
                          {ownerMenuFor === app.id && (
                            <span
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 z-20 min-w-[140px] rounded-lg border border-white/10 bg-background-elevated shadow-lg p-1 flex flex-col gap-0.5 normal-case"
                            >
                              {OWNER_OPTIONS.map((opt) => {
                                const selected = (app.owner ?? null) === opt.value;
                                return (
                                  <button
                                    key={opt.label}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      assignOwner(app, opt.value);
                                    }}
                                    className={`text-left text-[11px] px-2 py-1 rounded hover:bg-white/5 ${
                                      selected ? "text-[var(--color-fg)] bg-[var(--color-raised)]" : "text-[var(--color-fg)]"
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {detail && (
        <ApplicationDetailModal
          app={detail}
          onClose={() => setDetail(null)}
          onDelete={() => deleteCard(detail.id)}
          deleting={deletingId === detail.id}
        />
      )}
    </div>
  );
}

function InlineDelete({
  onConfirm,
  disabled,
}: {
  onConfirm: () => void;
  disabled?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  // Auto-cancel after a few seconds so a half-click doesn't sit in confirm
  // state indefinitely.
  useEffect(() => {
    if (!confirming) return;
    const t = window.setTimeout(() => setConfirming(false), 4000);
    return () => window.clearTimeout(t);
  }, [confirming]);

  if (confirming) {
    return (
      <div
        className="absolute right-1 top-1 z-10 flex gap-1"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        draggable={false}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onConfirm();
          }}
          className="text-[10px] px-2 py-0.5 rounded bg-red-500/30 text-red-300 border border-red-400/40 hover:bg-red-500/50 font-heading tracking-wider uppercase disabled:opacity-50"
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setConfirming(false);
          }}
          className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-foreground-subtle hover:text-off-white"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label="Delete application"
      draggable={false}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        setConfirming(true);
      }}
      className="absolute right-1 top-1 z-10 w-5 h-5 rounded-full flex items-center justify-center text-foreground-subtle/60 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition"
    >
      Ã—
    </button>
  );
}

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
      className={`text-[10px] px-2 py-0.5 rounded-full border font-medium transition shrink-0 ${
        copied
          ? "bg-[var(--color-good-tint)] text-[var(--color-good)] border-[var(--color-good)]/40"
          : "border-[var(--color-border)] text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] hover:border-[var(--color-border-strong)]"
      }`}
    >
      {copied ? "Copied" : label ?? "Copy"}
    </button>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  const v = value ?? "";
  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-white/5 bg-white/[0.02]">
      <div className="flex items-center gap-2">
        <span className="text-foreground-subtle text-[10px] tracking-widest uppercase">
          {label}
        </span>
        <span className="ml-auto">
          <CopyButton value={v} />
        </span>
      </div>
      <p
        className={`text-off-white text-sm whitespace-pre-wrap break-words ${
          mono ? "font-mono" : ""
        } ${!v ? "text-foreground-subtle italic" : ""}`}
      >
        {v || "$€”"}
      </p>
    </div>
  );
}

function ApplicationDetailModal({
  app,
  onClose,
  onDelete,
  deleting,
}: {
  app: KanbanApplication;
  onClose: () => void;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const allText = [
    `Name: ${app.name}`,
    `Email: ${app.email}`,
    `Cohort: ${app.cohort}`,
    `Hours/week: ${app.hours}`,
    `FTP: ${app.ftp ?? "$€”"}`,
    `Persona: ${app.persona ?? "$€”"}`,
    `Status: ${app.status}`,
    `Submitted: ${new Date(app.createdAt).toLocaleString("en-GB")}`,
    ``,
    `Goal:`,
    app.goal || "$€”",
    ``,
    `Frustration:`,
    app.frustration || "$€”",
  ].join("\n");

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      window.setTimeout(() => setCopiedAll(false), 1500);
    } catch {}
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl my-8 rounded-xl border border-white/10 bg-background-elevated shadow-2xl"
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <h2 className="font-heading tracking-wider uppercase text-off-white text-sm">
            Application
          </h2>
          <span className="text-foreground-subtle text-[10px]">
            #{app.id} $· {new Date(app.createdAt).toLocaleDateString("en-GB")}
          </span>
          <button
            type="button"
            onClick={copyAll}
            className={`ml-auto text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
              copiedAll
                ? "bg-[var(--color-good-tint)] text-[var(--color-good)] border-[var(--color-good)]/40"
                : "bg-[var(--color-elevated)] text-[var(--color-fg-muted)] border-[var(--color-border-strong)] hover:bg-[var(--color-raised)]"
            }`}
          >
            {copiedAll ? "Copied all" : "Copy all"}
          </button>
          {onDelete &&
            (confirmingDelete ? (
              <>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={deleting}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-50 font-heading tracking-wider uppercase"
                >
                  {deleting ? "Deleting$€¦" : "Confirm"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                  className="text-xs px-2 py-1.5 text-foreground-subtle hover:text-off-white"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-foreground-subtle hover:text-red-400 hover:border-red-400/30 font-heading tracking-wider uppercase"
              >
                Delete
              </button>
            ))}
          <button
            type="button"
            onClick={onClose}
            className="text-foreground-subtle hover:text-off-white text-lg leading-none px-2"
            aria-label="Close"
          >
            Ã—
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-lg border border-[var(--color-info)]/30 bg-[var(--color-info-tint)]">
            <div className="flex-1 min-w-0">
              <div className="text-foreground-subtle text-[10px] tracking-widest uppercase">
                Email
              </div>
              <a
                href={`mailto:${app.email}`}
                className="text-[var(--color-info)] text-base font-semibold break-all hover:underline"
              >
                {app.email}
              </a>
            </div>
            <CopyButton value={app.email} label="Copy" />
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg border border-white/10 bg-white/[0.02]">
            <div className="flex-1 min-w-0">
              <div className="text-foreground-subtle text-[10px] tracking-widest uppercase">
                Name
              </div>
              <p className="text-off-white text-base font-semibold break-words">
                {app.name}
              </p>
            </div>
            <CopyButton value={app.name} label="Copy" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Cohort" value={app.cohort} />
            <Field label="Hours / week" value={app.hours} />
            <Field label="FTP" value={app.ftp} mono />
            <Field label="Persona" value={app.persona} />
          </div>

          <Field label="Goal" value={app.goal} />
          <Field label="Frustration" value={app.frustration} />

          <div className="flex items-center gap-3 text-[11px] text-foreground-subtle pt-2 border-t border-white/5">
            <span>Status: <span className="text-off-white">{app.status}</span></span>
            <span>$·</span>
            <span>Submitted {new Date(app.createdAt).toLocaleString("en-GB")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

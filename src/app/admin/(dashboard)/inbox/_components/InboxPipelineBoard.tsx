"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Column,
  MoveMenu,
  OwnerAvatar,
  OwnerPopover,
  SubmissionCard,
} from "./SubmissionCardShared";

export const INBOX_STAGES = [
  "new",
  "in_progress",
  "replied",
  "follow_up",
  "closed",
] as const;
export type InboxStage = (typeof INBOX_STAGES)[number];

export const INBOX_STAGE_LABELS: Record<InboxStage, string> = {
  new: "New",
  in_progress: "In progress",
  replied: "Replied",
  follow_up: "Follow up",
  closed: "Closed",
};

const INBOX_STAGE_COLORS: Record<
  InboxStage,
  { dot: string; badge: string; ring: string }
> = {
  new: {
    dot: "bg-coral",
    badge: "bg-coral/15 text-coral border-coral/30",
    ring: "ring-coral",
  },
  in_progress: {
    dot: "bg-amber-400",
    badge: "bg-amber-400/15 text-amber-400 border-amber-400/30",
    ring: "ring-amber-400",
  },
  replied: {
    dot: "bg-blue-400",
    badge: "bg-blue-400/15 text-blue-400 border-blue-400/30",
    ring: "ring-blue-400",
  },
  follow_up: {
    dot: "bg-purple-400",
    badge: "bg-purple-400/15 text-purple-400 border-purple-400/30",
    ring: "ring-purple-400",
  },
  closed: {
    dot: "bg-green-400",
    badge: "bg-green-400/15 text-green-400 border-green-400/30",
    ring: "ring-green-400",
  },
};

const OWNER_OPTIONS: { value: string | null; label: string }[] = [
  { value: null, label: "Unassigned" },
  { value: "sarah", label: "Sarah" },
  { value: "wes", label: "Wes" },
  { value: "matthew", label: "Matthew" },
  { value: "ted", label: "Ted" },
];

export interface InboxSubmission {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  readAt: string | null;
  assignedTo: string | null;
  status: InboxStage;
  createdAt: string;
}

export type InboxStageMap = Record<InboxStage, InboxSubmission[]>;

interface Props {
  initialStages: InboxStageMap;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}


export function InboxPipelineBoard({ initialStages }: Props) {
  const [stages, setStages] = useState<InboxStageMap>(initialStages);
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragFrom, setDragFrom] = useState<InboxStage | null>(null);
  const [hoverStage, setHoverStage] = useState<InboxStage | null>(null);
  const [detail, setDetail] = useState<InboxSubmission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ownerMenuFor, setOwnerMenuFor] = useState<number | null>(null);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (ownerMenuFor === null) return;
    const close = () => setOwnerMenuFor(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [ownerMenuFor]);

  const totalCount = useMemo(
    () =>
      INBOX_STAGES.reduce(
        (sum, s) => sum + (stages[s]?.length ?? 0),
        0
      ),
    [stages]
  );

  function findRow(
    id: number
  ): { stage: InboxStage; row: InboxSubmission } | null {
    for (const s of INBOX_STAGES) {
      const row = stages[s].find((r) => r.id === id);
      if (row) return { stage: s, row };
    }
    return null;
  }

  async function moveCard(
    id: number,
    from: InboxStage,
    to: InboxStage
  ) {
    if (from === to) return;
    const found = findRow(id);
    if (!found) return;
    const prev = stages;
    setStages((s) => {
      const next: InboxStageMap = { ...s };
      next[from] = s[from].filter((r) => r.id !== id);
      next[to] = [{ ...found.row, status: to }, ...s[to]];
      return next;
    });
    try {
      const res = await fetch("/api/admin/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: to }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setError(null);
    } catch (err) {
      setStages(prev);
      setError(err instanceof Error ? err.message : "Failed to move");
      window.setTimeout(() => setError(null), 4000);
    }
  }

  async function assignOwner(
    sub: InboxSubmission,
    nextOwner: string | null
  ) {
    setAssigningId(sub.id);
    setOwnerMenuFor(null);
    const prev = stages;
    setStages((s) => {
      const next: InboxStageMap = { ...s };
      for (const stage of INBOX_STAGES) {
        next[stage] = s[stage].map((r) =>
          r.id === sub.id ? { ...r, assignedTo: nextOwner } : r
        );
      }
      return next;
    });
    try {
      const res = await fetch("/api/admin/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sub.id, assignedTo: nextOwner }),
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

  async function deleteCard(id: number) {
    setDeletingId(id);
    const prev = stages;
    setStages((s) => {
      const next: InboxStageMap = { ...s };
      for (const stage of INBOX_STAGES) {
        next[stage] = s[stage].filter((r) => r.id !== id);
      }
      return next;
    });
    setDetail((d) => (d && d.id === id ? null : d));
    try {
      const res = await fetch("/api/admin/inbox", {
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

  async function openCard(sub: InboxSubmission) {
    setDetail(sub);
    // Side-effect: mark as read on first open (matches list-view behaviour).
    if (!sub.readAt) {
      try {
        const res = await fetch("/api/admin/inbox", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: sub.id }),
        });
        if (res.ok) {
          const readAt = new Date().toISOString();
          setStages((s) => {
            const next: InboxStageMap = { ...s };
            for (const stage of INBOX_STAGES) {
              next[stage] = s[stage].map((r) =>
                r.id === sub.id ? { ...r, readAt } : r
              );
            }
            return next;
          });
        }
      } catch {
        // non-blocking
      }
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="self-end text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
          {error}
        </div>
      )}

      {/* Totals hidden — page header already shows them. Keep totalCount referenced for TS. */}
      <span className="sr-only">{totalCount} total</span>

      {/* Edge-fade wrapper — the CSS gradient overlays at the viewport edges
          hint there's more to scroll. Board itself uses snap-scroll with a
          peek of the next column (72vw on mobile). */}
      <div className="relative -mx-4 sm:-mx-6">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-4 w-6 bg-gradient-to-r from-background to-transparent z-10"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent z-10"
        />
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory sm:snap-none pb-4 px-4 sm:px-6 scrollbar-thin">
          {INBOX_STAGES.map((stage) => {
            const color = INBOX_STAGE_COLORS[stage];
            const cards = stages[stage] ?? [];
            return (
              <Column
                key={stage}
                stage={stage}
                label={INBOX_STAGE_LABELS[stage]}
                accent={color.dot}
                count={cards.length}
                isHoverTarget={hoverStage === stage}
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
              >
                {cards.length === 0 ? (
                  <p className="text-foreground-subtle/60 text-[11px] text-center py-6 border border-dashed border-white/5 rounded-lg">
                    Drop a message here
                  </p>
                ) : (
                  cards.map((sub) => (
                    <SubmissionCard
                      key={sub.id}
                      headline={sub.name}
                      subline={
                        sub.subject &&
                        sub.subject.toLowerCase() !== "general"
                          ? sub.subject
                          : null
                      }
                      preview={sub.message}
                      rightChip={timeAgo(sub.createdAt)}
                      unread={!sub.readAt}
                      dragging={dragId === sub.id}
                      ringAccent={color.ring}
                      onClick={() => openCard(sub)}
                      draggableProps={{
                        draggable: true,
                        onDragStart: (e) => {
                          setDragId(sub.id);
                          setDragFrom(stage);
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData(
                            "text/plain",
                            String(sub.id)
                          );
                        },
                        onDragEnd: () => {
                          setDragId(null);
                          setDragFrom(null);
                          setHoverStage(null);
                        },
                      }}
                      footerSlot={
                        <>
                          <MoveMenu
                            currentStage={stage}
                            stages={INBOX_STAGES.map((s) => ({
                              value: s,
                              label: INBOX_STAGE_LABELS[s],
                            }))}
                            onMove={(next) =>
                              moveCard(sub.id, stage, next as InboxStage)
                            }
                          />
                          <OwnerPopover
                            options={OWNER_OPTIONS}
                            selected={sub.assignedTo ?? null}
                            open={ownerMenuFor === sub.id}
                            onToggle={() =>
                              setOwnerMenuFor(
                                ownerMenuFor === sub.id ? null : sub.id
                              )
                            }
                            onPick={(v) => assignOwner(sub, v)}
                            busy={assigningId === sub.id}
                            anchor="top-right"
                          >
                            <OwnerAvatar
                              slug={sub.assignedTo ?? null}
                              size="sm"
                            />
                          </OwnerPopover>
                        </>
                      }
                    />
                  ))
                )}
              </Column>
            );
          })}
        </div>
      </div>

      {detail && (
        <InboxDetailModal
          sub={detail}
          onClose={() => setDetail(null)}
          onDelete={() => deleteCard(detail.id)}
          deleting={deletingId === detail.id}
        />
      )}
    </div>
  );
}

function InboxDetailModal({
  sub,
  onClose,
  onDelete,
  deleting,
}: {
  sub: InboxSubmission;
  onClose: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const submitted = new Date(sub.createdAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const [confirming, setConfirming] = useState(false);

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
            {sub.subject || "Inbox message"}
          </h2>
          <span className="text-foreground-subtle text-[10px]">
            #{sub.id} · {submitted}
          </span>
          <a
            href={`mailto:${sub.email}?subject=Re: ${encodeURIComponent(
              sub.subject
            )}`}
            className="ml-auto text-xs px-3 py-1.5 rounded-lg bg-coral/15 text-coral border border-coral/30 hover:bg-coral/25 font-heading tracking-wider uppercase"
          >
            Reply
          </a>
          {confirming ? (
            <>
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-50 font-heading tracking-wider uppercase"
              >
                {deleting ? "Deleting…" : "Confirm"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="text-xs px-2 py-1.5 text-foreground-subtle hover:text-off-white"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-foreground-subtle hover:text-red-400 hover:border-red-400/30 font-heading tracking-wider uppercase"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-foreground-subtle hover:text-off-white text-lg leading-none px-2"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-lg border border-coral/20 bg-coral/[0.04]">
            <div className="flex-1 min-w-0">
              <div className="text-foreground-subtle text-[10px] tracking-widest uppercase">
                From
              </div>
              <p className="text-off-white text-base font-semibold break-words">
                {sub.name}
              </p>
              <a
                href={`mailto:${sub.email}`}
                className="text-coral text-sm break-all hover:underline"
              >
                {sub.email}
              </a>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">
            <div className="text-foreground-subtle text-[10px] tracking-widest uppercase mb-1">
              Message
            </div>
            <p className="text-off-white text-sm whitespace-pre-wrap break-words">
              {sub.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

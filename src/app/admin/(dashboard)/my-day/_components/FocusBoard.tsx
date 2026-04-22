"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { MyDayTaskRow } from "@/lib/crm/dashboard";
import { TaskCompleteCheckbox } from "./TaskCompleteCheckbox";
import { EmptyState, SectionLabel } from "@/components/admin/ui";

/** Small hover-×-then-confirm delete control used on every task row. */
function TaskDeleteButton({
  disabled,
  onConfirm,
}: {
  disabled: boolean;
  onConfirm: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (!confirming) return;
    const t = window.setTimeout(() => setConfirming(false), 4000);
    return () => window.clearTimeout(t);
  }, [confirming]);

  if (confirming) {
    return (
      <span
        className="inline-flex gap-1 shrink-0"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onConfirm();
          }}
          draggable={false}
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
          draggable={false}
          className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-foreground-subtle hover:text-off-white"
        >
          Cancel
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      aria-label="Delete task"
      draggable={false}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        setConfirming(true);
      }}
      className="w-5 h-5 rounded-full flex items-center justify-center text-foreground-subtle/50 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition shrink-0"
    >
      ×
    </button>
  );
}

interface Teammate {
  slug: string;
  name: string;
  email: string;
}

interface Props {
  currentUserSlug: string;
  currentUserName: string;
  mainFocus: MyDayTaskRow[];
  otherOpen: MyDayTaskRow[];
  teammates: Teammate[];
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (day.getTime() - today.getTime()) / 86_400_000
  );
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays === -1) return "yesterday";
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays < 7) return `in ${diffDays}d`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function FocusBoard({
  currentUserSlug,
  currentUserName,
  mainFocus,
  otherOpen,
  teammates,
}: Props) {
  const router = useRouter();
  const [focus, setFocus] = useState<MyDayTaskRow[]>(mainFocus);
  const [others, setOthers] = useState<MyDayTaskRow[]>(otherOpen);
  const [dragId, setDragId] = useState<number | null>(null);
  const [hoverZone, setHoverZone] = useState<"focus" | "other" | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /** Insert a freshly-created task into the "All other tasks" column
   *  immediately (no refresh needed). Self-created tasks land here;
   *  request-sent tasks never show up on the sender's board. */
  function addTaskLocally(task: MyDayTaskRow) {
    setOthers((prev) => [task, ...prev]);
  }

  async function deleteTask(taskId: number) {
    setDeletingId(taskId);
    const prevFocus = focus;
    const prevOthers = others;
    // Optimistic remove
    setFocus((f) => f.filter((t) => t.id !== taskId));
    setOthers((o) => o.filter((t) => t.id !== taskId));
    try {
      const res = await fetch(`/api/admin/crm/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
    } catch (err) {
      setFocus(prevFocus);
      setOthers(prevOthers);
      setError(err instanceof Error ? err.message : "Failed to delete");
      window.setTimeout(() => setError(null), 4000);
    } finally {
      setDeletingId(null);
    }
  }

  function findTask(id: number):
    | { task: MyDayTaskRow; zone: "focus" | "other"; index: number }
    | null {
    const fi = focus.findIndex((t) => t.id === id);
    if (fi !== -1) return { task: focus[fi], zone: "focus", index: fi };
    const oi = others.findIndex((t) => t.id === id);
    if (oi !== -1) return { task: others[oi], zone: "other", index: oi };
    return null;
  }

  async function drop(
    id: number,
    targetZone: "focus" | "other",
    targetIndex: number | null
  ) {
    const found = findTask(id);
    if (!found) return;
    const prevFocus = focus;
    const prevOthers = others;

    // Optimistic apply
    setBusy(true);
    setError(null);
    let nextFocus = focus.filter((t) => t.id !== id);
    let nextOthers = others.filter((t) => t.id !== id);
    if (targetZone === "focus") {
      const idx =
        targetIndex === null ? nextFocus.length : Math.min(targetIndex, nextFocus.length);
      nextFocus = [
        ...nextFocus.slice(0, idx),
        { ...found.task, focusOrder: idx + 1 },
        ...nextFocus.slice(idx),
      ];
    } else {
      nextOthers = [
        { ...found.task, focusOrder: null },
        ...nextOthers,
      ];
    }
    setFocus(nextFocus);
    setOthers(nextOthers);

    try {
      const action = targetZone === "focus" ? "reorder" : "unpin";
      const body: Record<string, unknown> = { action };
      if (targetZone === "focus" && targetIndex !== null)
        body.position = targetIndex;
      const res = await fetch(
        `/api/admin/crm/tasks/${id}/focus`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (err) {
      setFocus(prevFocus);
      setOthers(prevOthers);
      setError(err instanceof Error ? err.message : "Failed to move");
      window.setTimeout(() => setError(null), 4000);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <SectionLabel tone="off-white">Tasks</SectionLabel>
        <button
          type="button"
          onClick={() => setComposerOpen(true)}
          className="text-xs px-3 py-1.5 rounded-lg bg-coral/15 text-coral border border-coral/30 hover:bg-coral/25 font-heading tracking-wider uppercase"
        >
          + Add task
        </button>
      </div>

      {error && (
        <p className="text-xs text-coral bg-coral/5 border border-coral/20 rounded px-3 py-2">
          {error}
        </p>
      )}

      {/* My Main Focus */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (hoverZone !== "focus") setHoverZone("focus");
        }}
        onDragLeave={() => {
          if (hoverZone === "focus") setHoverZone(null);
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (dragId !== null) drop(dragId, "focus", hoverIndex);
          setDragId(null);
          setHoverZone(null);
          setHoverIndex(null);
        }}
        className={`rounded-xl border-2 border-dashed transition p-4 ${
          hoverZone === "focus"
            ? "border-coral/60 bg-coral/[0.04]"
            : "border-coral/20 bg-coral/[0.02]"
        }`}
      >
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <SectionLabel tone="coral">My main focus</SectionLabel>
            <span className="text-[10px] text-foreground-subtle">
              drag a task here
            </span>
          </div>
          <span className="text-[10px] tabular-nums text-foreground-subtle">
            {focus.length}
          </span>
        </div>
        {focus.length === 0 ? (
          <p className="text-foreground-subtle text-xs text-center py-4">
            Drop your 1–3 priority tasks here to pin them to the top of your
            day.
          </p>
        ) : (
          <ul className="space-y-1">
            {focus.map((t, idx) => (
              <li
                key={t.id}
                draggable
                onDragStart={(e) => {
                  setDragId(t.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHoverIndex(idx);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setHoverIndex(null);
                  setHoverZone(null);
                }}
                className={`group flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.04] px-3 py-2 cursor-grab active:cursor-grabbing ${
                  dragId === t.id ? "opacity-40" : ""
                } ${busy || deletingId === t.id ? "pointer-events-none opacity-60" : ""}`}
              >
                <span className="text-[10px] text-coral font-heading tabular-nums w-4">
                  {idx + 1}
                </span>
                <TaskCompleteCheckbox taskId={t.id} completed={!!t.completedAt} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-off-white truncate">{t.title}</p>
                  {t.contactId && (
                    <Link
                      href={`/admin/contacts/${t.contactId}`}
                      className="text-xs text-foreground-muted hover:text-coral"
                    >
                      {t.contactName ?? t.contactEmail}
                    </Link>
                  )}
                </div>
                <span className="text-xs text-foreground-subtle whitespace-nowrap">
                  {t.dueAt && `${formatDate(t.dueAt)} · ${formatTime(t.dueAt)}`}
                </span>
                <TaskDeleteButton
                  disabled={deletingId === t.id}
                  onConfirm={() => deleteTask(t.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* All other tasks */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (hoverZone !== "other") setHoverZone("other");
        }}
        onDragLeave={() => {
          if (hoverZone === "other") setHoverZone(null);
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (dragId !== null) drop(dragId, "other", null);
          setDragId(null);
          setHoverZone(null);
          setHoverIndex(null);
        }}
        className={`rounded-xl border transition p-4 ${
          hoverZone === "other"
            ? "border-white/20 bg-white/[0.03]"
            : "border-white/5 bg-transparent"
        }`}
      >
        <div className="flex items-baseline justify-between mb-3">
          <SectionLabel>All other tasks</SectionLabel>
          <span className="text-[10px] tabular-nums text-foreground-subtle">
            {others.length}
          </span>
        </div>
        {others.length === 0 ? (
          <EmptyState
            icon="✓"
            title="All caught up"
            subtitle={
              focus.length === 0
                ? "No open tasks. Click Add task to create one."
                : "Everything you have is in Main Focus. Nice."
            }
          />
        ) : (
          <ul className="space-y-1">
            {others.map((t) => {
              const isOverdue =
                t.dueAt && new Date(t.dueAt).getTime() < Date.now();
              return (
                <li
                  key={t.id}
                  draggable
                  onDragStart={(e) => {
                    setDragId(t.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setHoverIndex(null);
                    setHoverZone(null);
                  }}
                  className={`group flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 cursor-grab active:cursor-grabbing hover:bg-white/[0.04] ${
                    dragId === t.id ? "opacity-40" : ""
                  } ${busy || deletingId === t.id ? "pointer-events-none opacity-60" : ""}`}
                >
                  <TaskCompleteCheckbox taskId={t.id} completed={!!t.completedAt} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-off-white truncate">{t.title}</p>
                    {t.contactId && (
                      <Link
                        href={`/admin/contacts/${t.contactId}`}
                        className="text-xs text-foreground-muted hover:text-coral"
                      >
                        {t.contactName ?? t.contactEmail}
                      </Link>
                    )}
                  </div>
                  <span
                    className={`text-xs whitespace-nowrap ${
                      isOverdue ? "text-coral" : "text-foreground-subtle"
                    }`}
                  >
                    {t.dueAt ? `${formatDate(t.dueAt)}` : ""}
                  </span>
                  <TaskDeleteButton
                    disabled={deletingId === t.id}
                    onConfirm={() => deleteTask(t.id)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {composerOpen && (
        <AddTaskComposer
          currentUserSlug={currentUserSlug}
          currentUserName={currentUserName}
          teammates={teammates}
          onClose={() => setComposerOpen(false)}
          onCreatedSelf={(newTask) => {
            // Self-task lands in "All other tasks" instantly.
            addTaskLocally(newTask);
            setComposerOpen(false);
            // Fire refresh in the background to re-sync with server state.
            router.refresh();
          }}
          onSentToOther={() => {
            // Request flow — doesn't appear on sender's board, just close.
            setComposerOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function AddTaskComposer({
  currentUserSlug,
  currentUserName,
  teammates,
  onClose,
  onCreatedSelf,
  onSentToOther,
}: {
  currentUserSlug: string;
  currentUserName: string;
  teammates: Teammate[];
  onClose: () => void;
  onCreatedSelf: (task: MyDayTaskRow) => void;
  onSentToOther: () => void;
}) {
  const [assignedTo, setAssignedTo] = useState<string>(currentUserSlug);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelf = assignedTo === currentUserSlug;

  async function submit() {
    if (!title.trim() || !assignedTo) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/crm/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          notes: notes.trim() || null,
          assignedTo,
          dueAt: dueAt || null,
          // Self-tasks land directly; tasks to others go through the request flow.
          sendAsRequest: !isSelf,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      if (isSelf) {
        const body = await res.json().catch(() => ({}));
        const t = body?.task;
        if (t && typeof t === "object" && "id" in t) {
          const newTask: MyDayTaskRow = {
            id: Number(t.id),
            title: String(t.title ?? title.trim()),
            dueAt: t.dueAt ?? null,
            completedAt: t.completedAt ?? null,
            contactId: t.contactId ?? null,
            contactName: null,
            contactEmail: null,
            focusOrder: t.focusOrder ?? null,
          };
          onCreatedSelf(newTask);
          return;
        }
      }
      onSentToOther();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg my-16 rounded-xl border border-white/10 bg-background-elevated shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="font-heading tracking-wider uppercase text-off-white text-sm">
            {isSelf ? "Add task" : "Send task"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-foreground-subtle hover:text-off-white text-lg leading-none px-2"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-foreground-subtle mb-1">
              Assign to
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
            >
              <option value={currentUserSlug}>
                Myself ({currentUserName})
              </option>
              {teammates
                .filter((t) => t.slug !== currentUserSlug)
                .map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name} ({t.email})
                  </option>
                ))}
            </select>
            {!isSelf && (
              <p className="text-[10px] text-foreground-subtle mt-1">
                This will be sent as a request — they can accept, reply, or decline.
              </p>
            )}
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-foreground-subtle mb-1">
              What needs doing?
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Write intro for episode 1240"
              autoFocus
              className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-foreground-subtle mb-1">
              Context (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Why, links, anything useful…"
              className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-foreground-subtle mb-1">
              Due (optional)
            </label>
            <input
              type="date"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
            />
          </div>
          {error && (
            <p className="text-xs text-coral bg-coral/5 border border-coral/20 rounded px-3 py-2">
              {error}
            </p>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="text-xs px-3 py-1.5 text-foreground-subtle hover:text-off-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={sending || !title.trim() || !assignedTo}
            className="text-xs px-4 py-1.5 rounded-lg bg-coral text-white hover:bg-coral/90 disabled:opacity-50 font-heading tracking-wider uppercase"
          >
            {sending ? "Saving…" : isSelf ? "Create" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

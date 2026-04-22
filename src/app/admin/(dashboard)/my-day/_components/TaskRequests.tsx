"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MyDayTaskRequestRow } from "@/lib/crm/dashboard";
import { Card, CardBody } from "@/components/admin/ui";

interface Teammate {
  slug: string;
  name: string;
  email: string;
}

interface Props {
  currentUserSlug: string;
  currentUserName: string;
  incoming: MyDayTaskRequestRow[];
  outgoing: MyDayTaskRequestRow[];
  teammates: Teammate[];
}

function fmtRelative(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function TaskRequests({
  currentUserSlug,
  currentUserName,
  incoming,
  outgoing,
  teammates,
}: Props) {
  const router = useRouter();
  const [replyOpenFor, setReplyOpenFor] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function respond(
    taskId: number,
    action: "accept" | "decline" | "reply",
    message?: string
  ) {
    setBusyId(taskId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/crm/tasks/${taskId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setReplyOpenFor(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="font-body font-semibold text-[13px] text-[var(--color-fg)]">
        Team tasks
      </h2>

      {error && (
        <p className="text-xs text-[var(--color-bad)] bg-[var(--color-bad-tint)] border border-[var(--color-bad)]/30 rounded-[var(--radius-admin-md)] px-3 py-2">
          {error}
        </p>
      )}

      {incoming.length > 0 && (
        <div className="bg-[var(--color-elevated)] border border-[var(--color-border-strong)] border-l-2 border-l-[var(--color-fg)] rounded-[var(--radius-admin-lg)] p-4">
          <p className="font-body font-semibold text-[13px] text-[var(--color-fg)] mb-3">
            Requests for you ({incoming.length})
          </p>
          <ul className="space-y-3">
            {incoming.map((t) => (
              <li
                key={t.id}
                className="border border-white/5 bg-white/[0.02] rounded-lg p-3"
              >
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-off-white text-sm font-semibold">
                      {t.title}
                    </p>
                    <p className="text-foreground-subtle text-xs mt-0.5">
                      From{" "}
                      <span className="text-off-white">
                        {t.createdByName ?? t.createdBy ?? "—"}
                      </span>
                      {" · "}
                      {fmtRelative(t.createdAt)}
                      {t.dueAt && ` · due ${new Date(t.dueAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
                    </p>
                    {t.notes && (
                      <p className="text-foreground-muted text-xs mt-1 whitespace-pre-wrap">
                        {t.notes}
                      </p>
                    )}
                    {t.contactId && (
                      <Link
                        href={`/admin/contacts/${t.contactId}`}
                        className="text-xs text-[var(--color-info)] hover:underline mt-1 inline-block"
                      >
                        {t.contactName ?? t.contactEmail}
                      </Link>
                    )}
                    {t.responseMessage && (
                      <p className="text-[11px] text-foreground-muted mt-2 italic border-l-2 border-[var(--color-border-strong)] pl-2">
                        Your last reply: “{t.responseMessage}”
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      type="button"
                      disabled={busyId === t.id}
                      onClick={() => respond(t.id, "accept")}
                      className="text-[10px] px-2 py-1 rounded-full border font-medium bg-green-500/15 text-green-400 border-green-500/30 hover:bg-green-500/25 disabled:opacity-50 font-heading tracking-wider uppercase"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={busyId === t.id}
                      onClick={() => setReplyOpenFor(replyOpenFor === t.id ? null : t.id)}
                      className="text-[10px] px-2 py-1 rounded-full border font-medium border-white/15 text-foreground-muted hover:text-off-white disabled:opacity-50 font-heading tracking-wider uppercase"
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      disabled={busyId === t.id}
                      onClick={() => respond(t.id, "decline")}
                      className="text-[10px] px-2 py-1 rounded-full border font-medium bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 disabled:opacity-50 font-heading tracking-wider uppercase"
                    >
                      Decline
                    </button>
                  </div>
                </div>
                {replyOpenFor === t.id && (
                  <ReplyBox
                    placeholder={`Reply to ${t.createdByName ?? "sender"}…`}
                    disabled={busyId === t.id}
                    onSubmit={(msg) => respond(t.id, "reply", msg)}
                    onCancel={() => setReplyOpenFor(null)}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {outgoing.length > 0 && (
        <Card>
          <CardBody compact>
          <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-semibold mb-3">
            Awaiting their response ({outgoing.length})
          </p>
          <ul className="space-y-3">
            {outgoing.map((t) => (
              <li
                key={t.id}
                className="border border-white/5 bg-white/[0.02] rounded-lg p-3"
              >
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-off-white text-sm font-semibold">
                      {t.title}
                    </p>
                    <p className="text-foreground-subtle text-xs mt-0.5">
                      To{" "}
                      <span className="text-off-white">
                        {t.assignedToName ?? t.assignedTo}
                      </span>
                      {" · sent "}
                      {fmtRelative(t.createdAt)}
                      {t.dueAt && ` · due ${new Date(t.dueAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
                    </p>
                    {t.responseMessage && (
                      <p className="text-[11px] text-off-white mt-2 border-l-2 border-[var(--color-border-strong)] pl-2">
                        <span className="text-foreground-subtle">Reply:</span>{" "}
                        “{t.responseMessage}”
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={busyId === t.id}
                    onClick={() => respond(t.id, "decline")}
                    title="Cancel this request"
                    className="text-[10px] px-2 py-1 rounded-full border font-medium border-white/10 text-foreground-subtle hover:text-red-400 hover:border-red-400/30 disabled:opacity-50 font-heading tracking-wider uppercase"
                  >
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
          </CardBody>
        </Card>
      )}

      {incoming.length === 0 && outgoing.length === 0 && (
        <p className="text-xs text-foreground-subtle">
          No pending team tasks. Use <em className="text-off-white">Add task</em> above to send one.
        </p>
      )}

      {/* Keep currentUserName referenced so lint doesn't strip it — still used by parent. */}
      <span className="hidden" aria-hidden="true">
        {currentUserName}
      </span>
    </div>
  );
}

function ReplyBox({
  placeholder,
  disabled,
  onSubmit,
  onCancel,
}: {
  placeholder: string;
  disabled: boolean;
  onSubmit: (msg: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  return (
    <div className="mt-3 flex flex-col gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={2}
        disabled={disabled}
        className="w-full px-3 py-2 text-sm bg-[var(--color-sunken)] border border-[var(--color-border-strong)] text-[var(--color-fg)] rounded-[var(--radius-admin-md)] focus-ring focus:border-[var(--color-border-focus)]"
      />
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="text-xs px-3 py-1 text-foreground-subtle hover:text-off-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            const trimmed = value.trim();
            if (trimmed) onSubmit(trimmed);
          }}
          disabled={disabled || !value.trim()}
          className="font-body font-semibold text-[13px] px-3 py-1 rounded-[var(--radius-admin-md)] bg-[var(--color-elevated)] hover:bg-[var(--color-raised)] text-[var(--color-fg)] border border-[var(--color-border-strong)] disabled:opacity-50"
        >
          Send reply
        </button>
      </div>
    </div>
  );
}

function ComposerModal({
  currentUserSlug,
  teammates,
  onClose,
  onSent,
}: {
  currentUserSlug: string;
  teammates: Teammate[];
  onClose: () => void;
  onSent: () => void;
}) {
  const firstOther = teammates.find((t) => t.slug !== currentUserSlug);
  const [assignedTo, setAssignedTo] = useState<string>(
    firstOther?.slug ?? ""
  );
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          sendAsRequest: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      onSent();
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
            Send task
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
              To
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[var(--color-sunken)] border border-[var(--color-border-strong)] text-[var(--color-fg)] rounded-[var(--radius-admin-md)] focus-ring focus:border-[var(--color-border-focus)]"
            >
              {teammates
                .filter((t) => t.slug !== currentUserSlug)
                .map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name} ({t.email})
                  </option>
                ))}
            </select>
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
              className="w-full px-3 py-2 text-sm bg-[var(--color-sunken)] border border-[var(--color-border-strong)] text-[var(--color-fg)] rounded-[var(--radius-admin-md)] focus-ring focus:border-[var(--color-border-focus)]"
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
              className="w-full px-3 py-2 text-sm bg-[var(--color-sunken)] border border-[var(--color-border-strong)] text-[var(--color-fg)] rounded-[var(--radius-admin-md)] focus-ring focus:border-[var(--color-border-focus)]"
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
              className="px-3 py-2 text-sm bg-[var(--color-sunken)] border border-[var(--color-border-strong)] text-[var(--color-fg)] rounded-[var(--radius-admin-md)] focus-ring focus:border-[var(--color-border-focus)]"
            />
          </div>
          {error && (
            <p className="text-xs text-[var(--color-bad)] bg-[var(--color-bad-tint)] border border-[var(--color-bad)]/30 rounded-[var(--radius-admin-md)] px-3 py-2">
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
            className="font-body font-semibold text-[13px] px-4 py-1.5 rounded-[var(--radius-admin-md)] bg-[var(--color-elevated)] hover:bg-[var(--color-raised)] text-[var(--color-fg)] border border-[var(--color-border-strong)] disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

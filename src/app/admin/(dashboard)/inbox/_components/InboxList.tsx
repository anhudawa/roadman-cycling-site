"use client";

import { useEffect, useState, useCallback } from "react";

const TEAM_MEMBERS = [
  { value: null, label: "Unassigned" },
  { value: "sarah", label: "Sarah" },
  { value: "wes", label: "Wes" },
  { value: "matthew", label: "Matthew" },
] as const;

interface Submission {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  readAt: string | null;
  assignedTo: string | null;
  createdAt: string;
}

export function InboxList() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/inbox");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions ?? []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const markAsRead = async (submission: Submission) => {
    setSelected(submission);
    setConfirmingDelete(false);

    if (!submission.readAt) {
      await fetch("/api/admin/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: submission.id }),
      });
      // Update local state
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submission.id ? { ...s, readAt: new Date().toISOString() } : s
        )
      );
      setSelected((prev) =>
        prev && prev.id === submission.id
          ? { ...prev, readAt: new Date().toISOString() }
          : prev
      );
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/inbox", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        setSelected(null);
        setConfirmingDelete(false);
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  };

  const handleAssign = async (id: number, assignedTo: string | null) => {
    const res = await fetch("/api/admin/inbox", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, assignedTo }),
    });
    if (res.ok) {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, assignedTo } : s))
      );
      setSelected((prev) =>
        prev && prev.id === id ? { ...prev, assignedTo } : prev
      );
    }
  };

  const unreadCount = submissions.filter((s) => !s.readAt).length;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHrs = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[var(--color-border-strong)] border-t-[var(--color-fg)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl text-off-white">INBOX</h1>
          <p className="text-sm text-foreground-muted mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-16 text-foreground-subtle">
          <svg
            className="w-12 h-12 mx-auto mb-4 opacity-30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z"
            />
          </svg>
          <p className="text-lg font-heading">NO MESSAGES YET</p>
          <p className="text-sm mt-1">Contact form submissions will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Message list */}
          <div className="lg:col-span-2 space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
            {submissions.map((s) => (
              <button
                key={s.id}
                onClick={() => markAsRead(s)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selected?.id === s.id
                    ? "bg-white/[0.04] border-[var(--color-border-strong)] border-l-2 border-l-[var(--color-coral)]"
                    : s.readAt
                      ? "bg-[var(--color-surface)]/50 border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                      : "bg-[var(--color-elevated)] border-[var(--color-border-strong)] border-l-2 border-l-[var(--color-coral)] hover:bg-[var(--color-raised)]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {!s.readAt && (
                      <span className="w-2 h-2 rounded-full bg-[var(--color-coral)] shrink-0" />
                    )}
                    <span
                      className={`text-sm truncate ${
                        s.readAt ? "text-foreground-muted" : "text-off-white font-medium"
                      }`}
                    >
                      {s.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.assignedTo && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-foreground-muted capitalize">
                        {s.assignedTo}
                      </span>
                    )}
                    <span className="text-xs text-foreground-subtle">
                      {formatDate(s.createdAt)}
                    </span>
                  </div>
                </div>
                <p
                  className={`text-xs mt-1 truncate ${
                    s.readAt ? "text-foreground-subtle" : "text-foreground-muted"
                  }`}
                >
                  {s.subject}
                </p>
                <p className="text-xs text-foreground-subtle mt-0.5 truncate">
                  {s.message.slice(0, 80)}
                </p>
              </button>
            ))}
          </div>

          {/* Message detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-background-elevated rounded-xl border border-white/5 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-heading text-xl text-off-white">
                      {selected.subject.toUpperCase()}
                    </h2>
                    <p className="text-sm text-foreground-muted mt-1">
                      From{" "}
                      <span className="text-off-white">{selected.name}</span>
                      {" "}&lt;{selected.email}&gt;
                    </p>
                    <p className="text-xs text-foreground-subtle mt-0.5">
                      {new Date(selected.createdAt).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                      className="px-4 py-2 bg-[var(--color-coral)] hover:bg-[var(--color-coral-hover)] text-white font-body font-semibold text-[14px] rounded-[var(--radius-admin-md)] transition-colors"
                    >
                      Reply
                    </a>
                  </div>
                </div>

                {/* Assign + Delete row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-foreground-muted">Assign to</label>
                    <select
                      value={selected.assignedTo ?? ""}
                      onChange={(e) =>
                        handleAssign(
                          selected.id,
                          e.target.value === "" ? null : e.target.value
                        )
                      }
                      className="text-xs bg-[var(--color-sunken)] border border-[var(--color-border-strong)] text-[var(--color-fg)] rounded-[var(--radius-admin-md)] px-2 py-1 focus-ring focus:border-[var(--color-border-focus)]"
                    >
                      {TEAM_MEMBERS.map((m) => (
                        <option key={m.label} value={m.value ?? ""}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Inline delete confirmation */}
                  <div className="flex items-center gap-1">
                    {confirmingDelete ? (
                      <>
                        <button
                          onClick={() => handleDelete(selected.id)}
                          disabled={deleting}
                          className="px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-medium rounded"
                        >
                          {deleting ? "Deleting..." : "Confirm"}
                        </button>
                        <button
                          onClick={() => setConfirmingDelete(false)}
                          disabled={deleting}
                          className="px-2 py-1 text-foreground-subtle hover:text-off-white text-xs"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmingDelete(true)}
                        className="px-3 py-1 text-foreground-subtle hover:text-red-400 text-xs transition-colors rounded border border-white/5 hover:border-red-400/30"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                <hr className="border-white/5 mb-4" />
                <div className="text-foreground-muted leading-relaxed whitespace-pre-wrap text-sm">
                  {selected.message}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-foreground-subtle text-sm">
                Select a message to read
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";

interface Submission {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export default function InboxPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

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
        <div className="w-6 h-6 border-2 border-coral/30 border-t-coral rounded-full animate-spin" />
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
                    ? "bg-coral/10 border-coral/30"
                    : s.readAt
                      ? "bg-background-elevated/50 border-white/5 hover:border-white/10"
                      : "bg-background-elevated border-coral/20 hover:border-coral/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {!s.readAt && (
                      <span className="w-2 h-2 rounded-full bg-coral shrink-0" />
                    )}
                    <span
                      className={`text-sm truncate ${
                        s.readAt ? "text-foreground-muted" : "text-off-white font-medium"
                      }`}
                    >
                      {s.name}
                    </span>
                  </div>
                  <span className="text-xs text-foreground-subtle shrink-0">
                    {formatDate(s.createdAt)}
                  </span>
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
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                    className="shrink-0 px-4 py-2 bg-coral text-white text-sm font-heading rounded-lg hover:bg-coral/90 transition-colors"
                  >
                    REPLY
                  </a>
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

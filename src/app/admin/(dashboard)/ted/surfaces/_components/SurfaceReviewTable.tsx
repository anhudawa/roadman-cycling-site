"use client";

import { useState } from "react";
import { wordDiff } from "@/lib/text/word-diff";

interface Row {
  id: number;
  skoolPostId: string;
  threadUrl: string;
  threadAuthor: string | null;
  threadTitle: string | null;
  threadBody: string | null;
  surfaceType: string;
  originalBody: string;
  editedBody: string | null;
  status: string;
  voiceCheck: Record<string, unknown> | null;
  createdAt: string;
}

const SURFACE_TYPE_PILL: Record<string, string> = {
  tag: "bg-violet-500/10 text-violet-300",
  link: "bg-blue-500/10 text-blue-300",
  summary: "bg-amber-500/10 text-amber-300",
};

function DiffView({ before, after }: { before: string; after: string }) {
  if (before === after)
    return (
      <div className="text-xs text-foreground-subtle italic">No edits.</div>
    );
  const tokens = wordDiff(before, after);
  return (
    <div className="text-xs font-mono whitespace-pre-wrap leading-relaxed">
      {tokens.map((t, i) => {
        if (t.kind === "kept") return <span key={i}>{t.token}</span>;
        if (t.kind === "removed")
          return (
            <span key={i} className="bg-[var(--color-bad-tint)] text-[var(--color-bad)] line-through">
              {t.token}
            </span>
          );
        return (
          <span key={i} className="bg-emerald-500/20 text-emerald-300">
            {t.token}
          </span>
        );
      })}
    </div>
  );
}

export function SurfaceReviewTable({ rows }: { rows: Row[] }) {
  const [items, setItems] = useState<Row[]>(rows);
  const [edits, setEdits] = useState<Record<number, string>>({});
  const [showDiff, setShowDiff] = useState<Record<number, boolean>>({});
  const [busy, setBusy] = useState<number | null>(null);

  async function call(id: number, action: "approve" | "edit" | "reject") {
    setBusy(id);
    try {
      const original = items.find((r) => r.id === id);
      const payload: Record<string, unknown> = { id, action };
      if (action === "edit") {
        payload.editedBody = edits[id] ?? original?.originalBody ?? "";
      }
      const res = await fetch("/api/admin/ted/surfaces", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Action failed: ${err.error ?? res.statusText}`);
        return;
      }
      setItems((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md bg-white/5 border border-white/10 p-6 text-sm text-foreground-subtle">
        Nothing awaiting review.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((r) => {
        const body = edits[r.id] ?? r.editedBody ?? r.originalBody;
        const flagged = r.status === "voice_flagged";
        const typePill = SURFACE_TYPE_PILL[r.surfaceType] ?? "bg-white/10 text-foreground-subtle";
        return (
          <div
            key={r.id}
            className={`rounded-md border p-4 ${
              flagged ? "bg-yellow-500/5 border-yellow-500/30" : "bg-white/5 border-white/10"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-foreground-subtle mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full ${typePill}`}>
                  {r.surfaceType}
                </span>
                <span>
                  replying to <span className="text-white">{r.threadAuthor ?? "(unknown)"}</span>
                </span>
                <a
                  href={r.threadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-300 hover:underline"
                >
                  open thread →
                </a>
              </div>
              <span>#{r.id}</span>
            </div>

            {r.threadTitle || r.threadBody ? (
              <div className="mb-2 text-xs border-l-2 border-white/10 pl-3 text-foreground-subtle">
                {r.threadTitle ? (
                  <div className="text-white">{r.threadTitle}</div>
                ) : null}
                {r.threadBody ? (
                  <div className="line-clamp-3">{r.threadBody}</div>
                ) : null}
              </div>
            ) : null}

            {flagged && r.voiceCheck ? (
              <div className="mb-2 rounded-md bg-yellow-500/10 border border-yellow-500/30 p-2 text-xs">
                <div className="font-semibold text-yellow-300 mb-1">
                  Voice-check failed.
                </div>
                {(() => {
                  const vc = r.voiceCheck as {
                    redFlags?: string[];
                    notes?: string;
                    regenerationNotes?: string;
                  };
                  return (
                    <div className="space-y-1 text-foreground-subtle">
                      {vc.redFlags && vc.redFlags.length > 0 ? (
                        <div>
                          <span className="text-yellow-200">Red flags:</span>{" "}
                          {vc.redFlags.join(", ")}
                        </div>
                      ) : null}
                      {vc.regenerationNotes ? (
                        <div>
                          <span className="text-yellow-200">Fix:</span>{" "}
                          {vc.regenerationNotes}
                        </div>
                      ) : null}
                    </div>
                  );
                })()}
              </div>
            ) : null}

            <textarea
              className="w-full min-h-[100px] rounded-md bg-charcoal border border-white/10 p-3 text-sm text-white font-mono"
              value={body}
              onChange={(e) =>
                setEdits((prev) => ({ ...prev, [r.id]: e.target.value }))
              }
              disabled={busy === r.id}
            />

            {body !== r.originalBody ? (
              <div className="mt-3">
                <button
                  onClick={() =>
                    setShowDiff((prev) => ({ ...prev, [r.id]: !prev[r.id] }))
                  }
                  className="text-xs text-foreground-subtle underline hover:text-white"
                >
                  {showDiff[r.id] ? "Hide" : "Show"} diff vs. original
                </button>
                {showDiff[r.id] ? (
                  <div className="mt-2 rounded-md bg-charcoal/50 border border-white/10 p-3">
                    <DiffView before={r.originalBody} after={body} />
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => call(r.id, "approve")}
                disabled={busy === r.id}
                className="text-sm rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 px-3 py-1.5 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => call(r.id, "edit")}
                disabled={busy === r.id || body === r.originalBody}
                className="text-sm rounded-md bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 px-3 py-1.5 disabled:opacity-50"
              >
                Save edit &amp; approve
              </button>
              <button
                onClick={() => call(r.id, "reject")}
                disabled={busy === r.id}
                className="text-sm rounded-md bg-[var(--color-bad-tint)] text-[var(--color-bad)] hover:bg-[var(--color-bad-tint)] px-3 py-1.5 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

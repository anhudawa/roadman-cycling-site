"use client";

import { useState } from "react";
import { wordDiff } from "@/lib/text/word-diff";

interface Row {
  id: number;
  pillar: string;
  scheduledFor: string;
  status: string;
  originalBody: string;
  editedBody: string | null;
  voiceCheck: Record<string, unknown> | null;
  generationAttempts: number;
  failureReason: string | null;
  createdAt: string;
}

function DiffView({ before, after }: { before: string; after: string }) {
  if (before === after) {
    return (
      <div className="text-xs text-foreground-subtle italic">No edits vs. original.</div>
    );
  }
  const tokens = wordDiff(before, after);
  return (
    <div className="text-xs font-mono whitespace-pre-wrap leading-relaxed">
      {tokens.map((t, idx) => {
        if (t.kind === "kept") return <span key={idx}>{t.token}</span>;
        if (t.kind === "removed")
          return (
            <span key={idx} className="bg-[var(--color-bad-tint)] text-[var(--color-bad)] line-through">
              {t.token}
            </span>
          );
        return (
          <span key={idx} className="bg-emerald-500/20 text-emerald-300">
            {t.token}
          </span>
        );
      })}
    </div>
  );
}

export function QueueTable({ rows }: { rows: Row[] }) {
  const [items, setItems] = useState<Row[]>(rows);
  const [edits, setEdits] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [showDiff, setShowDiff] = useState<Record<number, boolean>>({});

  async function call(id: number, action: "approve" | "edit" | "reject") {
    setBusy(id);
    try {
      const payload: Record<string, unknown> = { id, action };
      if (action === "edit") payload.editedBody = edits[id] ?? items.find((r) => r.id === id)?.originalBody ?? "";

      const res = await fetch("/api/admin/ted/drafts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Action failed: ${err.error ?? res.statusText}`);
        return;
      }
      // Remove from the list (or update status in place)
      setItems((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md bg-white/5 border border-white/10 p-6 text-sm text-foreground-subtle">
        No drafts in the queue.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((r) => {
        const body = edits[r.id] ?? r.editedBody ?? r.originalBody;
        const flagged = r.status === "voice_flagged";
        return (
          <div
            key={r.id}
            className={`rounded-md border p-4 ${
              flagged ? "bg-yellow-500/5 border-yellow-500/30" : "bg-white/5 border-white/10"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-foreground-subtle mb-2">
              <span>
                {r.pillar} $· scheduled {r.scheduledFor} $· status {r.status} $· attempts {r.generationAttempts}
              </span>
              <span>#{r.id}</span>
            </div>

            {flagged && r.voiceCheck ? (
              <div className="mb-2 rounded-md bg-yellow-500/10 border border-yellow-500/30 p-2 text-xs">
                <div className="font-semibold text-yellow-300 mb-1">
                  Voice-check failed after {r.generationAttempts} attempt
                  {r.generationAttempts === 1 ? "" : "s"}.
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
                      {vc.notes ? (
                        <div>
                          <span className="text-yellow-200">Notes:</span> {vc.notes}
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
              className="w-full min-h-[140px] rounded-md bg-charcoal border border-white/10 p-3 text-sm text-white font-mono"
              value={body}
              onChange={(e) => setEdits((prev) => ({ ...prev, [r.id]: e.target.value }))}
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

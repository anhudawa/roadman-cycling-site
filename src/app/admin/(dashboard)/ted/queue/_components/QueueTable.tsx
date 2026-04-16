"use client";

import { useState } from "react";

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

export function QueueTable({ rows }: { rows: Row[] }) {
  const [items, setItems] = useState<Row[]>(rows);
  const [edits, setEdits] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);

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
                {r.pillar} · scheduled {r.scheduledFor} · status {r.status} · attempts {r.generationAttempts}
              </span>
              <span>#{r.id}</span>
            </div>

            {flagged && r.voiceCheck ? (
              <div className="mb-2 text-xs text-yellow-300">
                Voice-check failed.{" "}
                <code>{JSON.stringify((r.voiceCheck as { redFlags?: string[] })?.redFlags ?? [])}</code>
              </div>
            ) : null}

            <textarea
              className="w-full min-h-[140px] rounded-md bg-charcoal border border-white/10 p-3 text-sm text-white font-mono"
              value={body}
              onChange={(e) => setEdits((prev) => ({ ...prev, [r.id]: e.target.value }))}
              disabled={busy === r.id}
            />

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
                className="text-sm rounded-md bg-coral/20 text-coral hover:bg-coral/30 px-3 py-1.5 disabled:opacity-50"
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

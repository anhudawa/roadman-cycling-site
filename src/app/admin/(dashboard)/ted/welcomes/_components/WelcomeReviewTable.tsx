"use client";

import { useState } from "react";
import { wordDiff } from "@/lib/text/word-diff";

interface Row {
  memberEmail: string;
  firstName: string;
  persona: string | null;
  status: string;
  draftBody: string | null;
  voiceCheck: Record<string, unknown> | null;
  failureReason: string | null;
  createdAt: string;
}

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

export function WelcomeReviewTable({ rows }: { rows: Row[] }) {
  const [items, setItems] = useState<Row[]>(rows);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [showDiff, setShowDiff] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function call(
    memberEmail: string,
    action: "approve" | "edit" | "reject"
  ) {
    setBusy(memberEmail);
    try {
      const payload: Record<string, unknown> = { memberEmail, action };
      const original = items.find((r) => r.memberEmail === memberEmail);
      if (action === "edit") {
        payload.editedBody = edits[memberEmail] ?? original?.draftBody ?? "";
      }
      const res = await fetch("/api/admin/ted/welcomes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Action failed: ${err.error ?? res.statusText}`);
        return;
      }
      setItems((prev) => prev.filter((r) => r.memberEmail !== memberEmail));
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md bg-white/5 border border-white/10 p-6 text-sm text-foreground-subtle">
        Nothing awaiting review right now.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((r) => {
        const original = r.draftBody ?? "";
        const body = edits[r.memberEmail] ?? original;
        const flagged = r.status === "failed";
        return (
          <div
            key={r.memberEmail}
            className={`rounded-md border p-4 ${
              flagged
                ? "bg-yellow-500/5 border-yellow-500/30"
                : "bg-white/5 border-white/10"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-foreground-subtle mb-2">
              <span>
                <span className="text-white">{r.firstName || "(no name)"}</span>{" "}
                $· persona: {r.persona ?? "listener"} $· status {r.status} $·
                joined{" "}
                {new Date(r.createdAt).toISOString().slice(0, 10)}
              </span>
              <span className="font-mono text-[10px]">{r.memberEmail}</span>
            </div>

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
              className="w-full min-h-[140px] rounded-md bg-charcoal border border-white/10 p-3 text-sm text-white font-mono"
              value={body}
              onChange={(e) =>
                setEdits((prev) => ({
                  ...prev,
                  [r.memberEmail]: e.target.value,
                }))
              }
              disabled={busy === r.memberEmail}
            />

            {body !== original ? (
              <div className="mt-3">
                <button
                  onClick={() =>
                    setShowDiff((prev) => ({
                      ...prev,
                      [r.memberEmail]: !prev[r.memberEmail],
                    }))
                  }
                  className="text-xs text-foreground-subtle underline hover:text-white"
                >
                  {showDiff[r.memberEmail] ? "Hide" : "Show"} diff vs. original
                </button>
                {showDiff[r.memberEmail] ? (
                  <div className="mt-2 rounded-md bg-charcoal/50 border border-white/10 p-3">
                    <DiffView before={original} after={body} />
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => call(r.memberEmail, "approve")}
                disabled={busy === r.memberEmail}
                className="text-sm rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 px-3 py-1.5 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => call(r.memberEmail, "edit")}
                disabled={busy === r.memberEmail || body === original}
                className="text-sm rounded-md bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 px-3 py-1.5 disabled:opacity-50"
              >
                Save edit &amp; approve
              </button>
              <button
                onClick={() => call(r.memberEmail, "reject")}
                disabled={busy === r.memberEmail}
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

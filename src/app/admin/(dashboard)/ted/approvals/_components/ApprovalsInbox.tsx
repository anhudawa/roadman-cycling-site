"use client";

import { useMemo, useState } from "react";
import { wordDiff } from "@/lib/text/word-diff";
import {
  itemCurrentBody,
  itemKey,
  itemOriginalBody,
  type ApprovalItem,
} from "./types";

const KIND_PILL: Record<string, string> = {
  prompt: "bg-blue-500/10 text-blue-300",
  welcome: "bg-emerald-500/10 text-emerald-300",
  surface: "bg-violet-500/10 text-violet-300",
};

const FILTER_TABS: Array<{ value: "all" | "prompt" | "welcome" | "surface"; label: string }> = [
  { value: "all", label: "All" },
  { value: "prompt", label: "Prompts" },
  { value: "welcome", label: "Welcomes" },
  { value: "surface", label: "Surfaces" },
];

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

export function ApprovalsInbox({ items: initial }: { items: ApprovalItem[] }) {
  const [items, setItems] = useState<ApprovalItem[]>(initial);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [showDiff, setShowDiff] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "prompt" | "welcome" | "surface">("all");

  const counts = useMemo(() => {
    const c = { prompt: 0, welcome: 0, surface: 0 };
    for (const it of items) c[it.kind] += 1;
    return c;
  }, [items]);

  const filtered = filter === "all" ? items : items.filter((i) => i.kind === filter);

  async function call(
    item: ApprovalItem,
    action: "approve" | "edit" | "reject"
  ) {
    const key = itemKey(item);
    setBusy(key);
    try {
      const editedBody = edits[key];
      let url: string;
      let payload: Record<string, unknown>;

      if (item.kind === "prompt") {
        url = "/api/admin/ted/drafts";
        payload = { id: item.id, action };
        if (action === "edit") payload.editedBody = editedBody ?? itemOriginalBody(item);
      } else if (item.kind === "welcome") {
        url = "/api/admin/ted/welcomes";
        payload = { memberEmail: item.memberEmail, action };
        if (action === "edit") payload.editedBody = editedBody ?? item.draftBody;
      } else {
        url = "/api/admin/ted/surfaces";
        payload = { id: item.id, action };
        if (action === "edit") payload.editedBody = editedBody ?? itemOriginalBody(item);
      }

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Action failed: ${err.error ?? res.statusText}`);
        return;
      }
      setItems((prev) => prev.filter((i) => itemKey(i) !== key));
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md bg-emerald-500/5 border border-emerald-500/20 p-6 text-sm text-emerald-300">
        Nothing waiting on you. Ted is caught up.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {FILTER_TABS.map((t) => {
          const count =
            t.value === "all" ? items.length : counts[t.value as "prompt" | "welcome" | "surface"];
          const active = filter === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 ${
                active
                  ? "bg-white/15 text-white"
                  : "bg-white/5 text-foreground-subtle hover:text-white hover:bg-white/10"
              }`}
            >
              {t.label}
              <span className="text-[10px] rounded-full bg-white/10 px-1.5 py-0.5">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md bg-white/5 border border-white/10 p-4 text-sm text-foreground-subtle">
          Nothing in this filter.
        </div>
      ) : (
        filtered.map((item) => {
          const key = itemKey(item);
          const original = itemOriginalBody(item);
          const currentBody = edits[key] ?? itemCurrentBody(item);
          const flagged =
            item.status === "voice_flagged" || item.status === "failed";
          const voice = item.voiceCheck as
            | { redFlags?: string[]; notes?: string; regenerationNotes?: string }
            | null;

          return (
            <div
              key={key}
              className={`rounded-md border p-4 ${
                flagged
                  ? "bg-yellow-500/5 border-yellow-500/30"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-center justify-between text-xs text-foreground-subtle mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-full ${KIND_PILL[item.kind]}`}
                  >
                    {item.kind}
                  </span>
                  <HeaderMeta item={item} />
                </div>
                <span className="font-mono text-[10px]">{key}</span>
              </div>

              {item.kind === "surface" && (item.threadTitle || item.threadBody) ? (
                <div className="mb-2 text-xs border-l-2 border-white/10 pl-3 text-foreground-subtle">
                  {item.threadTitle ? (
                    <div className="text-white">{item.threadTitle}</div>
                  ) : null}
                  {item.threadBody ? (
                    <div className="line-clamp-3">{item.threadBody}</div>
                  ) : null}
                </div>
              ) : null}

              {flagged && voice ? (
                <div className="mb-2 rounded-md bg-yellow-500/10 border border-yellow-500/30 p-2 text-xs">
                  <div className="font-semibold text-yellow-300 mb-1">
                    Voice-check failed.
                  </div>
                  <div className="space-y-1 text-foreground-subtle">
                    {voice.redFlags && voice.redFlags.length > 0 ? (
                      <div>
                        <span className="text-yellow-200">Red flags:</span>{" "}
                        {voice.redFlags.join(", ")}
                      </div>
                    ) : null}
                    {voice.regenerationNotes ? (
                      <div>
                        <span className="text-yellow-200">Fix:</span>{" "}
                        {voice.regenerationNotes}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <textarea
                className="w-full min-h-[120px] rounded-md bg-charcoal border border-white/10 p-3 text-sm text-white font-mono"
                value={currentBody}
                onChange={(e) =>
                  setEdits((prev) => ({ ...prev, [key]: e.target.value }))
                }
                disabled={busy === key}
              />

              {currentBody !== original ? (
                <div className="mt-3">
                  <button
                    onClick={() =>
                      setShowDiff((p) => ({ ...p, [key]: !p[key] }))
                    }
                    className="text-xs text-foreground-subtle underline hover:text-white"
                  >
                    {showDiff[key] ? "Hide" : "Show"} diff vs. original
                  </button>
                  {showDiff[key] ? (
                    <div className="mt-2 rounded-md bg-charcoal/50 border border-white/10 p-3">
                      <DiffView before={original} after={currentBody} />
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => call(item, "approve")}
                  disabled={busy === key}
                  className="text-sm rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 px-3 py-1.5 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => call(item, "edit")}
                  disabled={busy === key || currentBody === original}
                  className="text-sm rounded-md bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 px-3 py-1.5 disabled:opacity-50"
                >
                  Save edit &amp; approve
                </button>
                <button
                  onClick={() => call(item, "reject")}
                  disabled={busy === key}
                  className="text-sm rounded-md bg-[var(--color-bad-tint)] text-[var(--color-bad)] hover:bg-[var(--color-bad-tint)] px-3 py-1.5 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function HeaderMeta({ item }: { item: ApprovalItem }) {
  if (item.kind === "prompt") {
    return (
      <>
        <span className="text-white">{item.pillar}</span>
        <span>scheduled {item.scheduledFor}</span>
        <span>attempts {item.attempts}</span>
      </>
    );
  }
  if (item.kind === "welcome") {
    return (
      <>
        <span className="text-white">{item.firstName || "(no name)"}</span>
        <span>persona: {item.persona ?? "listener"}</span>
        <span className="font-mono text-[10px]">{item.memberEmail}</span>
      </>
    );
  }
  return (
    <>
      <span className="text-white">{item.surfaceType}</span>
      <span>
        replying to <span className="text-white">{item.threadAuthor ?? "(unknown)"}</span>
      </span>
      <a
        href={item.threadUrl}
        target="_blank"
        rel="noreferrer"
        className="text-blue-300 hover:underline"
      >
        open thread →
      </a>
    </>
  );
}

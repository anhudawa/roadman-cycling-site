"use client";

import { useState } from "react";

const PILLARS: Array<{ value: string; label: string }> = [
  { value: "auto", label: "Auto (today's pillar)" },
  { value: "monday", label: "Monday — Coaching" },
  { value: "tuesday", label: "Tuesday — Nutrition" },
  { value: "wednesday", label: "Wednesday — S&C" },
  { value: "thursday", label: "Thursday — Recovery" },
  { value: "friday", label: "Friday — Le Metier" },
  { value: "saturday", label: "Saturday — Podcast" },
  { value: "sunday", label: "Sunday — Weekend ride" },
];

export function GenerateDraftPanel() {
  const [pillar, setPillar] = useState("auto");
  const [busy, setBusy] = useState<null | "generate" | "seed">(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function generate() {
    setBusy("generate");
    setMsg(null);
    setErr(null);
    setPreview(null);
    try {
      const res = await fetch("/api/admin/ted/draft-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pillar === "auto" ? {} : { pillar }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.hint ?? data?.error ?? `Failed (${res.status})`);
        return;
      }
      setPreview(data.body);
      setMsg(
        `Ted drafted a ${data.pillar} post for ${data.scheduledFor}. It's in the inbox below. Reloading…`
      );
      setTimeout(() => window.location.reload(), 2200);
    } finally {
      setBusy(null);
    }
  }

  async function seed() {
    setBusy("seed");
    setMsg(null);
    setErr(null);
    setPreview(null);
    try {
      const res = await fetch("/api/admin/ted/seed-samples", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.hint ?? data?.error ?? `Failed (${res.status})`);
        return;
      }
      const ins = data?.inserted ?? {};
      setMsg(
        `Inserted ${ins.prompts ?? 0} prompts, ${ins.welcomes ?? 0} welcomes, ${ins.surfaces ?? 0} surfaces. Reloading…`
      );
      setTimeout(() => window.location.reload(), 1500);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-md bg-white/5 border border-white/10 p-4 space-y-4">
      <div>
        <div className="text-sm font-semibold text-white">
          Need something to review?
        </div>
        <div className="text-xs text-foreground-subtle mt-1">
          Ted&apos;s scheduled runs drop drafts in on their own (06:00 UTC
          daily for prompts). Two ways to get something in the inbox right now:
        </div>
      </div>

      <div className="rounded-md bg-charcoal/30 border border-white/5 p-3 space-y-2">
        <div className="text-xs font-semibold text-white">
          Generate a fresh draft now
        </div>
        <div className="text-xs text-foreground-subtle">
          Ted writes a new post end-to-end via Claude (Haiku, ~$0.01 per click)
          and drops it in the inbox with full voice-check. Pick a pillar or let
          Ted pick today&apos;s.
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <select
            value={pillar}
            onChange={(e) => setPillar(e.target.value)}
            disabled={busy !== null}
            className="text-xs rounded-md bg-charcoal border border-white/10 text-white px-2 py-1.5"
          >
            {PILLARS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <button
            onClick={generate}
            disabled={busy !== null}
            className="text-sm rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 px-3 py-1.5 disabled:opacity-50"
          >
            {busy === "generate" ? "Drafting…" : "Generate now"}
          </button>
        </div>
      </div>

      <div className="rounded-md bg-charcoal/30 border border-white/5 p-3 space-y-2">
        <div className="text-xs font-semibold text-white">Seed sample posts</div>
        <div className="text-xs text-foreground-subtle">
          Drops 21 pre-written examples into the inbox (12 prompts, 4 welcomes,
          5 surfaces) so you can try the approve / edit / reject flow without
          spending a cent. Safe to click twice — idempotent.
        </div>
        <button
          onClick={seed}
          disabled={busy !== null}
          className="text-sm rounded-md bg-white/10 text-white hover:bg-white/15 px-3 py-1.5 disabled:opacity-50"
        >
          {busy === "seed" ? "Seeding…" : "Seed samples"}
        </button>
      </div>

      {preview ? (
        <div className="rounded-md bg-white/5 border border-white/10 p-3 text-xs text-foreground-subtle">
          <div className="font-semibold text-white mb-2">
            Just generated:
          </div>
          <pre className="font-sans whitespace-pre-wrap text-xs">{preview}</pre>
        </div>
      ) : null}
      {msg ? <div className="text-xs text-emerald-300">{msg}</div> : null}
      {err ? <div className="text-xs text-[var(--color-bad)]">{err}</div> : null}
    </div>
  );
}

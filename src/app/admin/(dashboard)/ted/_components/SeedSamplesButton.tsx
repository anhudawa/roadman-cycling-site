"use client";

import { useState } from "react";

export function SeedSamplesButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function click() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/admin/ted/seed-samples", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(
          data?.hint ??
            data?.error ??
            `Failed (${res.status})`
        );
        return;
      }
      const ins = data?.inserted ?? {};
      setMsg(
        `Inserted ${ins.prompts ?? 0} prompts, ${ins.welcomes ?? 0} welcomes, ${ins.surfaces ?? 0} surfaces. Reloading$€¦`
      );
      setTimeout(() => window.location.reload(), 1200);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md bg-white/5 border border-white/10 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">
            Seed sample posts
          </div>
          <div className="text-xs text-foreground-subtle mt-1">
            Drops 7 daily prompts, 2 welcomes, and 3 thread surfaces into the
            queue so you can try approve / edit / reject without waiting for
            the first real agent run. Safe to click twice $€” it&apos;s idempotent.
          </div>
        </div>
        <button
          onClick={click}
          disabled={busy}
          className="text-sm rounded-md bg-white/10 text-white hover:bg-white/15 px-3 py-1.5 disabled:opacity-50 whitespace-nowrap"
        >
          {busy ? "Seeding$€¦" : "Seed samples"}
        </button>
      </div>
      {msg ? (
        <div className="text-xs text-emerald-300 mt-2">{msg}</div>
      ) : null}
      {err ? <div className="text-xs text-[var(--color-bad)] mt-2">{err}</div> : null}
    </div>
  );
}

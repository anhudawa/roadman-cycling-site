"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BackfillButton() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/crm/backfill", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMsg(
          `Processed ${data.contactsProcessed} rows, added ${data.activitiesAdded} activities`
        );
        router.refresh();
      } else {
        setMsg(data.error ?? "Backfill failed");
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Backfill failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={run}
        disabled={running}
        className="px-3 py-2 text-xs font-heading tracking-wider uppercase bg-background-elevated border border-white/10 text-off-white rounded hover:border-coral/40 transition-colors disabled:opacity-50"
      >
        {running ? "Running..." : "Run Backfill"}
      </button>
      {msg && <span className="text-xs text-foreground-muted">{msg}</span>}
    </div>
  );
}

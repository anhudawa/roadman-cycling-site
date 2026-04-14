"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EnrichAllButton() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setMsg("Enriching all contacts…");
    try {
      const res = await fetch("/api/admin/crm/enrich/all", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMsg(`Enriched ${data.enriched} contacts (${data.errors} errors)`);
        router.refresh();
      } else {
        setMsg(data.error ?? "Enrichment failed");
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Enrichment failed");
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
        {running ? "Enriching..." : "Enrich All"}
      </button>
      {msg && <span className="text-xs text-foreground-muted">{msg}</span>}
    </div>
  );
}

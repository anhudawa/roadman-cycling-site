"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EnrichAllButton() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setMsg("Enriching all contacts$€¦");
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
        className="px-3 py-2 font-body font-semibold text-[13px] bg-[var(--color-elevated)] border border-[var(--color-border)] text-[var(--color-fg)] rounded-[var(--radius-admin-md)] hover:border-[var(--color-border-strong)] transition-colors disabled:opacity-50"
      >
        {running ? "Enriching..." : "Enrich all"}
      </button>
      {msg && <span className="text-xs text-[var(--color-fg-muted)]">{msg}</span>}
    </div>
  );
}

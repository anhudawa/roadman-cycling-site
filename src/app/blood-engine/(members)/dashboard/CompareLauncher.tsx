"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

interface ReportRef {
  id: number;
  drawDate: string | null;
  createdAt: string | null;
}

export function CompareLauncher({ reports }: { reports: ReportRef[] }) {
  const router = useRouter();
  // Default to comparing the two most recent (reports come in newest-first).
  const [a, setA] = useState<number>(reports[1]?.id ?? reports[0]?.id ?? 0);
  const [b, setB] = useState<number>(reports[0]?.id ?? 0);

  const canCompare = a > 0 && b > 0 && a !== b;

  return (
    <div className="rounded-lg border border-white/10 bg-background-elevated p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-heading uppercase text-off-white text-lg mr-2">
          Compare two reports
        </h3>
        <select
          value={a}
          onChange={(e) => setA(Number(e.target.value))}
          className="bg-charcoal border border-white/10 rounded-md px-3 py-2 text-off-white text-sm"
          aria-label="Earlier report"
        >
          {reports.map((r) => (
            <option key={r.id} value={r.id}>
              #{r.id} · {r.drawDate ?? r.createdAt?.slice(0, 10) ?? "—"}
            </option>
          ))}
        </select>
        <span className="text-foreground-subtle text-sm">vs</span>
        <select
          value={b}
          onChange={(e) => setB(Number(e.target.value))}
          className="bg-charcoal border border-white/10 rounded-md px-3 py-2 text-off-white text-sm"
          aria-label="Later report"
        >
          {reports.map((r) => (
            <option key={r.id} value={r.id}>
              #{r.id} · {r.drawDate ?? r.createdAt?.slice(0, 10) ?? "—"}
            </option>
          ))}
        </select>
        <Button
          disabled={!canCompare}
          onClick={() => router.push(`/blood-engine/compare?ids=${a},${b}`)}
        >
          Compare →
        </Button>
      </div>
      {!canCompare ? (
        <p className="mt-2 text-xs text-foreground-subtle">Pick two different reports.</p>
      ) : null}
    </div>
  );
}

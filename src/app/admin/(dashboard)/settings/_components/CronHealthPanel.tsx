"use client";

import { useState } from "react";

type Status = "success" | "error" | "running" | "never";

interface Run {
  id: number;
  status: string;
  result?: Record<string, unknown> | null;
  error?: string | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface CronKindRow {
  kind: string;
  label: string;
  schedule: string;
  latest: Run | null;
  history: Run[];
  summary: string;
}

function toStatus(latest: Run | null): Status {
  if (!latest) return "never";
  if (latest.status === "success") return "success";
  if (latest.status === "error") return "error";
  return "running";
}

function pillClass(s: Status): string {
  if (s === "success") return "bg-emerald-500/10 text-emerald-300";
  if (s === "error") return "bg-red-500/10 text-red-300";
  if (s === "running") return "bg-amber-500/10 text-amber-300";
  return "bg-white/5 text-foreground-subtle";
}

function fmt(ts: string | null): string {
  if (!ts) return "$€”";
  try {
    return new Date(ts).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

function Row({ row }: { row: CronKindRow }) {
  const [open, setOpen] = useState(false);
  const status = toStatus(row.latest);
  return (
    <>
      <tr className="border-b border-white/5">
        <td className="px-4 py-3 text-off-white font-medium align-top">
          <div>{row.label}</div>
          <div className="text-[11px] text-foreground-subtle font-mono mt-0.5">
            {row.schedule}
          </div>
        </td>
        <td className="px-4 py-3 align-top">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium uppercase ${pillClass(
              status
            )}`}
          >
            {status}
          </span>
        </td>
        <td className="px-4 py-3 text-foreground-muted text-xs align-top">
          {fmt(row.latest?.startedAt ?? null)}
        </td>
        <td className="px-4 py-3 text-foreground-muted text-xs align-top">{row.summary}</td>
        <td className="px-4 py-3 text-xs align-top">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-[var(--color-bad)] hover:underline"
            disabled={row.history.length === 0}
          >
            {open ? "Hide" : `View history (${row.history.length})`}
          </button>
        </td>
      </tr>
      {open && row.history.length > 0 && (
        <tr className="border-b border-white/5 bg-white/[0.02]">
          <td colSpan={5} className="px-4 py-3">
            <div className="space-y-1">
              {row.history.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-[140px_90px_1fr] gap-3 text-[11px] text-foreground-muted"
                >
                  <span className="font-mono">{fmt(r.startedAt)}</span>
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-center ${pillClass(
                      r.status === "success"
                        ? "success"
                        : r.status === "error"
                        ? "error"
                        : "running"
                    )}`}
                  >
                    {r.status}
                  </span>
                  <span className="truncate">
                    {r.error
                      ? r.error
                      : r.result
                      ? JSON.stringify(r.result)
                      : "$€”"}
                  </span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function CronHealthPanel({ rows }: { rows: CronKindRow[] }) {
  return (
    <section>
      <h2 className="font-heading text-sm uppercase tracking-widest text-off-white mb-3">
        Cron Health
      </h2>
      <div className="bg-background-elevated border border-white/5 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr className="text-left text-[10px] uppercase tracking-widest text-foreground-subtle">
              <th className="px-4 py-3">Cron</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last run</th>
              <th className="px-4 py-3">Summary</th>
              <th className="px-4 py-3">History</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Row key={r.kind} row={r} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

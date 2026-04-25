"use client";

import { useEffect, useState } from "react";

interface Run {
  workflow: string;
  id: number;
  runNumber: number;
  status: string;
  conclusion: string | null;
  event: string;
  branch: string;
  createdAt: string;
  url: string;
}

interface Response {
  available: boolean;
  reason?: string;
  runs: Run[];
  fetchedAt?: string;
}

function relTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function statusPillClass(status: string, conclusion: string | null): string {
  if (status === "in_progress" || status === "queued")
    return "bg-blue-500/10 text-blue-300";
  if (conclusion === "success") return "bg-emerald-500/10 text-emerald-300";
  if (conclusion === "failure") return "bg-[var(--color-bad-tint)] text-[var(--color-bad)]";
  if (conclusion === "cancelled") return "bg-white/10 text-foreground-subtle";
  return "bg-yellow-500/10 text-yellow-300";
}

export function WorkflowRuns() {
  const [data, setData] = useState<Response | null>(null);

  useEffect(() => {
    fetch("/api/admin/ted/workflow-runs")
      .then((r) => r.json())
      .then((d) => setData(d as Response))
      .catch(() => setData({ available: false, reason: "unreachable", runs: [] }));
  }, []);

  if (data === null) {
    return (
      <div className="rounded-md bg-white/5 border border-white/10 p-4 text-xs text-foreground-subtle">
        Loading workflow runs$€¦
      </div>
    );
  }

  if (!data.available) {
    return (
      <div className="rounded-md bg-white/5 border border-white/10 p-4 text-xs text-foreground-subtle">
        Workflow runs unavailable: {data.reason}. Set{" "}
        <code className="px-1 rounded bg-white/5">GITHUB_TOKEN</code> and
        <code className="mx-1 px-1 rounded bg-white/5">GITHUB_REPO</code> in Vercel
        env to see recent runs inline.
      </div>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-2">Recent workflow runs</h2>
      <div className="rounded-md bg-white/5 border border-white/10 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-foreground-subtle uppercase tracking-wide">
              <th className="text-left p-2">Workflow</th>
              <th className="text-left p-2">Run</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">When</th>
              <th className="text-left p-2">Trigger</th>
              <th className="text-left p-2">Branch</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {data.runs.slice(0, 20).map((r) => (
              <tr key={r.id} className="border-t border-white/5">
                <td className="p-2 font-mono text-white">{r.workflow}</td>
                <td className="p-2 text-foreground-subtle">#{r.runNumber}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-0.5 rounded-full ${statusPillClass(
                      r.status,
                      r.conclusion
                    )}`}
                  >
                    {r.conclusion ?? r.status}
                  </span>
                </td>
                <td className="p-2 text-foreground-subtle whitespace-nowrap">
                  {relTime(r.createdAt)}
                </td>
                <td className="p-2 text-foreground-subtle">{r.event}</td>
                <td className="p-2 font-mono text-foreground-subtle text-[10px]">
                  {r.branch}
                </td>
                <td className="p-2">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-300 hover:underline"
                  >
                    open
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

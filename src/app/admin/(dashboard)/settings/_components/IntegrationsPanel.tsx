"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DigestTestButtons } from "./DigestTestButtons";

interface SyncRun {
  id: number;
  source: string;
  status: string;
  result: {
    scanned: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
  } | null;
  error: string | null;
  startedAt: string;
  finishedAt: string | null;
}

type Source = "beehiiv" | "stripe";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function statusColor(status: string): string {
  if (status === "success") return "bg-emerald-500/10 text-emerald-300";
  if (status === "error") return "bg-red-500/10 text-red-300";
  return "bg-amber-500/10 text-amber-300";
}

function summarize(r: SyncRun): string {
  if (!r.result) return r.error ? `error: ${r.error}` : r.status;
  const { created, updated, skipped, errors } = r.result;
  return `${created} created, ${updated} updated, ${skipped} skipped${
    errors ? `, ${errors} errors` : ""
  }`;
}

export function IntegrationsPanel() {
  const [runs, setRuns] = useState<SyncRun[]>([]);
  const [pending, setPending] = useState<Record<Source, boolean>>({
    beehiiv: false,
    stripe: false,
  });
  const [banner, setBanner] = useState<{
    source: Source;
    text: string;
    tone: "ok" | "err";
  } | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/crm/sync/runs", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      setRuns(json.runs ?? []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const anyRunning =
      pending.beehiiv ||
      pending.stripe ||
      runs.some((r) => r.status === "running");
    if (anyRunning) {
      if (!pollRef.current) {
        pollRef.current = setInterval(load, 5000);
      }
    } else if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [pending, runs, load]);

  async function triggerSync(source: Source) {
    setPending((p) => ({ ...p, [source]: true }));
    setBanner(null);
    try {
      const res = await fetch(`/api/admin/crm/sync/${source}`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setBanner({
          source,
          text: `${source}: ${json.error ?? "failed"}`,
          tone: "err",
        });
      } else {
        const r = json.result;
        setBanner({
          source,
          text: `${source}: ${r.created} created, ${r.updated} updated, ${r.skipped} skipped${
            r.errors ? `, ${r.errors} errors` : ""
          }`,
          tone: "ok",
        });
      }
    } catch (err) {
      setBanner({
        source,
        text: `${source}: ${err instanceof Error ? err.message : String(err)}`,
        tone: "err",
      });
    } finally {
      setPending((p) => ({ ...p, [source]: false }));
      load();
    }
  }

  const lastBySource = (s: Source): SyncRun | undefined =>
    runs.find((r) => r.source === s);
  const recent5 = runs.slice(0, 5);

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-sm uppercase tracking-widest text-off-white">
        Integrations
      </h2>

      {banner && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm ${
            banner.tone === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}
        >
          {banner.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(["beehiiv", "stripe"] as Source[]).map((source) => {
          const last = lastBySource(source);
          const busy = pending[source] || last?.status === "running";
          return (
            <div
              key={source}
              className="bg-background-elevated border border-white/5 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-off-white font-medium capitalize">
                  {source}
                </h3>
                {last && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${statusColor(
                      last.status
                    )}`}
                  >
                    {last.status.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-xs text-foreground-muted space-y-1 mb-3">
                <div>
                  Last sync:{" "}
                  {last
                    ? fmtDate(last.finishedAt ?? last.startedAt)
                    : "never"}
                </div>
                <div>
                  {last ? summarize(last) : "No runs yet"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => triggerSync(source)}
                disabled={busy}
                className="px-3 py-1.5 rounded text-xs font-medium bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed text-off-white"
              >
                {busy ? "Syncing…" : "Sync now"}
              </button>
            </div>
          );
        })}
      </div>

      <DigestTestButtons />

      <div>
        <h3 className="text-xs uppercase tracking-widest text-foreground-subtle mb-2">
          Recent runs
        </h3>
        <div className="bg-background-elevated border border-white/5 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr className="text-left text-[10px] uppercase tracking-widest text-foreground-subtle">
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Started</th>
                <th className="px-3 py-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {recent5.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-3 text-foreground-subtle"
                    colSpan={4}
                  >
                    No syncs yet
                  </td>
                </tr>
              )}
              {recent5.map((r) => (
                <tr key={r.id} className="border-b border-white/5">
                  <td className="px-3 py-2 text-off-white capitalize">
                    {r.source}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${statusColor(
                        r.status
                      )}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-foreground-muted">
                    {fmtDate(r.startedAt)}
                  </td>
                  <td className="px-3 py-2 text-foreground-muted">
                    {summarize(r)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default IntegrationsPanel;

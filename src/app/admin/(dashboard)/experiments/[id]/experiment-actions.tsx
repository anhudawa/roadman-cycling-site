"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ABTestStatus, ABVariant } from "@/lib/ab/types";

type ConfirmingAction = "stop" | "declare_winner" | null;

export default function ExperimentActions({
  experimentId,
  status,
  variants,
}: {
  experimentId: string;
  status: ABTestStatus;
  variants: ABVariant[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<ConfirmingAction>(null);
  const [selectedWinner, setSelectedWinner] = useState<string>(
    variants[0]?.id ?? ""
  );

  if (status === "completed") return null;

  async function callAction(action: string, extra?: Record<string, string>) {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch("/api/admin/experiments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: experimentId, action, ...extra }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }
      setConfirming(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  const busy = loading !== null;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-3">
        {status === "draft" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => callAction("start")}
            className="px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm font-medium rounded-lg transition-colors border border-green-500/20 disabled:opacity-50"
          >
            {loading === "start" ? (
              <Spinner />
            ) : (
              "Start Test"
            )}
          </button>
        )}

        {status === "running" && (
          <>
            {confirming === "stop" ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-foreground-muted">Are you sure?</span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => callAction("stop")}
                  className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-medium rounded-lg transition-colors border border-red-500/20 disabled:opacity-50"
                >
                  {loading === "stop" ? <Spinner /> : "Confirm"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirming(null)}
                  className="px-3 py-1.5 bg-white/5 text-foreground-subtle hover:text-off-white text-xs font-medium rounded-lg transition-colors border border-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirming("stop")}
                className="px-4 py-2 bg-white/5 text-foreground-muted hover:text-off-white text-sm font-medium rounded-lg transition-colors border border-white/10 disabled:opacity-50"
              >
                Stop Test
              </button>
            )}

            {confirming === "declare_winner" ? (
              <div className="flex items-center gap-2 text-sm">
                <select
                  value={selectedWinner}
                  onChange={(e) => setSelectedWinner(e.target.value)}
                  className="bg-background-elevated border border-white/10 text-off-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-coral/50"
                >
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={busy || !selectedWinner}
                  onClick={() =>
                    callAction("declare_winner", {
                      winnerVariantId: selectedWinner,
                    })
                  }
                  className="px-3 py-1.5 bg-coral/20 text-coral hover:bg-coral/30 text-xs font-medium rounded-lg transition-colors border border-coral/20 disabled:opacity-50"
                >
                  {loading === "declare_winner" ? <Spinner /> : "Confirm"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirming(null)}
                  className="px-3 py-1.5 bg-white/5 text-foreground-subtle hover:text-off-white text-xs font-medium rounded-lg transition-colors border border-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirming("declare_winner")}
                className="px-4 py-2 bg-coral/20 text-coral hover:bg-coral/30 text-sm font-medium rounded-lg transition-colors border border-coral/20 disabled:opacity-50"
              >
                Declare Winner
              </button>
            )}
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 inline-block"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

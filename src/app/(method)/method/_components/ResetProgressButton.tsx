"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface ResetProgressButtonProps {
  completedCount: number;
}

/**
 * Two-step destructive action: first click reveals confirmation copy
 * and a real "yes, reset" button; second click POSTs the wipe. The
 * outcome is one DELETE per row in `method_progress` for the active
 * enrollment — modules themselves are never touched.
 *
 * No-ops cleanly when nothing is completed yet.
 */
export function ResetProgressButton({ completedCount }: ResetProgressButtonProps) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (completedCount === 0) {
    return (
      <p className="text-sm text-foreground-muted">
        No completions to reset yet — the module log is empty.
      </p>
    );
  }

  async function reset() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/method/progress", {
        method: "DELETE",
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        setError(payload.error ?? "Could not reset.");
        return;
      }
      setArmed(false);
      startTransition(() => router.refresh());
    } catch {
      setError("Network error — please try again.");
    } finally {
      setPending(false);
    }
  }

  if (!armed) {
    return (
      <div className="grid gap-2">
        <button
          type="button"
          onClick={() => setArmed(true)}
          className="self-start inline-flex items-center gap-2 rounded-md border border-white/15 hover:border-coral hover:text-coral px-4 py-2 text-sm font-heading uppercase tracking-wider transition-colors cursor-pointer active:scale-[0.97]"
        >
          Reset module progress
        </button>
        <p className="text-xs text-foreground-muted">
          Wipes your completion log. The modules themselves stay open — only the
          ✓ marks get cleared.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-coral/40 bg-coral/10 p-4">
      <p className="font-heading uppercase tracking-wider text-sm text-coral mb-2">
        Reset {completedCount} {completedCount === 1 ? "completion" : "completions"}?
      </p>
      <p className="text-sm text-foreground-muted mb-4">
        This clears every ✓ on your dashboard. Module access stays the same. You
        can re-mark them as you re-work them.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={reset}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md bg-coral hover:bg-coral-hover disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2 text-sm font-heading uppercase tracking-wider text-off-white transition-all active:scale-[0.97]"
        >
          {pending ? "Resetting..." : "Yes, reset"}
        </button>
        <button
          type="button"
          onClick={() => setArmed(false)}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md border border-white/20 hover:border-off-white px-4 py-2 text-sm font-heading uppercase tracking-wider transition-colors active:scale-[0.97]"
        >
          Cancel
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-xs text-coral">
          {error}
        </p>
      )}
    </div>
  );
}

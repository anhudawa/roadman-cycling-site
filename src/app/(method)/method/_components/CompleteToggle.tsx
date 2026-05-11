"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface CompleteToggleProps {
  moduleSlug: string;
  initialComplete: boolean;
}

/**
 * Mark-complete control. Optimistic UI: the local state flips
 * immediately; if the API rejects (e.g. drip lock), we revert and
 * surface the error.
 *
 * `router.refresh()` re-pulls the parent server components so the
 * dashboard's progress ring and module nav reflect the new state on
 * the user's next navigation back.
 */
export function CompleteToggle({
  moduleSlug,
  initialComplete,
}: CompleteToggleProps) {
  const [complete, setComplete] = useState(initialComplete);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function toggle() {
    const next = !complete;
    setComplete(next);
    setError(null);

    try {
      const res = await fetch("/api/method/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleSlug,
          action: next ? "complete" : "uncomplete",
        }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setComplete(!next);
        setError(payload.error ?? "Could not save. Try again.");
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setComplete(!next);
      setError("Network error — please try again.");
    }
  }

  return (
    <section className="rounded-lg border border-white/10 bg-charcoal/60 p-5">
      <h2 className="font-heading uppercase tracking-wider text-sm text-coral mb-3">
        Progress
      </h2>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={complete}
        className={`w-full inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 font-heading uppercase tracking-wider transition-all cursor-pointer active:scale-[0.97] ${
          complete
            ? "bg-coral/15 text-coral border border-coral/40"
            : "bg-coral text-off-white hover:bg-coral-hover shadow-[var(--shadow-glow-coral)]"
        }`}
      >
        {complete ? "✓ Complete" : "Mark complete"}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-xs text-coral">
          {error}
        </p>
      )}
    </section>
  );
}

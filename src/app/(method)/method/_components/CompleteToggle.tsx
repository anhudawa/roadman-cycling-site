"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CompletionBurst } from "./CompletionBurst";

interface CompleteToggleProps {
  moduleSlug: string;
  initialComplete: boolean;
}

/**
 * Mark-complete control. Optimistic UI: the local state flips
 * immediately; if the API rejects (e.g. drip lock), we revert and
 * surface the error.
 *
 * On a fresh complete (false → true) we fire CompletionBurst — a
 * coral-particle burst with a check-mark scale-in — so the moment
 * actually feels earned. The burst is one-shot per click; flipping
 * uncomplete is silent.
 *
 * `router.refresh()` re-pulls the parent server components so the
 * dashboard's progress ring and module nav reflect the new state on
 * the next render.
 */
export function CompleteToggle({
  moduleSlug,
  initialComplete,
}: CompleteToggleProps) {
  const [complete, setComplete] = useState(initialComplete);
  const [error, setError] = useState<string | null>(null);
  const [bursting, setBursting] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function toggle() {
    const next = !complete;
    setComplete(next);
    setError(null);
    if (next) {
      setBursting(true);
      window.setTimeout(() => setBursting(false), 1100);
    }

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
        setBursting(false);
        setError(payload.error ?? "Could not save. Try again.");
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setComplete(!next);
      setBursting(false);
      setError("Network error — please try again.");
    }
  }

  return (
    <section className="relative rounded-xl border border-white/10 bg-charcoal/60 p-5">
      <h2 className="font-heading uppercase tracking-wider text-sm text-coral mb-3">
        Progress
      </h2>
      <div className="relative">
        <CompletionBurst show={bursting} />
        <button
          type="button"
          onClick={toggle}
          aria-pressed={complete}
          className={`relative w-full inline-flex items-center justify-center gap-2 rounded-md px-5 py-3.5 font-heading uppercase tracking-wider transition-all cursor-pointer active:scale-[0.97] ${
            complete
              ? "bg-coral/15 text-coral border border-coral/40"
              : "bg-coral text-off-white hover:bg-coral-hover shadow-[var(--shadow-glow-coral)]"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {complete ? (
              <motion.span
                key="done"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="inline-flex items-center gap-2"
              >
                <CheckIcon /> Module complete
              </motion.span>
            ) : (
              <motion.span
                key="todo"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                Mark complete
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      <p className="mt-3 text-[11px] text-foreground-muted">
        {complete
          ? "Logged. Your dashboard updates next time you swing by."
          : "Mark it done when you've worked the protocol — not just watched the video."}
      </p>
      {error && (
        <p role="alert" className="mt-3 text-xs text-coral">
          {error}
        </p>
      )}
    </section>
  );
}

function CheckIcon() {
  return (
    <motion.svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      aria-hidden
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.4, ease: "backOut" }}
    >
      <motion.path
        d="M3 8.5 L7 12 L13.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui";

/**
 * Waiting-list signup form for the pre-launch Blood Engine landing page.
 *
 * Posts to /api/blood-engine/waitlist; on success swaps the form for a
 * confirmation message. `variant` controls the surrounding layout — the
 * hero uses "primary" (large), the pricing section uses "secondary"
 * (compact).
 */
interface Props {
  variant?: "primary" | "secondary";
  /** Optional source tag passed to the API so we can attribute signups. */
  source?: string;
}

export function WaitlistForm({ variant = "primary", source = "landing" }: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [isNew, setIsNew] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/blood-engine/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      setIsNew(!!data.isNew);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div
        role="status"
        className="rounded-lg border border-coral/30 bg-coral-muted p-5 text-left text-off-white"
      >
        <p className="font-heading uppercase tracking-wider text-coral mb-2">
          {isNew ? "You're in" : "Already on the list"}
        </p>
        <p className="text-sm">
          {isNew
            ? "We'll email you the moment Blood Engine opens. Launch pricing is locked in for everyone on this list."
            : "You were already on the waiting list. We'll email when Blood Engine opens — no action needed."}
        </p>
      </div>
    );
  }

  const compact = variant === "secondary";

  return (
    <form
      onSubmit={onSubmit}
      className={compact ? "flex gap-2 flex-wrap sm:flex-nowrap" : "space-y-3"}
      aria-label="Join the Blood Engine waiting list"
    >
      <label className={compact ? "flex-1 min-w-[220px]" : "block"}>
        <span className="sr-only">Email address</span>
        <input
          type="email"
          autoComplete="email"
          required
          inputMode="email"
          placeholder="you@example.com"
          disabled={state === "loading"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-md bg-background-elevated border border-white/10 text-off-white focus:border-coral focus:outline-none disabled:opacity-50"
        />
      </label>
      <Button
        type="submit"
        size={compact ? "md" : "lg"}
        className={compact ? "shrink-0" : "w-full"}
        disabled={state === "loading"}
      >
        {state === "loading" ? "Joining…" : "Join the waiting list"}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-coral">
          {error}
        </p>
      ) : null}
    </form>
  );
}

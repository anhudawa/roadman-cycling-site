"use client";

import { useState } from "react";
import Link from "next/link";

/** One-tap join on the league share-link landing page. */
export function JoinLeagueButton({ code }: { code: string }) {
  const [state, setState] = useState<"idle" | "joining" | "joined" | "unauthed" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function join() {
    setState("joining");
    try {
      const response = await fetch("/api/fantasy/leagues/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (response.status === 401 || response.status === 404) {
        setState("unauthed");
        return;
      }
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "Couldn't join. Try again.");
        setState("error");
        return;
      }
      setState("joined");
    } catch {
      setMessage("Network dropped. Try again.");
      setState("error");
    }
  }

  if (state === "joined") {
    return (
      <p className="font-heading tracking-widest text-jersey-yellow">
        YOU&apos;RE IN.{" "}
        <Link href="/fantasy/team" className="underline">
          BACK TO MY TEAM
        </Link>
      </p>
    );
  }
  if (state === "unauthed") {
    return (
      <p className="text-sm text-off-white/75">
        Sign in first —{" "}
        <Link href="/fantasy/team" className="text-jersey-yellow underline">
          get your one-tap link
        </Link>
        , then come back to this page.
      </p>
    );
  }
  return (
    <div>
      <button
        type="button"
        onClick={join}
        disabled={state === "joining"}
        className="rounded-md bg-jersey-yellow px-6 py-3 font-heading tracking-[0.15em] text-charcoal transition-colors hover:bg-jersey-yellow-deep disabled:opacity-60"
      >
        {state === "joining" ? "JOINING…" : "JOIN THIS LEAGUE"}
      </button>
      {message && (
        <p role="alert" className="mt-2 text-sm text-bad">
          {message}
        </p>
      )}
    </div>
  );
}

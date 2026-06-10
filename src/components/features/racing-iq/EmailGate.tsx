"use client";

import { useState } from "react";
import { racingIqAnalytics } from "@/lib/racing-iq/analytics";
import { MetaPixel } from "@/components/features/diagnostic/MetaPixel";

export type GateStatus = "idle" | "submitting" | "captured" | "failed";

/**
 * The narrative break after scenario 3. One field, one CTA. If the
 * POST fails the player rides on anyway — the result is never held
 * hostage to an API error (capture retries on the result screen).
 */
export async function submitRacingIqEmail(
  email: string,
  where: "gate" | "result"
): Promise<boolean> {
  try {
    const res = await fetch("/api/racing-iq/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        sessionId: racingIqAnalytics.sessionId(),
        where,
      }),
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { subscribed?: boolean };
    return json.subscribed === true;
  } catch {
    return false;
  }
}

export function EmailGate({
  onDone,
}: {
  /** Called with the capture result; the game continues either way. */
  onDone: (captured: boolean, email: string | null) => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<GateStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("That email doesn't look right.");
      return;
    }
    setError(null);
    setStatus("submitting");
    const ok = await submitRacingIqEmail(trimmed, "gate");
    if (ok) {
      racingIqAnalytics.emailCaptured("gate");
      setStatus("captured");
      setTimeout(() => onDone(true, trimmed), 600);
    } else {
      // Graceful path: never block the race on an API error.
      setStatus("failed");
      setTimeout(() => onDone(false, trimmed), 1200);
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex items-end justify-center sm:items-center">
      <div className="riq-lower-third-in mx-4 mb-14 w-full max-w-lg sm:mb-0">
        <div className="border-l-[3px] border-coral bg-charcoal/90 p-5 backdrop-blur-md sm:p-7">
          <p className="font-heading text-xs tracking-[0.3em] text-coral">
            KM 55 · THE RACE IS ABOUT TO SPLIT
          </p>
          <h2 className="mt-2 font-heading text-3xl uppercase leading-none tracking-wide text-off-white sm:text-4xl">
            Where do you want the story sent?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-off-white/75">
            The crosswinds, the climb, the finale — and your Racing IQ
            profile at the end of it. Drop your email and ride on.
          </p>

          {status === "captured" ? (
            <>
              <MetaPixel event="Lead" eventParams={{ content_name: "racing-iq" }} />
              <p className="mt-5 font-heading text-lg uppercase tracking-wide text-coral" role="status">
                In the pocket. Back to the race.
              </p>
            </>
          ) : status === "failed" ? (
            <p className="mt-5 text-sm text-off-white/75" role="status">
              Our soigneur missed the hand-off — we’ll try again at the
              finish. Back to the race.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-5">
              <label htmlFor="riq-email" className="sr-only">
                Email address
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="riq-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-w-0 flex-1 border border-off-white/25 bg-deep-purple/60 px-3.5 py-3 text-[15px] text-off-white placeholder:text-off-white/35 focus:border-coral focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="shrink-0 bg-coral px-5 py-3 font-heading text-base uppercase tracking-[0.18em] text-off-white transition-colors hover:bg-coral-hover disabled:opacity-60"
                >
                  {status === "submitting" ? "Sending…" : "Send it"}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-xs text-coral" role="alert">
                  {error}
                </p>
              )}
              <p className="mt-3 text-[11px] leading-relaxed text-off-white/40">
                One email list, the Roadman one. Unsubscribe whenever.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

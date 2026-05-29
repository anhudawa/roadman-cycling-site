"use client";

import { useState } from "react";

interface AskGateProps {
  /** Called by the parent once the email is submitted successfully so
   *  the gate can swap to the "check your inbox" state. */
  onSubmitted?: (email: string) => void;
  /** Surface auth=invalid from a verify-link redirect. */
  initialError?: string | null;
}

/**
 * Lead-gen gate for /ask. Anyone can use Ask Roadman — but they have
 * to give us their email first. The email gets a magic link; clicking
 * it sets a 7-day session cookie and syncs the address to Beehiiv.
 */
export function AskGate({ onSubmitted, initialError }: AskGateProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError ?? null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMsg("Enter your email to continue.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/ask/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (res.status === 429) {
        setErrorMsg("Hold up — too many requests. Try again in a minute.");
        setStatus("error");
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMsg(body.error ?? "Something went wrong. Try again.");
        setStatus("error");
        return;
      }
      setStatus("sent");
      onSubmitted?.(trimmed);
    } catch {
      setErrorMsg("Network error. Try again in a moment.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="pt-6 pb-12 max-w-2xl">
        <p className="font-heading text-coral tracking-widest text-xs uppercase mb-3">
          Check your inbox
        </p>
        <h2
          className="font-heading text-off-white leading-[0.95] mb-4"
          style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}
        >
          MAGIC LINK ON THE WAY.
        </h2>
        <p className="text-foreground-muted text-base leading-relaxed mb-2">
          We just emailed{" "}
          <span className="text-off-white">{email}</span> a one-tap sign-in link.
          It works once and expires in 15 minutes.
        </p>
        <p className="text-foreground-subtle text-sm leading-relaxed">
          Not there? Check spam, or{" "}
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setErrorMsg(null);
            }}
            className="text-coral underline-offset-2 hover:underline"
          >
            try a different email
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-12">
      <div
        className="rounded-xl p-6 md:p-8"
        style={{
          background:
            "linear-gradient(180deg, rgba(76,18,115,0.32) 0%, rgba(76,18,115,0.12) 60%, rgba(255,255,255,0.02) 100%)",
          border: "1px solid rgba(241,99,99,0.18)",
        }}
      >
        <p className="font-heading text-coral tracking-widest text-xs uppercase mb-3">
          Free — email required
        </p>
        <h2
          className="font-heading text-off-white leading-[0.95] mb-4"
          style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}
        >
          ASK ANY CYCLING QUESTION.
          <br />
          ENTER YOUR EMAIL TO GET STARTED.
        </h2>
        <p className="text-foreground-muted text-base leading-relaxed mb-6 max-w-2xl">
          You get on-the-record answers grounded in 1,400+ podcast conversations
          with World Tour coaches, sports scientists, and pro cyclists. We add
          you to the Saturday Spin newsletter — straight talk on training,
          fuelling, and recovery, once a week.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-xl">
          <input
            type="email"
            required
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") {
                setStatus("idle");
                setErrorMsg(null);
              }
            }}
            placeholder="you@example.com"
            disabled={status === "submitting"}
            aria-label="Email address"
            className="flex-1 min-w-0 bg-white/[0.05] border border-white/15 focus:border-coral/60 focus:bg-white/[0.08] rounded-md px-4 py-3 min-h-[48px] text-off-white placeholder:text-foreground-subtle outline-none transition-colors disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={status === "submitting" || email.trim().length < 3}
            className="shrink-0 whitespace-nowrap font-heading tracking-wider uppercase text-sm bg-coral hover:bg-coral-hover disabled:opacity-50 disabled:cursor-not-allowed text-charcoal px-6 py-3 min-h-[48px] rounded-md transition-colors"
          >
            {status === "submitting" ? "Sending…" : "Send magic link"}
          </button>
        </form>

        {errorMsg ? (
          <p className="mt-3 text-sm text-red-300" role="alert">
            {errorMsg}
          </p>
        ) : (
          <p className="mt-3 text-foreground-subtle text-xs leading-relaxed">
            No password. We email a one-tap link that signs you in for 7 days.
            Unsubscribe anytime.
          </p>
        )}
      </div>

      <p className="mt-6 text-foreground-subtle text-xs leading-relaxed max-w-xl">
        Roadman can be wrong. For medical, injury, or extreme-weight questions,
        see a professional first.
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

interface PredictionGateProps {
  slug: string;
  /** What's hidden behind the gate — used to set expectations. */
  hiddenItems?: string[];
}

const DEFAULT_ITEMS = [
  "Climb-by-climb pacing breakdown",
  "Equipment & training scenario deltas",
  "Shareable Instagram / WhatsApp card",
  "$29 Race Report unlock + nurture sequence",
];

/**
 * Free-tier email gate.
 *
 * Sits between the predicted-time hero + key insight (free preview) and the
 * full breakdown (climbs, scenarios, share card, upgrade). On submit, posts
 * to /api/predict/[slug]/unlock to record the lead, then refreshes the
 * server component so the gate dissolves and the rest of the result reveals.
 */
export function PredictionGate({
  slug,
  hiddenItems = DEFAULT_ITEMS,
}: PredictionGateProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("That email doesn't look right — double-check?");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/predict/${slug}/unlock`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, firstName: firstName.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Couldn't unlock — try again in a moment.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network issue — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-coral/30 bg-gradient-to-br from-coral/8 via-deep-purple/40 to-charcoal p-6 md:p-10">
      {/* Aurora */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div
          className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(241,99,99,0.45), transparent 65%)" }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(76,18,115,0.6), transparent 65%)" }}
        />
      </div>

      <div className="relative grid lg:grid-cols-[1.1fr_1fr] gap-8 items-center">
        {/* Left: pitch */}
        <div>
          <p
            className="text-[0.65rem] tracking-[0.25em] uppercase text-coral mb-3"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            UNLOCK · FREE
          </p>
          <h2 className="font-heading text-3xl md:text-4xl uppercase tracking-tight text-off-white leading-tight mb-4">
            See the climb-by-climb breakdown
          </h2>
          <p className="text-off-white/85 text-base md:text-lg leading-relaxed mb-5">
            We&apos;ve shown you the predicted time and the headline insight. The
            full breakdown — climbs, scenario deltas, and your shareable card —
            unlocks with your email so we can send it through.
          </p>
          <ul className="space-y-2 mb-2">
            {hiddenItems.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-off-white/85"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F16363"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0 mt-0.5"
                  aria-hidden
                >
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: form */}
        <form
          onSubmit={onSubmit}
          className="rounded-xl border border-white/10 bg-charcoal/70 backdrop-blur-md p-5 md:p-6"
        >
          <p
            className="text-[0.62rem] tracking-[0.22em] uppercase text-foreground-muted mb-3"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            UNLOCK MY BREAKDOWN
          </p>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="gate-firstname"
                className="text-[0.6rem] tracking-[0.2em] uppercase text-foreground-subtle mb-1 block"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                First name
              </label>
              <input
                id="gate-firstname"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Optional"
                maxLength={80}
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-off-white placeholder:text-foreground-subtle focus:border-coral focus:outline-none text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="gate-email"
                className="text-[0.6rem] tracking-[0.2em] uppercase text-foreground-subtle mb-1 block"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                Email <span className="text-coral">*</span>
              </label>
              <input
                id="gate-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                maxLength={200}
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-off-white placeholder:text-foreground-subtle focus:border-coral focus:outline-none text-sm"
              />
            </div>
            {error && (
              <p
                className="text-coral text-xs"
                role="alert"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={submitting || email.trim().length === 0}
              dataTrack="predict_gate_unlock"
            >
              {submitting ? "Unlocking…" : "Unlock the full breakdown →"}
            </Button>
            <p
              className="text-[0.6rem] tracking-[0.18em] uppercase text-foreground-subtle text-center"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              No spam · Unsubscribe any time
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

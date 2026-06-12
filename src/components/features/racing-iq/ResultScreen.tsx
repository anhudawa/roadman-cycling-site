"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { DecisionRecord, GameResult } from "@/lib/racing-iq/types";
import { SCENARIOS } from "@/lib/racing-iq/scenarios";
import { racingIqAnalytics } from "@/lib/racing-iq/analytics";
import { downloadShareCard, renderShareCard } from "./share-card";
import { submitRacingIqEmail } from "./EmailGate";
import { MetaPixel } from "@/components/features/diagnostic/MetaPixel";

function AxisBar({ label, value, delay }: { label: string; value: number; delay: number }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="font-heading text-sm uppercase tracking-[0.2em] text-off-white">
          {label}
        </p>
        <p className="font-heading text-xl text-coral">{value}</p>
      </div>
      <div className="mt-1 h-2 w-full bg-off-white/10">
        <div
          className="h-full bg-coral transition-[width] duration-1000 ease-out"
          style={{ width: shown ? `${value}%` : "0%" }}
        />
      </div>
    </div>
  );
}

/** The tape: every call the player made, km by km, with the spend. */
function DecisionLedger({ decisions }: { decisions: DecisionRecord[] }) {
  const rows = decisions
    .map((d) => {
      const scenario = SCENARIOS.find((s) => s.id === d.scenarioId);
      const option = scenario?.options.find((o) => o.id === d.optionId);
      if (!scenario || !option) return null;
      return {
        km: scenario.km,
        title: scenario.title,
        label: option.label,
        spent: Math.max(0, d.matchesBefore - d.matchesAfter),
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
  if (!rows.length) return null;
  return (
    <div className="mt-4 border border-off-white/15 bg-charcoal/80 p-5 backdrop-blur-md">
      <p className="font-heading text-xs tracking-[0.3em] text-coral">THE TAPE</p>
      <ol className="mt-3 space-y-2.5">
        {rows.map((row, i) => (
          <li key={i} className="flex items-baseline gap-3 text-sm">
            <span className="w-14 shrink-0 font-heading tracking-[0.12em] text-off-white/45">
              KM {row.km}
            </span>
            <span className="min-w-0 flex-1 leading-snug">
              <span className="text-off-white/55">{row.title} — </span>
              <span className="text-off-white">{row.label}</span>
            </span>
            <span
              className="shrink-0 font-heading text-xs tracking-[0.15em] text-coral/90"
              aria-label={row.spent > 0 ? `${row.spent} matches spent` : "no matches spent"}
            >
              {row.spent > 0 ? `−${row.spent}` : "·"}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ResultScreen({
  result,
  matchesLeft,
  decisions,
  emailCaptured,
  knownEmail,
  onReplay,
}: {
  result: GameResult;
  matchesLeft: number;
  decisions: DecisionRecord[];
  emailCaptured: boolean;
  knownEmail: string | null;
  onReplay: () => void;
}) {
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [retryEmail, setRetryEmail] = useState(knownEmail ?? "");
  const [retryState, setRetryState] = useState<"idle" | "busy" | "done" | "failed">("idle");
  const [captured, setCaptured] = useState(emailCaptured);
  // Lead fires here only for retry captures — gate captures already
  // fired it inside EmailGate (one event per capture, no double count).
  const [capturedHere, setCapturedHere] = useState(false);
  const viewTracked = useRef(false);

  useEffect(() => {
    if (!viewTracked.current) {
      viewTracked.current = true;
      racingIqAnalytics.resultViewed(result.archetype.id);
    }
  }, [result.archetype.id]);

  // Pre-render the share card for the preview.
  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    void renderShareCard(result, matchesLeft).then((canvas) => {
      canvas.toBlob((blob) => {
        if (!blob || cancelled) return;
        url = URL.createObjectURL(blob);
        setCardUrl(url);
      }, "image/png");
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [result, matchesLeft]);

  const share = async () => {
    racingIqAnalytics.shareClicked(result.archetype.id);
    const text = `Racing IQ says I'm ${result.archetype.name}. ${result.archetype.roast}`;
    const url = "https://roadmancycling.com/racing-iq";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Racing IQ", text, url });
        return;
      }
    } catch {
      // fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
    } catch {
      // last resort: nothing — the download button still works
    }
  };

  const retryCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(retryEmail.trim())) return;
    setRetryState("busy");
    const ok = await submitRacingIqEmail(retryEmail.trim(), "result");
    if (ok) {
      racingIqAnalytics.emailCaptured("result");
      setCaptured(true);
      setCapturedHere(true);
      setRetryState("done");
    } else {
      setRetryState("failed");
    }
  };

  return (
    <div className="absolute inset-0 z-20 overflow-y-auto">
      {capturedHere && <MetaPixel event="Lead" eventParams={{ content_name: "racing-iq" }} />}
      <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-4 py-16">
        <div className="riq-fade-in">
          <p className="text-center font-heading text-xs tracking-[0.4em] text-coral">
            FULL RESULT · 120KM · {matchesLeft} {matchesLeft === 1 ? "MATCH" : "MATCHES"} LEFT
          </p>
          <h2 className="mt-2 text-center font-heading text-2xl uppercase tracking-wide text-off-white/70">
            You are
          </h2>
          <h1 className="text-center font-heading text-5xl uppercase leading-[0.95] tracking-wide text-off-white sm:text-6xl">
            {result.archetype.name}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-center text-[15px] italic leading-relaxed text-off-white/80">
            “{result.archetype.roast}”
          </p>

          <div className="mt-8 space-y-4 border border-off-white/15 bg-charcoal/80 p-5 backdrop-blur-md sm:p-6">
            <AxisBar label="Tactical nous" value={result.axes.nous} delay={200} />
            <AxisBar label="Match management" value={result.axes.match} delay={500} />
            <AxisBar label="Self-knowledge" value={result.axes.self} delay={800} />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="border border-off-white/15 bg-deep-purple/70 p-4">
              <p className="font-heading text-xs tracking-[0.3em] text-coral">STRENGTH</p>
              <p className="mt-1.5 text-sm leading-relaxed text-off-white/85">
                {result.archetype.strength}
              </p>
            </div>
            <div className="border border-off-white/15 bg-deep-purple/70 p-4">
              <p className="font-heading text-xs tracking-[0.3em] text-coral">WEAKNESS</p>
              <p className="mt-1.5 text-sm leading-relaxed text-off-white/85">
                {result.archetype.weakness}
              </p>
            </div>
          </div>

          <DecisionLedger decisions={decisions} />

          {/* Share card */}
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {cardUrl && (
              // Plain img: object URL from a client-side canvas — no optimizer involved.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cardUrl}
                alt={`Racing IQ archetype card: ${result.archetype.name}`}
                className="w-36 border border-off-white/20 shadow-glow-purple"
              />
            )}
            <div className="flex w-full flex-1 flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  racingIqAnalytics.cardDownloaded(result.archetype.id);
                  void downloadShareCard(result, matchesLeft);
                }}
                className="w-full bg-coral px-4 py-3 font-heading text-base uppercase tracking-[0.2em] text-off-white transition-colors hover:bg-coral-hover"
              >
                Download your card
              </button>
              <button
                type="button"
                onClick={() => void share()}
                className="w-full border border-off-white/30 px-4 py-3 font-heading text-base uppercase tracking-[0.2em] text-off-white transition-colors hover:border-coral hover:text-coral"
              >
                Share it
              </button>
              <button
                type="button"
                onClick={onReplay}
                className="w-full border border-off-white/15 px-4 py-2.5 font-heading text-sm uppercase tracking-[0.2em] text-off-white/60 transition-colors hover:border-off-white/40 hover:text-off-white"
              >
                Ride it again
              </button>
            </div>
          </div>

          {/* Email retry — only when the gate capture failed */}
          {!captured && (
            <form
              onSubmit={retryCapture}
              className="mt-6 border border-coral/40 bg-charcoal/80 p-4"
            >
              <p className="text-sm text-off-white/80">
                The hand-off at km 55 didn’t stick. Want the full breakdown
                of your seven decisions by email?
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <label htmlFor="riq-retry-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="riq-retry-email"
                  type="email"
                  value={retryEmail}
                  onChange={(e) => setRetryEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="min-w-0 flex-1 border border-off-white/25 bg-deep-purple/60 px-3.5 py-2.5 text-sm text-off-white placeholder:text-off-white/35 focus:border-coral focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={retryState === "busy"}
                  className="shrink-0 bg-coral px-4 py-2.5 font-heading text-sm uppercase tracking-[0.18em] text-off-white hover:bg-coral-hover disabled:opacity-60"
                >
                  {retryState === "busy" ? "Sending…" : "Send it"}
                </button>
              </div>
              {retryState === "failed" && (
                <p className="mt-2 text-xs text-coral" role="alert">
                  Still not getting through — the result above is yours either way.
                </p>
              )}
            </form>
          )}

          {/* The funnel hand-off */}
          <div className="mt-8 border-l-[3px] border-coral bg-deep-purple/80 p-5">
            <p className="font-heading text-xs tracking-[0.3em] text-coral">
              THE UNCOMFORTABLE PART
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-off-white/90">
              Seven decisions, and most riders get four or five of them
              right. The race still goes the same way — because the
              decisions were never the limiter. The engine is. Find out
              where yours has stalled.
            </p>
            <Link
              href="/plateau"
              className="mt-4 inline-block bg-coral px-5 py-3 font-heading text-base uppercase tracking-[0.2em] text-off-white transition-colors hover:bg-coral-hover"
            >
              Take the Plateau Diagnostic
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

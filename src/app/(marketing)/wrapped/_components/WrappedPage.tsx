"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import type {
  WrappedData,
  WrappedFormInput,
} from "@/lib/season-wrapped/types";
import { StatsForm } from "./StatsForm";
import { EmailGate } from "./EmailGate";
import { WrappedExperience } from "./WrappedExperience";

type Stage = "intro" | "gate" | "cards";

interface Props {
  /** Demo data shown in the preview tile and used as fallback. */
  demoData: WrappedData;
}

/**
 * Top-level Wrapped client orchestrator. Three stages:
 *
 *   intro  — hero, Strava placeholder, manual entry form
 *   gate   — email capture (skippable)
 *   cards  — the swipe-through experience
 *
 * Crossing into `cards` is optimistic: the WrappedData is already in
 * memory by this point, so navigation is instant.
 */
export function WrappedPage({ demoData }: Props) {
  const [stage, setStage] = useState<Stage>("intro");
  const [data, setData] = useState<WrappedData | null>(null);
  const [pendingFirstName, setPendingFirstName] = useState<string | undefined>();

  const handleComputed = useCallback(
    (next: WrappedData, input: WrappedFormInput) => {
      setData(next);
      setPendingFirstName(input.firstName || next.rider.firstName);
      setStage("gate");
      // Defer scroll-to-top so the new content paints first.
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    },
    [],
  );

  const handleUnlock = useCallback(() => {
    setStage("cards");
  }, []);

  const handleRestart = useCallback(() => {
    setStage("intro");
    setData(null);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, []);

  if (stage === "cards" && data) {
    return <WrappedExperience data={data} onRestart={handleRestart} />;
  }

  if (stage === "gate" && data) {
    return (
      <>
        <Header />
        <main id="main-content" className="min-h-screen bg-charcoal text-off-white">
          <Hero subtitle="Cards ready — drop your email to reveal them." />
          <section className="px-5 md:px-10 lg:px-16 pb-20 max-w-3xl mx-auto">
            <EmailGate
              firstName={pendingFirstName}
              onUnlock={handleUnlock}
            />
            <button
              type="button"
              onClick={handleRestart}
              className="mt-5 font-display text-[11px] uppercase tracking-[0.22em] text-off-white/55 hover:text-off-white transition"
            >
              ← Edit my numbers
            </button>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  // stage === "intro"
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-charcoal text-off-white">
        <Hero
          subtitle={`Your ${demoData.year} on the bike, in eight cards. Built for serious amateurs by serious amateurs.`}
        />

        <section className="px-5 md:px-10 lg:px-16 pb-20">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_360px] gap-10 items-start">
          {/* Form column */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6 md:p-8">
            <StatsForm onComputed={handleComputed} />
          </div>

          {/* Side column — Strava placeholder + preview tease */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            <StravaPlaceholder />
            <PreviewTease data={demoData} />
          </aside>
        </div>

        {/* Bottom — explainer */}
        <div className="max-w-3xl mx-auto mt-14">
          <p className="font-display text-coral text-[11px] uppercase tracking-[0.28em] mb-2">
            How it works
          </p>
          <h2 className="font-display text-3xl md:text-4xl uppercase tracking-wide text-off-white leading-tight">
            Your numbers in,
            <br />
            <span className="text-coral">your story out.</span>
          </h2>
          <ol className="mt-6 grid sm:grid-cols-3 gap-4">
            <Step n={1} title="Drop the totals" body="Distance, elevation, rides, hours. Off Strava, off Garmin, off your training log." />
            <Step n={2} title="We do the maths" body="Personality archetype, percentile rank, biggest-month detection, FTP storyline." />
            <Step n={3} title="Share the cards" body="Eight Stories-format posters, branded for the riders who get it." />
          </ol>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}

function Hero({ subtitle }: { subtitle: string }) {
  return (
    <header className="relative overflow-hidden bg-deep-purple">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute -top-40 left-1/2 h-[480px] w-[920px] -translate-x-1/2 opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(241,99,99,0.30), rgba(76,18,115,0.45) 45%, transparent 72%)",
          }}
        />
      </div>
      <div className="relative px-5 md:px-10 lg:px-16 pt-24 pb-12 md:pt-32 md:pb-16 max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-coral text-[11px] uppercase tracking-[0.3em] mb-4"
        >
          Roadman Cycling · Season Wrapped
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-off-white uppercase"
          style={{
            fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
            lineHeight: 0.9,
            letterSpacing: "-0.02em",
            textShadow: "0 4px 30px rgba(0,0,0,0.55)",
          }}
        >
          Wrap your year
          <br />
          <span className="text-coral">on the bike.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-5 max-w-xl text-off-white/75 text-base md:text-lg"
        >
          {subtitle}
        </motion.p>
      </div>
    </header>
  );
}

function StravaPlaceholder() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-baseline justify-between">
        <p className="font-display text-coral text-[11px] uppercase tracking-[0.28em]">
          Strava connect
        </p>
        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-wider text-off-white/55">
          Soon
        </span>
      </div>
      <p className="mt-3 font-display text-xl text-off-white uppercase tracking-wide leading-tight">
        One-tap import
      </p>
      <p className="mt-2 text-off-white/65 text-sm leading-relaxed">
        OAuth pull from Strava — your year auto-populates with no typing.
        Shipping when the OAuth review clears.
      </p>
      <button
        type="button"
        disabled
        className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-md bg-white/[0.04] border border-white/10 px-4 py-3 font-display text-sm uppercase tracking-[0.2em] text-off-white/55 cursor-not-allowed"
        aria-disabled
      >
        Connect Strava (coming soon)
      </button>
    </div>
  );
}

function PreviewTease({ data }: { data: WrappedData }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-purple/35 to-deep-purple/60 p-5">
      <p className="font-display text-coral text-[11px] uppercase tracking-[0.28em]">
        Sample wrap
      </p>
      <p className="mt-2 font-display text-3xl text-off-white uppercase tracking-wide leading-none">
        {Math.round(data.totals.distanceM / 1000).toLocaleString("en-GB")}
        <span className="text-coral text-base ml-1.5">km</span>
      </p>
      <p className="mt-1 text-off-white/65 text-xs">
        {data.rider.firstName ?? "Rider"} ·{" "}
        {Math.round(data.totals.elevationM).toLocaleString("en-GB")} m up · {" "}
        {data.totals.rides} rides
      </p>
      <p className="mt-3 text-off-white/55 text-xs leading-relaxed">
        That&apos;s our demo rider&apos;s year. Yours will look like this — your
        numbers, your spirit rider, your share-ready cards.
      </p>
      <Link
        href="/community/clubhouse"
        className="mt-4 inline-flex items-center gap-1 text-coral text-xs font-display uppercase tracking-[0.2em] hover:text-coral-hover transition"
      >
        Free Clubhouse ↗
      </Link>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
      <p className="font-display text-coral text-[11px] uppercase tracking-[0.22em]">
        Step {n.toString().padStart(2, "0")}
      </p>
      <p className="mt-1 font-display text-off-white text-lg uppercase tracking-wide">
        {title}
      </p>
      <p className="mt-1.5 text-off-white/65 text-sm leading-relaxed">{body}</p>
    </li>
  );
}

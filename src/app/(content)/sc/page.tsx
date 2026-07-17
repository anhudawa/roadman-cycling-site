import type { Metadata } from "next";
import Link from "next/link";
import { PROGRAMME, PHASES } from "@/lib/sc-programme";

export const metadata: Metadata = {
  title: "Strength & Conditioning for Cyclists — 12-Week Programme",
  description:
    "A structured 12-week S&C programme built for cyclists. Push/Pull split, periodised through GPP, Strength, and Power phases. Built by experts who work with World Tour teams.",
  alternates: { canonical: "https://roadmancycling.com/sc" },
};

/* ------------------------------------------------------------------ */
/*  Phase colour mapping                                               */
/* ------------------------------------------------------------------ */

const PHASE_COLOURS: Record<string, { bg: string; text: string; border: string }> = {
  gpp: {
    bg: "bg-[#4C1273]",
    text: "text-[#4C1273]",
    border: "border-[#4C1273]",
  },
  deload: {
    bg: "bg-[#545559]",
    text: "text-[#545559]",
    border: "border-[#545559]",
  },
  strength: {
    bg: "bg-[#F16363]",
    text: "text-[#F16363]",
    border: "border-[#F16363]",
  },
  power: {
    bg: "bg-[#4AAE8C]",
    text: "text-[#4AAE8C]",
    border: "border-[#4AAE8C]",
  },
};

/* ------------------------------------------------------------------ */
/*  What's Included feature data                                       */
/* ------------------------------------------------------------------ */

const FEATURES = [
  {
    title: "Push/Pull Split",
    description:
      "2 sessions per week, intelligently structured around push and pull movement patterns so you can slot them around your riding.",
    icon: (
      <svg className="w-8 h-8 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    title: "Progressive Overload",
    description:
      "Systematic rep and load progression across 12 weeks. Reps decrease and intensity increases as you move from GPP through to Power.",
    icon: (
      <svg className="w-8 h-8 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    title: "Core Work",
    description:
      "Dedicated core circuits that progress weekly. 6 exercises per circuit, building from 10 reps to 20 reps across the programme.",
    icon: (
      <svg className="w-8 h-8 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
      </svg>
    ),
  },
  {
    title: "Mobility & Recovery",
    description:
      "Dynamic warmups, foam rolling protocols, and 8 targeted stretches covering every muscle group cyclists hammer on the bike.",
    icon: (
      <svg className="w-8 h-8 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    title: "Video Demos",
    description:
      "Exercise demonstrations filmed by Anthony for every key movement, so you know exactly what good form looks like.",
    icon: (
      <svg className="w-8 h-8 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25z" />
      </svg>
    ),
  },
  {
    title: "Cycling-Specific",
    description:
      "Every exercise is chosen for direct on-bike transfer. Goblet squats, trap-bar deadlifts, Bulgarian split squats -- nothing wasted.",
    icon: (
      <svg className="w-8 h-8 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SCLandingPage() {
  return (
    <div className="font-body">
      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="relative bg-deep-purple overflow-hidden">
        {/* Subtle radial glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(76,18,115,0.6) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <h1 className="font-heading leading-none" style={{ fontSize: "var(--text-hero)" }}>
              STRENGTH &amp;{" "}
              <br className="hidden sm:block" />
              CONDITIONING
              <br />
              <span className="text-coral">FOR CYCLISTS</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-foreground-muted max-w-2xl leading-relaxed">
              A structured 12-week programme built around a Push/Pull split.
              Periodised through GPP, Strength, and Power phases. Two sessions
              per week -- designed to make you stronger on the bike without
              burning you out off it.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/sc/programme"
                className="inline-flex items-center gap-2 font-heading text-base tracking-wide bg-coral hover:bg-coral/90 text-off-white px-8 py-4 rounded-md transition-colors"
              >
                VIEW PROGRAMME
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/sc/exercises"
                className="inline-flex items-center gap-2 font-heading text-base tracking-wide border border-white/20 hover:border-white/40 text-off-white px-8 py-4 rounded-md transition-colors"
              >
                EXERCISE LIBRARY
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PROGRAMME OVERVIEW — 4 Phase Cards                          */}
      {/* ============================================================ */}
      <section className="bg-charcoal py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-heading text-off-white text-center"
            style={{ fontSize: "var(--text-section)" }}
          >
            THE PROGRAMME
          </h2>
          <p className="mt-4 text-foreground-muted text-center max-w-2xl mx-auto text-lg">
            Four distinct phases, each with a clear purpose. Volume drops as
            intensity climbs -- your body adapts, then peaks.
          </p>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PHASES.map((phase) => {
              const colours = PHASE_COLOURS[phase.phase];
              return (
                <div
                  key={phase.phase}
                  className="rounded-xl bg-charcoal border border-white/10 p-6 flex flex-col"
                  style={{ backgroundColor: "#2E2E30" }}
                >
                  <span
                    className={`inline-block self-start font-heading text-xs tracking-wider px-3 py-1 rounded-full ${colours.bg} text-off-white mb-4`}
                  >
                    {phase.label.toUpperCase()}
                  </span>
                  <p className="text-foreground-muted text-sm font-body mb-4">
                    Weeks {phase.weeks}
                  </p>
                  <p className="text-off-white text-sm leading-relaxed flex-1">
                    {phase.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  12-WEEK TIMELINE                                            */}
      {/* ============================================================ */}
      <section className="bg-deep-purple py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-heading text-off-white text-center"
            style={{ fontSize: "var(--text-section)" }}
          >
            12 WEEKS AT A GLANCE
          </h2>
          <p className="mt-4 text-foreground-muted text-center max-w-2xl mx-auto text-lg">
            Each week is colour-coded by training phase. Two deload weeks let
            you absorb the work before the next block.
          </p>

          {/* Horizontal scrollable timeline */}
          <div className="mt-14 overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-3 min-w-max pb-4">
              {PROGRAMME.map((week) => {
                const colours = PHASE_COLOURS[week.phase];
                return (
                  <div
                    key={week.weekNumber}
                    className={`flex flex-col items-center rounded-lg border ${colours.border} border-opacity-40 px-4 py-5 min-w-[80px]`}
                    style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  >
                    <span className="text-foreground-muted text-xs font-body mb-2">
                      WK
                    </span>
                    <span className="font-heading text-2xl text-off-white">
                      {week.weekNumber}
                    </span>
                    <span
                      className={`mt-2 inline-block w-3 h-3 rounded-full ${colours.bg}`}
                      aria-label={week.phaseLabel}
                    />
                    <span className="mt-2 text-foreground-muted text-[11px] font-body">
                      {week.phaseLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {PHASES.map((phase) => {
              const colours = PHASE_COLOURS[phase.phase];
              return (
                <div key={phase.phase} className="flex items-center gap-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${colours.bg}`}
                  />
                  <span className="text-foreground-muted text-sm font-body">
                    {phase.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  WHAT'S INCLUDED                                             */}
      {/* ============================================================ */}
      <section className="bg-charcoal py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-heading text-off-white text-center"
            style={{ fontSize: "var(--text-section)" }}
          >
            WHAT&apos;S INCLUDED
          </h2>
          <p className="mt-4 text-foreground-muted text-center max-w-2xl mx-auto text-lg">
            Everything you need for a complete off-bike training system.
          </p>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-white/10 p-6"
                style={{ backgroundColor: "#2E2E30" }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="font-heading text-xl text-off-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PRICING                                                     */}
      {/* ============================================================ */}
      <section className="bg-deep-purple py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="font-heading text-off-white"
            style={{ fontSize: "var(--text-section)" }}
          >
            READY TO GET STRONGER
            <br />
            <span className="text-coral">ON THE BIKE?</span>
          </h2>
          <p className="mt-6 text-foreground-muted text-lg max-w-xl mx-auto">
            12 weeks of structured S&amp;C, video demos, core training,
            stretching guides, and workout tracking. One payment, lifetime
            access.
          </p>

          {/* Price card */}
          <div className="mt-10 mx-auto max-w-sm rounded-2xl bg-[#2E2E30] border border-white/10 p-8">
            <p className="text-foreground-muted text-sm font-heading tracking-wider">ONE-TIME PURCHASE</p>
            <p className="mt-3 font-heading text-off-white text-6xl leading-none">
              $95
            </p>
            <p className="mt-2 text-foreground-muted text-sm">Lifetime access &middot; No subscription</p>
            <ul className="mt-6 text-left text-sm text-off-white space-y-2">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-coral shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                12-week periodised programme
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-coral shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Video demos for every exercise
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-coral shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Core training &amp; stretching guides
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-coral shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Built-in workout tracking
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-coral shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Magic link email access
              </li>
            </ul>
            <div className="mt-8">
              <Link
                href="/sc/programme"
                className="w-full inline-flex items-center justify-center gap-2 font-heading text-base tracking-wide bg-coral hover:bg-coral/90 text-off-white px-10 py-4 rounded-lg transition-colors"
              >
                GET STARTED
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

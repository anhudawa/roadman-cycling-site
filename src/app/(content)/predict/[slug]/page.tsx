import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import {
  PredictedTimeHero,
  ElevationProfile,
  SegmentTable,
  ScenarioCards,
  deriveDefaultScenarios,
  GapToCutoffBar,
  ShareCard,
  PredictionGate,
} from "@/components/features/predict";
import {
  getPredictionBySlug,
  getCourseById,
} from "@/lib/race-predictor/store";
import type { Course } from "@/lib/race-predictor/types";
import { UpgradeForm } from "./upgrade-form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const prediction = await getPredictionBySlug(slug).catch(() => null);
  if (!prediction) {
    return {
      title: "Race Prediction",
      robots: { index: false, follow: false },
    };
  }
  const course = prediction.courseId
    ? await getCourseById(prediction.courseId).catch(() => null)
    : null;
  const courseName = course?.name ?? "Custom Course";
  const url = `https://roadmancycling.com/predict/${slug}`;
  return {
    title: `${courseName} — Your Predicted Finish Time`,
    description: `Predicted finish time, climb-by-climb breakdown, fuelling targets and what-if scenarios for ${courseName}. Built by the Roadman Race Predictor.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${courseName} — Your Predicted Finish Time`,
      description: `Climb-by-climb breakdown, fuelling targets, and pacing scenarios for ${courseName}.`,
      type: "website",
      url,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: courseName }],
    },
    robots: { index: false, follow: true },
  };
}

// Known event sweep wagons (in seconds). For uploaded GPX or events without
// a published cutoff, the gap-to-cutoff bar is suppressed.
const COURSE_CUTOFFS: Record<string, number> = {
  "etape-du-tour-2026": 9 * 3600,
  "marmotte-granfondo-alpes": 11 * 3600,
  "mallorca-312": 14 * 3600,
  "ridelondon-classique-100": 8.5 * 3600,
  "dragon-ride-gran-fondo": 11 * 3600,
  "tour-of-flanders-sportive": 10 * 3600,
  "haute-route-pyrenees-stage-1": 8 * 3600,
};

export default async function PredictResultPage({ params }: PageProps) {
  const { slug } = await params;
  const prediction = await getPredictionBySlug(slug);
  if (!prediction) notFound();

  const course = prediction.courseId
    ? await getCourseById(prediction.courseId)
    : null;

  const courseName = course?.name ?? "Your custom course";
  const courseSlug = course?.slug ?? null;

  // Resolve full Course geometry: prefer DB row's courseData, then prediction's
  // own snapshot (uploaded GPX). One of these is always present.
  const fullCourse: Course | null =
    (course?.courseData as Course | undefined) ?? prediction.courseData ?? null;

  if (!fullCourse) notFound();

  const distanceKm = fullCourse.totalDistance / 1000;
  const elevationGainM = Math.round(fullCourse.totalElevationGain);
  const climbCount = fullCourse.climbs.length;

  const insight =
    (prediction.resultSummary?.insight as
      | { headline: string; body: string; tag?: string }
      | undefined) ?? null;

  const avgSpeedKmh =
    distanceKm > 0 ? distanceKm / (prediction.predictedTimeS / 3600) : 0;

  const cutoffS = courseSlug ? COURSE_CUTOFFS[courseSlug] : undefined;

  // Free tier shows the time hero + key insight. The full breakdown
  // (climb-by-climb, scenarios, share card) unlocks once we capture an email.
  // Paid users always see everything.
  const unlocked = Boolean(prediction.email) || prediction.isPaid;

  const scenarios = deriveDefaultScenarios({
    baseTimeS: prediction.predictedTimeS,
    averagePower: prediction.averagePower ?? 200,
    bodyMass: prediction.riderInputs?.bodyMass ?? 75,
    cda: prediction.riderInputs?.cda ?? 0.32,
    elevationGainM,
  });

  return (
    <>
      <Header />
      <main>
        {/* HERO */}
        <Section
          background="deep-purple"
          grain
          className="pt-28 md:pt-32 pb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute -top-40 left-1/3 w-[640px] h-[640px] rounded-full blur-[150px] opacity-50"
              style={{
                background: "radial-gradient(circle, rgba(241,99,99,0.32), transparent 65%)",
              }}
            />
          </div>

          <Container className="relative">
            <Link
              href="/predict"
              className="inline-flex items-center gap-2 text-[0.65rem] tracking-[0.22em] uppercase text-off-white/60 hover:text-coral transition-colors mb-5"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5 M12 19l-7-7 7-7" />
              </svg>
              Run another prediction
            </Link>

            <div className="flex items-end justify-between flex-wrap gap-4 mb-2">
              <div>
                <p
                  className="text-[0.65rem] tracking-[0.25em] uppercase text-coral mb-2"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  RACE PREDICTOR · YOUR PREDICTION
                </p>
                <h1 className="font-heading uppercase tracking-tight text-off-white leading-[0.95] text-[clamp(2.25rem,6vw,4.5rem)]">
                  {courseName}
                </h1>
              </div>
            </div>

            <div
              className="flex items-center gap-4 text-sm text-off-white/70 flex-wrap"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              <Tag>{distanceKm.toFixed(1)} KM</Tag>
              <Tag>{elevationGainM.toLocaleString()} M GAIN</Tag>
              <Tag>
                {climbCount} CLIMB{climbCount === 1 ? "" : "S"}
              </Tag>
              <Tag>
                {prediction.mode === "can_i_make_it" ? "GAP ANALYSIS" : "RACE PLAN"}
              </Tag>
            </div>
          </Container>
        </Section>

        {/* PREDICTED TIME HERO */}
        <Section background="charcoal" className="!py-8 md:!py-10">
          <Container>
            <PredictedTimeHero
              predictedTimeS={prediction.predictedTimeS}
              confidenceLowS={prediction.confidenceLowS}
              confidenceHighS={prediction.confidenceHighS}
              averageSpeedKmh={avgSpeedKmh}
              averagePower={prediction.averagePower}
              normalizedPower={prediction.normalizedPower}
              variabilityIndex={prediction.variabilityIndex}
              mode={prediction.mode}
            />
          </Container>
        </Section>

        {/* COURSE PROFILE */}
        <Section background="charcoal" className="!py-8 md:!py-10">
          <Container>
            <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-deep-purple/40 via-charcoal to-charcoal p-5 md:p-6">
              <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
                <div>
                  <p
                    className="text-[0.62rem] tracking-[0.22em] uppercase text-coral"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    COURSE PROFILE · POWER OVERLAY
                  </p>
                  <p className="font-heading text-2xl uppercase tracking-tight text-off-white mt-1">
                    Where the day is won
                  </p>
                </div>
                <Legend />
              </div>
              <ElevationProfile
                course={fullCourse}
                power={prediction.pacingPlan ?? undefined}
                height={340}
                showClimbBands
              />
            </div>
          </Container>
        </Section>

        {/* KEY INSIGHT */}
        {insight && (
          <Section background="charcoal" className="!py-8 md:!py-10">
            <Container>
              <div className="rounded-2xl border-l-[3px] border-coral border-y border-r border-y-white/8 border-r-white/8 bg-gradient-to-br from-coral/8 via-deep-purple/30 to-charcoal p-6 md:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-coral text-charcoal flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2 L13 9 L20 10 L14 14 L16 21 L12 17 L8 21 L10 14 L4 10 L11 9 Z" />
                    </svg>
                  </div>
                  <p
                    className="text-[0.62rem] tracking-[0.22em] uppercase text-coral"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    KEY INSIGHT · FREE PREVIEW
                  </p>
                </div>
                <h2 className="font-heading text-2xl md:text-3xl uppercase tracking-tight text-off-white leading-tight mb-3">
                  {insight.headline}
                </h2>
                <p className="text-off-white/85 text-base md:text-lg leading-relaxed max-w-3xl">
                  {insight.body}
                </p>
              </div>
            </Container>
          </Section>
        )}

        {/* EMAIL GATE — shown until an email has been captured for this prediction. */}
        {!unlocked && (
          <Section background="charcoal" className="!py-8 md:!py-10">
            <Container>
              <PredictionGate slug={prediction.slug} />
            </Container>
          </Section>
        )}

        {/* GAP TO CUTOFF */}
        {unlocked && cutoffS != null && (
          <Section background="charcoal" className="!py-8 md:!py-10">
            <Container>
              <GapToCutoffBar
                predictedTimeS={prediction.predictedTimeS}
                cutoffS={cutoffS}
                confidenceHighS={prediction.confidenceHighS}
              />
            </Container>
          </Section>
        )}

        {/* SEGMENT BREAKDOWN */}
        {unlocked && (
          <Section background="charcoal" className="!py-8 md:!py-10">
            <Container>
              <div className="mb-5">
                <p
                  className="text-[0.65rem] tracking-[0.22em] uppercase text-coral mb-2"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  CLIMBS · WHERE TIME LIVES
                </p>
                <h2 className="font-heading text-3xl uppercase tracking-tight text-off-white">
                  Climb-by-climb
                </h2>
              </div>
              <SegmentTable
                course={fullCourse}
                pacingPlan={prediction.pacingPlan}
                averageSpeed={avgSpeedKmh / 3.6}
              />
            </Container>
          </Section>
        )}

        {/* SCENARIO COMPARISON */}
        {unlocked && (
          <Section background="charcoal" className="!py-8 md:!py-10">
            <Container>
              <div className="mb-5">
                <p
                  className="text-[0.65rem] tracking-[0.22em] uppercase text-coral mb-2"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  SCENARIOS · WHAT MOVES THE NEEDLE
                </p>
                <h2 className="font-heading text-3xl uppercase tracking-tight text-off-white">
                  Trade-offs that matter
                </h2>
              </div>
              <ScenarioCards
                scenarios={scenarios}
                baseTimeS={prediction.predictedTimeS}
              />
              <p className="text-xs text-foreground-subtle mt-3">
                Directional preview — the Race Report runs the full simulation
                against each scenario for an exact delta.
              </p>
            </Container>
          </Section>
        )}

        {/* RACE REPORT UPGRADE */}
        <Section background="deep-purple" grain className="!py-12 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-50"
              style={{
                background: "radial-gradient(circle, rgba(241,99,99,0.4), transparent 65%)",
              }}
            />
          </div>
          <Container className="relative">
            {prediction.isPaid ? (
              <div className="rounded-2xl border border-coral/40 bg-charcoal/60 p-6 md:p-8 text-center max-w-3xl mx-auto">
                <p
                  className="text-[0.62rem] tracking-[0.22em] uppercase text-coral mb-2"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  RACE REPORT DELIVERED ✓
                </p>
                <h3 className="font-heading text-3xl uppercase tracking-tight text-off-white mb-2">
                  Check your inbox
                </h3>
                <p className="text-off-white/80">
                  Your full Race Report and secure web link are on the way.
                </p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 max-w-5xl mx-auto">
                <div>
                  <p
                    className="text-[0.62rem] tracking-[0.22em] uppercase text-coral mb-2"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    GET THE REPORT · $29
                  </p>
                  <h3 className="font-heading text-4xl uppercase tracking-tight text-off-white mb-4 leading-tight">
                    The full Race Report
                  </h3>
                  <ul className="space-y-2.5 mb-2">
                    <Bullet>Per-km pacing plan with weather-aware power targets</Bullet>
                    <Bullet>Climb-by-climb power and time budget</Bullet>
                    <Bullet>Fuelling rates dialled to your effort</Bullet>
                    <Bullet>Equipment scenarios (CdA / mass / Crr trade-offs)</Bullet>
                    <Bullet>Delivered as a private web report in &lt; 1 min</Bullet>
                  </ul>
                </div>
                <div className="rounded-2xl border border-coral/30 bg-charcoal/60 backdrop-blur-md p-6 self-start">
                  <UpgradeForm slug={prediction.slug} />
                </div>
              </div>
            )}
          </Container>
        </Section>

        {/* SHAREABLE CARD — gated until email captured */}
        {unlocked && insight && (
          <Section background="charcoal" className="!py-8 md:!py-10">
            <Container>
              <ShareCard
                courseName={courseName}
                predictedTimeS={prediction.predictedTimeS}
                averageSpeedKmh={avgSpeedKmh}
                averagePower={prediction.averagePower}
                distanceKm={distanceKm}
                elevationGainM={elevationGainM}
                course={fullCourse}
                insightHeadline={insight.headline}
              />
            </Container>
          </Section>
        )}

        {/* COMMUNITY CTA */}
        <Section background="charcoal" className="!py-12">
          <Container>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple/15 via-deep-purple/40 to-charcoal p-6 md:p-10 max-w-4xl mx-auto">
              <div className="flex items-start gap-4 flex-col md:flex-row">
                <div className="flex-1">
                  <p
                    className="text-[0.62rem] tracking-[0.22em] uppercase text-coral mb-2"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    NOT DONE YET · COMMUNITY
                  </p>
                  <h3 className="font-heading text-3xl md:text-4xl uppercase tracking-tight text-off-white mb-3 leading-tight">
                    Train alongside riders chasing the same finish line
                  </h3>
                  <p className="text-off-white/80 leading-relaxed mb-2">
                    TrainingPeaks delivery, weekly live calls with Anthony,
                    coach feedback, and a community of serious amateur cyclists
                    who refuse to accept their best days are behind them.
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full md:w-auto md:min-w-[200px]">
                  <Button href="/community/not-done-yet" size="lg" dataTrack="predict_ndy_cta">
                    Join the community →
                  </Button>
                  <Link
                    href="/predict/courses"
                    className="text-center text-xs uppercase tracking-[0.18em] text-foreground-muted hover:text-coral transition-colors py-2"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    Browse all events
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/15 text-[0.62rem] tracking-[0.18em]">
      {children}
    </span>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-off-white/90">
      <span className="mt-1.5 block w-1 h-1 rounded-full bg-coral flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function Legend() {
  return (
    <div
      className="flex items-center gap-4 text-[0.6rem] tracking-[0.18em] uppercase"
      style={{ fontFamily: "var(--font-jetbrains-mono)" }}
    >
      <span className="flex items-center gap-1.5 text-foreground-subtle">
        <span className="block w-2.5 h-1 rounded bg-emerald-400" /> &lt;2%
      </span>
      <span className="flex items-center gap-1.5 text-foreground-subtle">
        <span className="block w-2.5 h-1 rounded bg-amber-400" /> 2-5%
      </span>
      <span className="flex items-center gap-1.5 text-foreground-subtle">
        <span className="block w-2.5 h-1 rounded bg-orange-500" /> 5-8%
      </span>
      <span className="flex items-center gap-1.5 text-foreground-subtle">
        <span className="block w-2.5 h-1 rounded bg-red-500" /> 8%+
      </span>
    </div>
  );
}

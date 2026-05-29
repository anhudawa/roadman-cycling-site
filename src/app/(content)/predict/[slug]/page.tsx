import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  PredictedTimeHero,
  ElevationProfile,
  SegmentTable,
  ScenarioCards,
  deriveDefaultScenarios,
  GapToCutoffBar,
  ShareCard,
  PredictionGate,
  AccuracyFeedback,
} from "@/components/features/predict";
import {
  getPredictionBySlug,
  getCourseById,
  getCourseBySlug,
  type CourseRow,
} from "@/lib/race-predictor/store";
import type { Course } from "@/lib/race-predictor/types";
import { RACES } from "@/data/races";
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
    const eventCourse = await getCourseBySlug(slug).catch(() => null);
    if (eventCourse) {
      const courseName = eventCourse.name;
      const distanceKm = Math.round(eventCourse.distanceM / 1000);
      const url = `https://roadmancycling.com/predict/${slug}`;
      return {
        title: `${courseName} Race Predictor | Roadman Cycling`,
        description: `Predict your ${courseName} finish time from FTP, weight, bike setup, wind, drafting, ${distanceKm} km of route data, and ${eventCourse.elevationGainM.toLocaleString()} m of climbing.`,
        alternates: { canonical: url },
        openGraph: {
          title: `${courseName} Race Predictor`,
          description: `Estimate your finish time, confidence range, pacing needs, and premium Race Report for ${courseName}.`,
          type: "website",
          url,
          // og:image is injected automatically by the colocated
          // opengraph-image.tsx, which renders a branded generic event card for
          // curated landing slugs (no personal prediction). File-based metadata
          // overrides openGraph.images, so hardcoding the static /og-image.jpg
          // here had no effect on the actual unfurl — removed to avoid
          // confusion and keep dimensions/type/alt consistent with the route.
        },
        robots: { index: true, follow: true },
      };
    }
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
      // NB: og:image is injected automatically by Next.js from the colocated
      // src/app/(content)/predict/[slug]/opengraph-image.tsx — a Satori-backed
      // 1200×630 per-prediction poster (finish time + course + elevation
      // profile). File-based metadata has higher priority than and OVERRIDES
      // openGraph.images set here, and the file convention generates the
      // correct hashed URL + width/height/type/alt automatically. Do NOT
      // hardcode openGraph.images — that was the bug this change fixes: the
      // page previously pointed social unfurls at the generic static
      // /og-image.jpg instead of the rider's actual result.
    },
    twitter: {
      card: "summary_large_image",
      title: `${courseName} — Your Predicted Finish Time`,
      description: `Climb-by-climb breakdown, fuelling targets, and pacing scenarios for ${courseName}.`,
      // twitter:image falls back to the auto-injected opengraph-image when no
      // twitter-image.[ext] exists in the route segment.
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
  if (!prediction) {
    const eventCourse = await getCourseBySlug(slug);
    if (!eventCourse) notFound();
    return <PredictEventLanding course={eventCourse} />;
  }

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
  const confidencePct =
    ((Math.max(
      Math.abs(prediction.predictedTimeS - prediction.confidenceLowS),
      Math.abs(prediction.confidenceHighS - prediction.predictedTimeS),
    ) /
      prediction.predictedTimeS) *
      100);
  const freeFactors = derivePredictionFactors({
    course: fullCourse,
    courseIsCatalog: Boolean(course),
    windSpeed: prediction.environmentInputs.windSpeed,
    averagePower: prediction.averagePower ?? undefined,
    riderMass: prediction.riderInputs.bodyMass,
    bikeMass: prediction.riderInputs.bikeMass,
    cda: prediction.riderInputs.cda,
    confidencePct,
  });

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

        <Section background="charcoal" className="!py-8 md:!py-10">
          <Container>
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4 md:gap-5">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 md:p-6">
                <p
                  className="text-[0.62rem] tracking-[0.22em] uppercase text-coral mb-2"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  CONFIDENCE · WHAT TO KNOW
                </p>
                <h2 className="font-heading text-3xl uppercase tracking-tight text-off-white leading-tight">
                  Useful range, not fake precision
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-off-white/76">
                  This prediction uses a ±{confidencePct.toFixed(1)}% range
                  because course files, wind, rider position, group dynamics,
                  and long-event durability can move the real finish time. The
                  tighter those inputs get, the tighter the report can be.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                {freeFactors.map((factor) => (
                  <div
                    key={factor.label}
                    className="rounded-2xl border border-white/8 bg-gradient-to-br from-deep-purple/30 to-charcoal p-4 md:p-5"
                  >
                    <p
                      className="text-[0.58rem] tracking-[0.18em] uppercase text-foreground-subtle"
                      style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    >
                      {factor.label}
                    </p>
                    <p className="mt-2 font-heading text-2xl uppercase tracking-tight text-off-white leading-tight">
                      {factor.value}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-foreground-muted">
                      {factor.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
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

        <Section background="charcoal" className="!py-8 md:!py-10">
          <Container>
            <AccuracyFeedback
              slug={prediction.slug}
              predictedTimeS={prediction.predictedTimeS}
              defaultEmail={prediction.email}
            />
          </Container>
        </Section>

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

function PredictEventLanding({ course }: { course: CourseRow }) {
  const fullCourse = course.courseData;
  const race = RACES.find((item) => item.predictor_slug === course.slug);
  const distanceKm = course.distanceM / 1000;
  const elevationGainM = Math.round(course.elevationGainM);
  const climbCount = fullCourse.climbs.length;
  const pageUrl = `https://roadmancycling.com/predict/${course.slug}`;
  const faqs = buildPredictEventFaqs(course, race, distanceKm, elevationGainM);
  const hardestClimbs = [...fullCourse.climbs]
    .sort((a, b) => b.elevationGain - a.elevationGain)
    .slice(0, 3);
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
      { "@type": "ListItem", position: 2, name: "Race Predictor", item: "https://roadmancycling.com/predict" },
      { "@type": "ListItem", position: 3, name: course.name, item: pageUrl },
    ],
  };
  const predictorLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${course.name} Race Predictor`,
    applicationCategory: "SportsApplication",
    operatingSystem: "Web",
    url: pageUrl,
    description: `Predict your ${course.name} finish time from rider profile, bike setup, weather assumptions, and ${distanceKm.toFixed(0)} km of route data.`,
    provider: {
      "@type": "Organization",
      name: "Roadman Cycling",
      url: "https://roadmancycling.com",
    },
    offers: [
      {
        "@type": "Offer",
        name: "Free race prediction",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Premium Race Report",
        price: "29",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    ],
  };
  const courseLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: course.name,
    url: pageUrl,
    sport: "Cycling",
    description: `${course.name} route profile: ${distanceKm.toFixed(0)} km with ${elevationGainM.toLocaleString()} m of climbing.`,
    containedInPlace: race
      ? {
          "@type": "Place",
          name: race.location,
          address: {
            "@type": "PostalAddress",
            addressCountry: race.country,
          },
        }
      : undefined,
    additionalProperty: [
      { "@type": "PropertyValue", name: "Distance", value: `${distanceKm.toFixed(1)} km` },
      { "@type": "PropertyValue", name: "Elevation gain", value: `${elevationGainM} m` },
      { "@type": "PropertyValue", name: "Climbs", value: String(climbCount) },
      {
        "@type": "PropertyValue",
        name: "Surface",
        value: course.surfaceSummary?.replace(/_/g, " ") ?? "mixed",
      },
    ],
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={predictorLd} />
      <JsonLd data={courseLd} />
      <JsonLd data={faqLd} />
      <Header />
      <main>
        <Section
          background="deep-purple"
          grain
          className="pt-28 md:pt-36 pb-10 relative overflow-hidden"
        >
          <Container className="relative">
            <div className="max-w-4xl">
              <p
                className="text-[0.65rem] tracking-[0.25em] uppercase text-coral mb-3"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                ROADMAN · EVENT RACE PREDICTOR
              </p>
              <h1 className="font-heading uppercase tracking-tight text-off-white leading-[0.95] text-[clamp(2.5rem,8vw,5.5rem)]">
                {course.name}
              </h1>
              <p className="mt-5 max-w-2xl text-base md:text-xl leading-relaxed text-off-white/82">
                Estimate your finish time from FTP, body weight, bike setup,
                wind, drafting assumptions, and the course profile. The free
                prediction gives you a realistic range; the Race Report turns
                it into a pacing and fuelling plan.
              </p>
              <div
                className="mt-6 flex flex-wrap gap-3 text-sm text-off-white/75"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                <Tag>{distanceKm.toFixed(0)} KM</Tag>
                <Tag>{elevationGainM.toLocaleString()} M GAIN</Tag>
                <Tag>{climbCount} CLIMBS</Tag>
                <Tag>{course.surfaceSummary?.replace(/_/g, " ").toUpperCase() ?? "MIXED SURFACE"}</Tag>
              </div>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Button href={`/predict?course=${course.slug}`} size="lg">
                  Predict my finish time →
                </Button>
                {race && (
                  <Button href={`/races/${race.slug}`} variant="outline" size="lg">
                    Read the race guide
                  </Button>
                )}
              </div>
            </div>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-10 md:!py-14">
          <Container>
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
              <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-deep-purple/35 via-charcoal to-charcoal p-5 md:p-6">
                <div className="mb-4">
                  <p
                    className="text-[0.62rem] tracking-[0.22em] uppercase text-coral"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    COURSE PROFILE
                  </p>
                  <h2 className="font-heading text-3xl uppercase tracking-tight text-off-white mt-1">
                    The shape of the day
                  </h2>
                </div>
                <ElevationProfile course={fullCourse} height={320} showClimbBands />
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 md:p-6">
                <p
                  className="text-[0.62rem] tracking-[0.22em] uppercase text-coral mb-3"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  WHY PREDICT THIS RACE
                </p>
                <ul className="space-y-3 text-sm leading-relaxed text-off-white/78">
                  <li>See whether your target power is realistic before the start line.</li>
                  <li>Model wind direction and group-riding assumptions instead of using a flat average speed.</li>
                  <li>Get a confidence range so the number stays useful when race-day conditions shift.</li>
                  <li>Upgrade to a Race Report for segment pacing, fuelling, equipment notes, and race-week priorities.</li>
                </ul>
              </div>
            </div>
          </Container>
        </Section>

        {hardestClimbs.length > 0 && (
          <Section background="charcoal" className="!py-10 md:!py-14">
            <Container>
              <div className="mb-5">
                <p
                  className="text-[0.65rem] tracking-[0.22em] uppercase text-coral mb-2"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  CLIMBS · KEY SECTIONS
                </p>
                <h2 className="font-heading text-3xl uppercase tracking-tight text-off-white">
                  Where the prediction earns its keep
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {hardestClimbs.map((climb, index) => (
                  <div
                    key={`${climb.startDistance}-${climb.endDistance}`}
                    className="rounded-xl border border-white/8 bg-white/[0.03] p-4"
                  >
                    <p
                      className="text-[0.58rem] tracking-[0.18em] uppercase text-foreground-subtle"
                      style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    >
                      Climb {index + 1}
                    </p>
                    <p className="mt-2 font-heading text-2xl uppercase tracking-tight text-off-white">
                      {(climb.length / 1000).toFixed(1)} km
                    </p>
                    <p className="mt-1 text-sm text-foreground-muted">
                      {(Math.tan(climb.averageGradient) * 100).toFixed(1)}% avg ·{" "}
                      {Math.round(climb.elevationGain).toLocaleString()} m gain
                    </p>
                  </div>
                ))}
              </div>
            </Container>
          </Section>
        )}

        <Section background="charcoal" className="!py-10 md:!py-14">
          <Container>
            <div className="max-w-3xl mb-6">
              <p
                className="text-[0.65rem] tracking-[0.22em] uppercase text-coral mb-2"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                EVENT PREDICTION FAQ
              </p>
              <h2 className="font-heading text-3xl uppercase tracking-tight text-off-white">
                What riders usually want to know
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-xl border border-white/8 bg-white/[0.03] p-5"
                >
                  <h3 className="font-heading text-xl uppercase tracking-tight text-off-white">
                    {faq.question}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-off-white/76">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain className="!py-12">
          <Container>
            <div className="max-w-3xl">
              <p
                className="text-[0.65rem] tracking-[0.22em] uppercase text-coral mb-2"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                FREE PREDICTION · PREMIUM REPORT
              </p>
              <h2 className="font-heading text-4xl uppercase tracking-tight text-off-white leading-tight">
                Turn the course into a race-day plan
              </h2>
              <p className="mt-4 text-off-white/80 leading-relaxed">
                Start with the free finish-time prediction. If this is an A race,
                unlock the Race Report for climb pacing, wind strategy, fuelling
                targets, equipment changes, and the biggest time gains.
              </p>
              <div className="mt-6">
                <Button href={`/predict?course=${course.slug}`} size="lg">
                  Start the prediction →
                </Button>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

function buildPredictEventFaqs(
  course: CourseRow,
  race: (typeof RACES)[number] | undefined,
  distanceKm: number,
  elevationGainM: number,
): { question: string; answer: string }[] {
  const eventName = race?.name ?? course.name;
  const surface = course.surfaceSummary?.replace(/_/g, " ") ?? "mixed surface";
  const climbText =
    elevationGainM >= 4000
      ? "This is a climb-heavy course, so pacing the early climbs and protecting carbohydrate availability matter more than chasing speed early."
      : elevationGainM >= 2000
        ? "The climbing is meaningful enough that rider weight, bike weight, and power pacing will materially affect the prediction."
        : "The course is less climb-dominated, so aerodynamics, wind direction, group riding, and steady power become bigger drivers of finish time.";

  return [
    {
      question: `How does the ${eventName} predictor work?`,
      answer: `It combines the saved ${eventName} route profile with your FTP, body weight, bike setup, riding position, surface, wind, and drafting assumptions. The result is a deterministic finish-time estimate with a confidence range, not a guaranteed race-day time.`,
    },
    {
      question: `What data is used for ${eventName}?`,
      answer: `This page uses ${distanceKm.toFixed(0)} km of course distance, ${elevationGainM.toLocaleString()} m of elevation gain, detected climbs, and ${surface} assumptions. Better route files and more actual rider results will improve future confidence.`,
    },
    {
      question: "What makes the prediction more accurate?",
      answer: `Measured FTP, honest rider weight, realistic bike weight, known tyre/surface choice, accurate wind conditions, and a good estimate of riding position all improve the model. ${climbText}`,
    },
    {
      question: "What is in the premium Race Report?",
      answer:
        "The Race Report turns the free finish-time estimate into a race plan: segment pacing, climb strategy, wind notes, fuelling targets, equipment guidance, biggest time gains, biggest risks, and race-week checklists.",
    },
  ];
}

function derivePredictionFactors(args: {
  course: Course;
  courseIsCatalog: boolean;
  windSpeed: number;
  averagePower?: number;
  riderMass: number;
  bikeMass: number;
  cda: number;
  confidencePct: number;
}): { label: string; value: string; detail: string }[] {
  const distanceKm = args.course.totalDistance / 1000;
  const elevationGainM = args.course.totalElevationGain;
  const climbDensity = distanceKm > 0 ? elevationGainM / distanceKm : 0;
  const totalMass = args.riderMass + args.bikeMass;
  const wattsPerKg =
    args.averagePower && totalMass > 0 ? args.averagePower / totalMass : null;

  const courseFactor =
    climbDensity >= 25
      ? {
          label: "Course load",
          value: `${Math.round(climbDensity)} m/km`,
          detail: "Climbing density is the main time driver. Pacing the long climbs matters more than chasing speed on descents.",
        }
      : {
          label: "Course load",
          value: `${Math.round(climbDensity)} m/km`,
          detail: "This course is less climb-dominated, so wind, position, and steady power have a bigger effect on finish time.",
        };

  const windFactor =
    args.windSpeed >= 5
      ? {
          label: "Wind risk",
          value: `${(args.windSpeed * 3.6).toFixed(0)} km/h`,
          detail: "Wind is strong enough to move the prediction. Direction and exposed sections become premium-report priorities.",
        }
      : {
          label: "Wind risk",
          value: args.windSpeed > 0 ? `${(args.windSpeed * 3.6).toFixed(0)} km/h` : "Calm",
          detail: "Wind is not the main limiter in this run. If race day changes, re-run the prediction with the new forecast.",
        };

  const setupFactor =
    args.cda <= 0.27
      ? {
          label: "Aero setup",
          value: "Fast",
          detail: "Your position assumption is aero. Small comfort changes can still matter over long flat or exposed sections.",
        }
      : args.cda >= 0.36
        ? {
            label: "Aero setup",
            value: "Costly",
            detail: "Body position is likely costing minutes on faster sections. This is one of the cleanest places to gain time.",
          }
        : {
            label: "Aero setup",
            value: "Moderate",
            detail: "Aero drag is in a normal road-riding range. Position, clothing, and group riding can still shift the day.",
          };

  const powerFactor =
    wattsPerKg != null
      ? {
          label: "Power load",
          value: `${wattsPerKg.toFixed(1)} W/kg`,
          detail: "This is average race-load against rider plus bike mass. Long events punish starts that sit above this too often.",
        }
      : {
          label: "Power load",
          value: "Unknown",
          detail: "Power data was incomplete, so the model leans more heavily on conservative defaults.",
        };

  const qualityFactor = {
    label: "Course data",
    value: args.courseIsCatalog ? "Catalog" : "Uploaded",
    detail: args.courseIsCatalog
      ? "Using a saved Roadman course profile. Real GPX provenance will tighten this further as the event database improves."
      : "Using your uploaded GPX. Clean elevation and real route files improve confidence more than generic event distance.",
  };

  const confidenceFactor = {
    label: "Range width",
    value: `±${args.confidencePct.toFixed(1)}%`,
    detail: "The range is intentionally conservative. Better CdA, Crr, weather, and actual result data tighten the model over time.",
  };

  const ranked = [
    courseFactor,
    windFactor,
    setupFactor,
    powerFactor,
    qualityFactor,
    confidenceFactor,
  ];

  return ranked.slice(0, 3);
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

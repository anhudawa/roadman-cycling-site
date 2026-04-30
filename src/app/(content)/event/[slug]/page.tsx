import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { ENTITY_IDS } from "@/lib/brand-facts";
import {
  getAllEventGuideSlugs,
  resolveEventGuide,
  type EventGuide,
  type ResolvedEventGuide,
} from "@/lib/event-guides";
import { PHASES } from "@/lib/training-plans";

/**
 * Event-specific training cluster page: /event/[slug]
 *
 * Sits above the /plan/[event]/[weeksOut] grid as a content hub:
 * climbing analysis, FTP requirement, finish-time bands, fuelling
 * deep dive — then routes riders into the right weeks-out plan and
 * the predictor (or Ask Roadman if no predictor course exists).
 */

interface Params {
  slug: string;
}

const BASE_URL = "https://roadmancycling.com";

export function generateStaticParams() {
  return getAllEventGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolved = resolveEventGuide(slug);
  if (!resolved) return { title: "Event Guide" };
  const { guide, trainingEvent } = resolved;

  const title = `${guide.pageTitle} — Climbing, Pacing & Finish Times`;
  const description = `Complete ${trainingEvent.name} guide: ${trainingEvent.distanceKm}km, ${trainingEvent.elevationGainM.toLocaleString()}m climbing, FTP requirement, climb-by-climb breakdown, finish times by ability, and weeks-out training plans (16/12/8/4/2/1).`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/event/${guide.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${BASE_URL}/event/${guide.slug}`,
    },
  };
}

function buildFaqs({
  guide,
  trainingEvent,
}: ResolvedEventGuide): { question: string; answer: string }[] {
  return [
    {
      question: `What FTP do I need for the ${trainingEvent.name}?`,
      answer: `${guide.ftpRequirement.notes} A practical floor is ${guide.ftpRequirement.minimum} to finish; ${guide.ftpRequirement.competitive} to ride competitively.`,
    },
    {
      question: `How long should I train for the ${trainingEvent.name}?`,
      answer: `Most riders benefit from 12-16 weeks of structured preparation. ${guide.enduranceDemands} If you have less time, the 8-week and 4-week plans still produce a meaningful result on the right starting fitness.`,
    },
    {
      question: `What's the typical finish time for the ${trainingEvent.name}?`,
      answer: `Amateur finishers cover the full range. ${guide.finishTimes
        .map((b) => `${b.level}: ${b.range}`)
        .join("; ")}. The difference between bands is climbing fitness and fuelling discipline more than flat speed.`,
    },
    {
      question: `What's the biggest mistake riders make at the ${trainingEvent.name}?`,
      answer: `${guide.detailedMistakes[0].mistake}. Fix: ${guide.detailedMistakes[0].fix}`,
    },
    {
      question: `How should I pace the ${trainingEvent.name}?`,
      answer: guide.pacingDeepDive,
    },
    {
      question: `When does the ${trainingEvent.name} take place?`,
      answer: `The ${trainingEvent.name} typically runs in ${trainingEvent.defaultMonth}. Count back from your event date and pick the weeks-out plan that matches your window.`,
    },
  ];
}

function findPredictorSlug(resolved: ResolvedEventGuide): string | null {
  if (resolved.guide.predictorSlug) return resolved.guide.predictorSlug;
  if (resolved.race?.predictor_slug) return resolved.race.predictor_slug;
  return null;
}

export default async function EventGuidePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const resolved = resolveEventGuide(slug);
  if (!resolved) notFound();

  const { guide, trainingEvent } = resolved;
  const faqs = buildFaqs(resolved);
  const pageUrl = `${BASE_URL}/event/${guide.slug}`;
  const predictorSlug = findPredictorSlug(resolved);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          "@id": `${pageUrl}#article`,
          headline: `${guide.pageTitle} — Climbing, Pacing & Finish Times`,
          description: guide.intent,
          url: pageUrl,
          mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
          // Author and publisher referenced by @id so this article resolves
          // to the canonical Person + Organization entities declared in the
          // root layout's OrganizationJsonLd graph — keeps the sitewide
          // knowledge graph consolidated rather than re-declaring entities.
          author: { "@id": ENTITY_IDS.person },
          publisher: { "@id": ENTITY_IDS.organization },
          isPartOf: { "@id": ENTITY_IDS.website },
          about: {
            "@type": "SportsEvent",
            name: trainingEvent.name,
            sport: "Cycling",
            location: { "@type": "Place", name: trainingEvent.region },
          },
        }}
      />
      <FAQSchema faqs={faqs} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
            { "@type": "ListItem", position: 2, name: "Events", item: `${BASE_URL}/events` },
            { "@type": "ListItem", position: 3, name: guide.pageTitle, item: pageUrl },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                {trainingEvent.region.toUpperCase()} ·{" "}
                {trainingEvent.type.toUpperCase().replace("-", " ")}
              </p>
              <h1
                className="font-heading text-off-white mb-6 leading-none"
                style={{ fontSize: "var(--text-hero)" }}
              >
                {guide.pageTitle.toUpperCase()}
                <span className="text-coral">.</span>
              </h1>
              <p className="event-guide-intro text-foreground-muted text-lg md:text-xl leading-relaxed mb-6 max-w-2xl mx-auto">
                {trainingEvent.description}
              </p>
              <div className="inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-foreground-subtle font-body tracking-widest uppercase">
                <span>{trainingEvent.distanceKm} km</span>
                <span className="opacity-50">·</span>
                <span>
                  {trainingEvent.elevationGainM.toLocaleString()} m climbing
                </span>
                <span className="opacity-50">·</span>
                <span>{trainingEvent.typicalFinishTime}</span>
                <span className="opacity-50">·</span>
                <span>{trainingEvent.defaultMonth}</span>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Event overview */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-8">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                THE OVERVIEW
              </p>
              <h2
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT THE {trainingEvent.shortName.toUpperCase()} ACTUALLY IS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="font-heading text-coral text-xs tracking-widest mb-2">
                    TERRAIN
                  </p>
                  <p className="text-foreground-muted text-sm md:text-base leading-relaxed">
                    {guide.terrainSummary}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="font-heading text-coral text-xs tracking-widest mb-2">
                    WEATHER
                  </p>
                  <p className="text-foreground-muted text-sm md:text-base leading-relaxed">
                    {guide.weatherConditions}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Fitness demands */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-8">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                FITNESS DEMANDS
              </p>
              <h2
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT YOU NEED TO ARRIVE WITH.
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl border border-coral/20 bg-coral/5 p-5">
                  <p className="font-heading text-coral text-xs tracking-widest mb-2">
                    MINIMUM FTP
                  </p>
                  <p className="font-heading text-off-white text-3xl mb-1">
                    {guide.ftpRequirement.minimum}
                  </p>
                  <p className="text-foreground-muted text-xs">
                    to finish, well-fuelled
                  </p>
                </div>
                <div className="rounded-xl border border-coral/30 bg-coral/10 p-5">
                  <p className="font-heading text-coral text-xs tracking-widest mb-2">
                    COMPETITIVE FTP
                  </p>
                  <p className="font-heading text-off-white text-3xl mb-1">
                    {guide.ftpRequirement.competitive}
                  </p>
                  <p className="text-foreground-muted text-xs">
                    to ride the day on your terms
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="font-heading text-coral text-xs tracking-widest mb-2">
                    ENDURANCE
                  </p>
                  <p className="text-foreground-muted text-sm leading-relaxed">
                    {guide.enduranceDemands}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <p className="font-heading text-coral text-xs tracking-widest mb-2">
                  WHY THESE NUMBERS MATTER HERE
                </p>
                <p className="text-foreground-muted text-sm md:text-base leading-relaxed">
                  {guide.ftpRequirement.notes}
                </p>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Climbing demands */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-8">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                CLIMBING DEMANDS
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE CLIMBS, IN ORDER.
              </h2>
              <p className="text-foreground-muted text-base md:text-lg leading-relaxed mb-8 max-w-2xl">
                {guide.climbingNarrative}
              </p>
            </ScrollReveal>

            <div className="space-y-4">
              {guide.majorClimbs.map((climb, i) => (
                <ScrollReveal key={climb.name} direction="up" delay={i * 0.04}>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-2">
                      <h3 className="font-heading text-off-white text-xl md:text-2xl leading-tight">
                        {climb.name.toUpperCase()}
                      </h3>
                      {climb.positionInRide && (
                        <span className="text-coral font-heading text-xs tracking-widest">
                          {climb.positionInRide.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground-subtle font-body tracking-widest uppercase mb-3">
                      <span>{climb.lengthKm} km</span>
                      <span className="opacity-50">·</span>
                      <span>{climb.avgGradient}% avg</span>
                      {climb.maxGradient && (
                        <>
                          <span className="opacity-50">·</span>
                          <span>{climb.maxGradient}% max</span>
                        </>
                      )}
                      <span className="opacity-50">·</span>
                      <span>{climb.elevationGainM} m gain</span>
                    </div>
                    <p className="text-foreground-muted text-sm md:text-base leading-relaxed">
                      {climb.notes}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Finish times by ability */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-8">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                EXPECTED FINISH TIMES
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHERE YOU'LL LAND.
              </h2>
              <p className="text-foreground-muted text-base md:text-lg leading-relaxed mb-8 max-w-2xl">
                Use these bands to set a realistic goal. Pick the band closest
                to your current fitness — not the one above it. Pacing a band
                you haven't earned is the fastest way to a back-half blow-up.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guide.finishTimes.map((band, i) => (
                <ScrollReveal key={band.level} direction="up" delay={i * 0.04}>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 h-full">
                    <p className="font-heading text-coral text-xs tracking-widest mb-2">
                      {band.level.toUpperCase()}
                    </p>
                    <p className="font-heading text-off-white text-2xl mb-3">
                      {band.range}
                    </p>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      {band.fitnessProfile}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal direction="up" delay={0.2} className="mt-8 text-center">
              <Button
                href={
                  predictorSlug
                    ? `/predict?course=${predictorSlug}`
                    : `/ask?topic=${encodeURIComponent(trainingEvent.name + " finish time")}`
                }
                variant="secondary"
                size="lg"
                dataTrack={
                  predictorSlug
                    ? `event_guide_predict_${guide.slug}`
                    : `event_guide_ask_${guide.slug}`
                }
              >
                {predictorSlug
                  ? `Predict your ${trainingEvent.shortName} finish time →`
                  : `Ask Roadman about your ${trainingEvent.shortName} target →`}
              </Button>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Pick your weeks-out plan */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-8 text-center">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                THE TRAINING PLAN
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                HOW LONG TILL YOUR {trainingEvent.shortName.toUpperCase()}?
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto">
                Six weeks-out windows, each built around the demands of this
                course. Pick the one that matches your window today. The
                framework is free; coaching makes it personal.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PHASES.map((phase, i) => (
                <ScrollReveal key={phase.slug} direction="up" delay={i * 0.04}>
                  <Link
                    href={`/plan/${trainingEvent.slug}/${phase.slug}`}
                    className="block h-full"
                    data-track={`event_guide_phase_${phase.slug}`}
                  >
                    <Card hoverable className="h-full p-6">
                      <p className="font-heading text-coral text-xs tracking-widest mb-2">
                        {phase.weeksOut} {phase.weeksOut === 1 ? "WEEK" : "WEEKS"} OUT
                      </p>
                      <h3 className="font-heading text-off-white text-xl mb-3 leading-tight">
                        {phase.label.toUpperCase()}
                      </h3>
                      <p className="text-foreground-muted text-sm leading-relaxed">
                        {phase.tagline}
                      </p>
                    </Card>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Fuelling deep dive */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-6">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                FUELLING STRATEGY
              </p>
              <h2
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-section)" }}
              >
                EAT LIKE THE DAY DEMANDS.
              </h2>
              <p className="text-foreground-muted text-base md:text-lg leading-relaxed">
                {guide.fuellingDeepDive}
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Pacing deep dive */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-6">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                PACING STRATEGY
              </p>
              <h2
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-section)" }}
              >
                RIDE IT IN THE RIGHT ORDER.
              </h2>
              <p className="text-foreground-muted text-base md:text-lg leading-relaxed">
                {guide.pacingDeepDive}
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Common mistakes */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-8">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                COMMON MISTAKES
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                DON'T DO THIS.
              </h2>
              <p className="text-foreground-muted text-base md:text-lg leading-relaxed mb-8 max-w-2xl">
                Patterns we see at the {trainingEvent.shortName} every year.
                Each one has a fix that costs nothing — except the discipline
                to actually use it on the day.
              </p>
            </ScrollReveal>

            <div className="space-y-4">
              {guide.detailedMistakes.map((m, i) => (
                <ScrollReveal key={m.mistake} direction="up" delay={i * 0.04}>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="font-heading text-coral text-xs tracking-widest mt-1 shrink-0">
                        MISTAKE
                      </span>
                      <p className="font-heading text-off-white text-lg leading-tight">
                        {m.mistake}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-heading text-coral text-xs tracking-widest mt-1 shrink-0">
                        FIX
                      </span>
                      <p className="text-foreground-muted text-sm md:text-base leading-relaxed">
                        {m.fix}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Race predictor / Ask Roadman */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10 text-center">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">
                  {predictorSlug ? "RACE PREDICTOR" : "ASK ROADMAN"}
                </p>
                <h2
                  className="font-heading text-off-white mb-4"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  {predictorSlug
                    ? `WHAT WILL YOU ACTUALLY RIDE?`
                    : `GOT A QUESTION ABOUT THE ${trainingEvent.shortName.toUpperCase()}?`}
                </h2>
                <p className="text-foreground-muted text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                  {predictorSlug
                    ? `Plug your numbers into the Race Predictor and we'll model your ${trainingEvent.shortName} finish time on the actual course profile — climb-by-climb, with pacing recommendations.`
                    : `The ${trainingEvent.shortName} doesn't have a predictor course yet. Ask Roadman directly — Anthony reads every question and replies with event-specific advice.`}
                </p>
                <Button
                  href={
                    predictorSlug
                      ? `/predict?course=${predictorSlug}`
                      : `/ask?topic=${encodeURIComponent(trainingEvent.name)}`
                  }
                  size="lg"
                  dataTrack={
                    predictorSlug
                      ? `event_guide_predict_cta_${guide.slug}`
                      : `event_guide_ask_cta_${guide.slug}`
                  }
                >
                  {predictorSlug
                    ? `Predict your ${trainingEvent.shortName} time`
                    : `Ask Roadman`}
                </Button>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* FAQ */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-8">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                FAQ
              </p>
              <h2
                className="font-heading text-off-white"
                style={{ fontSize: "var(--text-section)" }}
              >
                {trainingEvent.shortName.toUpperCase()} TRAINING, ANSWERED.
              </h2>
            </ScrollReveal>
            <div className="space-y-4">
              {faqs.map((f, i) => (
                <ScrollReveal key={f.question} direction="up" delay={i * 0.04}>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
                    <h3 className="font-heading text-off-white text-base md:text-lg mb-2 leading-tight">
                      {f.question}
                    </h3>
                    <p className="text-foreground-muted text-sm md:text-base leading-relaxed">
                      {f.answer}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Coaching CTA */}
        <Section background="charcoal" className="section-glow-coral !py-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-8 md:p-12 text-center">
                <p className="font-heading text-coral text-sm tracking-widest mb-3">
                  WANT THIS BUILT AROUND YOUR FTP?
                </p>
                <h2
                  className="font-heading text-off-white mb-3"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  PLAN MADE FOR YOU, NOT FOR THE AVERAGE.
                </h2>
                <p className="text-foreground-muted text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                  The framework here gets you in the right territory. Roadman
                  coaching builds it around your FTP, your week, your weeks
                  remaining, and your delivery via TrainingPeaks.
                </p>
                <Button
                  href="/apply"
                  size="lg"
                  dataTrack={`event_guide_apply_${guide.slug}`}
                >
                  Apply for Coaching
                </Button>
                <div className="mt-4">
                  <Button
                    href="/coaching"
                    variant="ghost"
                    size="lg"
                    dataTrack={`event_guide_coaching_${guide.slug}`}
                  >
                    How Coaching Works
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Back nav */}
        <Section background="charcoal" className="!pt-0 !pb-16">
          <Container width="narrow" className="text-center">
            <Link
              href={`/plan/${trainingEvent.slug}`}
              className="text-coral hover:text-coral/80 text-sm font-heading tracking-widest transition-colors"
            >
              ← TRAINING PLAN HUB FOR THE {trainingEvent.shortName.toUpperCase()}
            </Link>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

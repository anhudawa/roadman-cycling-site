import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";
import {
  getEvent,
  getPhase,
  getAllPlanCombinations,
  getAdjacentPhases,
  type TrainingEvent,
  type TrainingPhase,
} from "@/lib/training-plans";

/**
 * Programmatic SEO landing: /plan/[event]/[weeksOut]
 *
 * 36+ unique pages (6 events × 6 phases) targeting long-tail queries
 * like "wicklow 200 training plan 8 weeks", "ride london 4 week
 * training plan", etc. Each page combines event-specific content
 * with phase-specific training advice to produce genuinely useful
 * content at scale.
 */

interface Params {
  event: string;
  weeksOut: string;
}

export function generateStaticParams() {
  return getAllPlanCombinations();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { event: eventSlug, weeksOut } = await params;
  const event = getEvent(eventSlug);
  const phase = getPhase(weeksOut);
  if (!event || !phase) return { title: "Training Plan" };

  const title = `${event.name} Training Plan — ${phase.weeksOut} Weeks Out`;
  const description = `Personalised ${phase.weeksOut}-week training plan for the ${event.name} (${event.distanceKm}km, ${event.elevationGainM}m climbing, ${event.region}). ${phase.tagline}`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://roadmancycling.com/plan/${event.slug}/${phase.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://roadmancycling.com/plan/${event.slug}/${phase.slug}`,
    },
  };
}

export default async function PlanPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { event: eventSlug, weeksOut } = await params;
  const event = getEvent(eventSlug);
  const phase = getPhase(weeksOut);
  if (!event || !phase) notFound();

  const { prev, next } = getAdjacentPhases(phase.slug);
  const faqs = buildFaqs(event, phase);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: `${event.name} Training Plan: ${phase.weeksOut} Weeks Out`,
          description: `A ${phase.weeksOut}-week training plan for the ${event.name}. ${phase.focus}`,
          url: `https://roadmancycling.com/plan/${event.slug}/${phase.slug}`,
          totalTime: `P${phase.weeksOut}W`,
          supply: event.kitAngle,
          step: phase.weekStructure.map((s, i) => ({
            "@type": "HowToStep",
            position: i + 1,
            name: `${s.day}: ${s.session}`,
            text: s.detail,
          })),
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".plan-tagline"],
          },
        }}
      />
      <FAQSchema faqs={faqs} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://roadmancycling.com",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Training Plans",
              item: "https://roadmancycling.com/plan",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: event.name,
              item: `https://roadmancycling.com/plan/${event.slug}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: `${phase.weeksOut} weeks out`,
              item: `https://roadmancycling.com/plan/${event.slug}/${phase.slug}`,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow">
            <ScrollReveal direction="up" eager>
              <nav
                aria-label="Breadcrumb"
                className="text-xs text-foreground-subtle mb-4 uppercase tracking-widest"
              >
                <Link href="/" className="hover:text-coral">Home</Link>
                <span className="mx-2">/</span>
                <Link href="/plan" className="hover:text-coral">Training Plans</Link>
                <span className="mx-2">/</span>
                <span className="text-off-white">{event.shortName}</span>
              </nav>
              <p className="text-coral font-heading text-sm tracking-widest mb-3">
                {phase.label} · {phase.weeksOut} WEEKS OUT
              </p>
              <h1
                className="font-heading text-off-white mb-5 leading-none"
                style={{ fontSize: "var(--text-hero)" }}
              >
                {event.name.toUpperCase()} — <span className="text-coral">{phase.weeksOut} WEEKS OUT</span>
              </h1>
              <p className="plan-tagline text-foreground-muted text-lg md:text-xl leading-relaxed mb-6">
                {phase.tagline} Built around the {event.distanceKm}km /{" "}
                {event.elevationGainM.toLocaleString()}m profile of the{" "}
                {event.shortName} in {event.region}.
              </p>
              <div className="inline-flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-foreground-subtle font-body tracking-widest uppercase">
                <span>{event.distanceKm} km</span>
                <span className="opacity-50">·</span>
                <span>{event.elevationGainM.toLocaleString()} m climbing</span>
                <span className="opacity-50">·</span>
                <span>{event.typicalFinishTime}</span>
                <span className="opacity-50">·</span>
                <span>{event.defaultMonth}</span>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* The focus — what training emphasises */}
        <Section background="charcoal" className="!py-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                THE FOCUS RIGHT NOW
              </p>
              <h2
                className="font-heading text-off-white mb-5"
                style={{ fontSize: "var(--text-section)" }}
              >
                {phase.weeksOut === 1
                  ? "DON'T DO ANYTHING CLEVER."
                  : phase.weeksOut <= 2
                    ? "SHED FATIGUE."
                    : phase.weeksOut <= 4
                      ? "SHARPEN FOR THE DATE."
                      : phase.weeksOut <= 8
                        ? "BUILD THE INTENSITY."
                        : "BUILD THE ENGINE."}
              </h2>
              <p className="text-foreground-muted text-lg leading-relaxed">
                {phase.focus}
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* This week's anchor session */}
        <Section background="charcoal" className="!pt-0 !pb-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="rounded-2xl border border-coral/20 bg-gradient-to-br from-coral/10 via-deep-purple/30 to-deep-purple/50 p-7 md:p-10">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">
                  THIS WEEK&apos;S ANCHOR SESSION
                </p>
                <h3 className="font-heading text-off-white text-2xl md:text-3xl mb-4 leading-tight">
                  {phase.anchorSession.name.toUpperCase()}
                </h3>
                <p className="text-foreground-muted text-base md:text-lg leading-relaxed">
                  {phase.anchorSession.detail}
                </p>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Full week structure */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-10">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                THE WEEK
              </p>
              <h2
                className="font-heading text-off-white"
                style={{ fontSize: "var(--text-section)" }}
              >
                A TYPICAL WEEK, {phase.weeksOut} WEEKS OUT
              </h2>
            </ScrollReveal>
            <div className="space-y-3">
              {phase.weekStructure.map((s, i) => (
                <ScrollReveal key={s.day} direction="up" delay={i * 0.04}>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                    <p className="font-heading text-coral text-sm tracking-widest uppercase md:w-32 shrink-0">
                      {s.day}
                    </p>
                    <div className="flex-1">
                      <p className="font-heading text-off-white text-base md:text-lg leading-tight mb-1">
                        {s.session.toUpperCase()}
                      </p>
                      <p className="text-foreground-muted text-sm leading-relaxed">
                        {s.detail}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Gotcha */}
            <ScrollReveal direction="up">
              <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6 border-l-4 border-l-coral">
                <p className="font-heading text-coral text-xs tracking-widest mb-2">
                  DON&apos;T DO THIS
                </p>
                <p className="text-off-white text-base leading-relaxed">
                  {phase.gotcha}
                </p>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Event-specific section */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-10">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                EVENT INTEL
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT THE {event.shortName.toUpperCase()} ACTUALLY DEMANDS
              </h2>
              <p className="text-foreground-muted text-lg leading-relaxed">
                {event.description}
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.1} className="mb-10">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                KEY CHARACTERISTICS
              </p>
              <ul className="space-y-2">
                {event.keyCharacteristics.map((c) => (
                  <li
                    key={c}
                    className="flex items-start gap-2 text-foreground-muted leading-relaxed"
                  >
                    <span className="text-coral mt-0.5 shrink-0">&#10003;</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.15} className="mb-10">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                COMMON MISTAKES
              </p>
              <ul className="space-y-2">
                {event.commonMistakes.map((m) => (
                  <li
                    key={m}
                    className="flex items-start gap-2 text-foreground-muted leading-relaxed"
                  >
                    <span className="text-coral mt-0.5 shrink-0">✕</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <p className="font-heading text-coral text-xs tracking-widest mb-2">PACING</p>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  {event.pacingStrategy}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <p className="font-heading text-coral text-xs tracking-widest mb-2">FUELLING</p>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  {event.nutritionAngle}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <p className="font-heading text-coral text-xs tracking-widest mb-2">KIT</p>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  {event.kitAngle}
                </p>
              </div>
            </ScrollReveal>
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
                  COACHED FOR YOUR EVENT.
                </h2>
                <p className="text-foreground-muted text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                  The Not Done Yet coaching community runs the coached
                  five-pillar system built around your actual event date.
                  Personalised TrainingPeaks plan, weekly calls, expert
                  masterclasses. 7-day free trial.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button href="/apply" size="lg" dataTrack="plan_phase_apply">
                    Apply for Coaching
                  </Button>
                  <Button href="/coaching" variant="ghost" size="lg" dataTrack="plan_phase_coaching">
                    How Coaching Works
                  </Button>
                </div>
                <p className="text-foreground-subtle text-sm mt-6">
                  $195/month &middot; 7-day free trial &middot; Cancel anytime
                </p>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* FAQ */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                FAQ
              </p>
              <h2
                className="font-heading text-off-white mb-8"
                style={{ fontSize: "var(--text-section)" }}
              >
                COMMON QUESTIONS AT {phase.weeksOut} WEEKS OUT
              </h2>
            </ScrollReveal>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <ScrollReveal key={f.question} direction="up" delay={i * 0.05}>
                  <details className="rounded-xl border border-white/10 bg-white/[0.03] p-5 group">
                    <summary className="cursor-pointer font-heading text-off-white text-base md:text-lg leading-tight list-none flex items-start justify-between gap-4">
                      <span>{f.question}</span>
                      <span className="text-coral shrink-0 transition-transform group-open:rotate-45 text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <p className="text-foreground-muted text-sm leading-relaxed mt-4">
                      {f.answer}
                    </p>
                  </details>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Adjacent phases + related */}
        <Section background="charcoal" className="!py-14">
          <Container width="narrow">
            <p className="font-heading text-coral text-xs tracking-widest mb-5 text-center">
              OTHER PHASES FOR THE {event.shortName.toUpperCase()}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {prev && (
                <Link
                  href={`/plan/${event.slug}/${prev.slug}`}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-5 hover:border-coral/30 hover:bg-white/[0.06] transition-all block"
                >
                  <p className="text-xs text-foreground-subtle uppercase tracking-widest mb-1">
                    Earlier phase ← {prev.weeksOut} weeks out
                  </p>
                  <p className="font-heading text-off-white text-base leading-tight">
                    {prev.label}
                  </p>
                </Link>
              )}
              {next && (
                <Link
                  href={`/plan/${event.slug}/${next.slug}`}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-5 hover:border-coral/30 hover:bg-white/[0.06] transition-all block"
                >
                  <p className="text-xs text-foreground-subtle uppercase tracking-widest mb-1">
                    Later phase → {next.weeksOut} weeks out
                  </p>
                  <p className="font-heading text-off-white text-base leading-tight">
                    {next.label}
                  </p>
                </Link>
              )}
            </div>

            {event.blogSlug && (
              <div className="text-center">
                <Link
                  href={`/blog/${event.blogSlug}`}
                  className="text-coral text-sm hover:underline"
                >
                  Read the full {event.shortName} guide &rarr;
                </Link>
              </div>
            )}
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

/** Event × phase FAQ generator — 4-5 targeted questions per combination. */
function buildFaqs(
  event: TrainingEvent,
  phase: TrainingPhase,
): { question: string; answer: string }[] {
  const qs: { question: string; answer: string }[] = [];

  qs.push({
    question: `Is ${phase.weeksOut} weeks enough to train for the ${event.name}?`,
    answer:
      phase.weeksOut >= 12
        ? `Yes, ${phase.weeksOut} weeks is a strong window. That's enough time for a full base phase, build, peak, and taper — the classical periodisation structure. ${event.elevationGainM.toLocaleString()}m of climbing over ${event.distanceKm}km is built with sustained Z2 volume (base) + threshold work (build) in that order.`
        : phase.weeksOut >= 4
          ? `Yes, if you already have a reasonable aerobic base. ${phase.weeksOut} weeks out means peak and taper — we can sharpen and refine, but we can't build new aerobic fitness from scratch. If you're starting from zero now, aim for finishing rather than personal bests.`
          : phase.weeksOut >= 2
            ? `${phase.weeksOut} weeks out your training can't meaningfully change your fitness — you're in taper. Focus on recovery, hydration, familiarisation with your kit + fuelling, and event-day logistics. Don't try to add fitness this close to the event.`
            : `Race week is about showing up fresh. No new fitness gains possible in a week. Focus on sleep, hydration, carb loading 48-72 hours out, and mental prep. Any hard session this week costs you more than it gives.`,
  });

  qs.push({
    question: `What's the hardest part of the ${event.name}?`,
    answer: `${event.keyCharacteristics[0]}. ${event.commonMistakes[0].replace(/^\w/, (c) => c.toLowerCase())} — so pacing discipline is the single biggest lever most amateurs miss. ${event.pacingStrategy.split(".")[0]}.`,
  });

  qs.push({
    question: `How many hours a week should I train at ${phase.weeksOut} weeks out from the ${event.name}?`,
    answer:
      phase.weeksOut >= 12
        ? `Aim for 8-12 hours/week if you're targeting a strong finish. The long weekend ride is the anchor (3-4 hours at ${phase.weeksOut > 16 ? "early base" : phase.weeksOut > 12 ? "late base" : "build"} intensities) plus 3-4 structured weekday sessions. Volume matters more than intensity at this phase.`
        : phase.weeksOut >= 4
          ? `Reduce to 8-10 hours with rising intensity quality. This is the peak phase — fewer, sharper sessions. Long weekend ride stays but drops slightly (3-4 hours with event-specific work). Weekday sessions are shorter and more intense.`
          : `Drop to 6-8 hours with minimal intensity. The taper protects the fitness you've built rather than growing more. Short, sharp openers to keep legs awake. Nothing aerobically challenging.`,
  });

  qs.push({
    question: `Do I need a coach to train for the ${event.name}?`,
    answer: `You don't need a coach to finish. You do need structure. If you're new to sportives, have a target finish time, have a plateau you can't break, or have a history of peaking wrong, a coached plan pays for itself. Inside the Not Done Yet coaching community the plan is built backwards from your event date — base, build, peak, taper timed to the week the ${event.name} runs. 7-day free trial, $195/mo.`,
  });

  qs.push({
    question: `What gearing should I run for the ${event.name}?`,
    answer: event.kitAngle,
  });

  return qs;
}

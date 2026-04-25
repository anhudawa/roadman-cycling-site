import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";
import {
  getEvent,
  getAllEventSlugs,
  PHASES,
  type TrainingEvent,
} from "@/lib/training-plans";

/**
 * Event-level hub: /plan/[event]
 *
 * Sits between /plan (index of all events) and /plan/[event]/[weeksOut]
 * (phase-specific plans). Previously a 404 because only the phase
 * children existed; that broke the breadcrumb graph and wasted the
 * natural "{event} training plan" query which maps here, not to a
 * specific phase.
 */

interface Params {
  event: string;
}

export function generateStaticParams() {
  return getAllEventSlugs().map((event) => ({ event }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { event: eventSlug } = await params;
  const event = getEvent(eventSlug);
  if (!event) return { title: "Training Plan" };

  const title = `${event.name} Training Plan — ${event.distanceKm}km, ${event.elevationGainM.toLocaleString()}m`;
  const description = `Complete training framework for the ${event.name} in ${event.region}. ${event.description.split(".")[0]}. Pick your weeks-out window.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://roadmancycling.com/plan/${event.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://roadmancycling.com/plan/${event.slug}`,
    },
  };
}

function buildFaqs(event: TrainingEvent): { question: string; answer: string }[] {
  return [
    {
      question: `How long should I train for the ${event.name}?`,
      answer: `For the ${event.name} (${event.distanceKm}km with ${event.elevationGainM.toLocaleString()}m of climbing), most riders benefit from at least 12-16 weeks of structured preparation. If you've been riding consistently, 8 weeks of focused work can still be enough to transform your result. Pick the weeks-out plan that matches your window.`,
    },
    {
      question: `What's the typical finish time for the ${event.name}?`,
      answer: `Most amateur finishers complete the ${event.name} in ${event.typicalFinishTime}. The spread is driven by climbing fitness more than flat speed — the course has ${event.elevationGainM.toLocaleString()}m of vertical, and pacing the climbs is what separates a strong finish from a suffering one.`,
    },
    {
      question: `When does the ${event.name} take place?`,
      answer: `The ${event.name} typically runs in ${event.defaultMonth}. That sets the training window: count back from your event date and pick the weeks-out plan that matches.`,
    },
    {
      question: `What's the biggest mistake riders make at the ${event.name}?`,
      answer: event.commonMistakes[0],
    },
    {
      question: `How should I pace the ${event.name}?`,
      answer: event.pacingStrategy,
    },
  ];
}

export default async function PlanEventHubPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { event: eventSlug } = await params;
  const event = getEvent(eventSlug);
  if (!event) notFound();

  const faqs = buildFaqs(event);
  const eventUrl = `https://roadmancycling.com/plan/${event.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${event.name} Training Plan`,
          description: `A complete training framework for the ${event.name} (${event.distanceKm}km, ${event.elevationGainM.toLocaleString()}m climbing, ${event.region}). Six weeks-out windows — 16, 12, 8, 4, 2, 1.`,
          url: eventUrl,
          hasPart: PHASES.map((p) => ({
            "@type": "WebPage",
            name: `${event.name} — ${p.weeksOut} Weeks Out`,
            url: `${eventUrl}/${p.slug}`,
          })),
          about: {
            "@type": "SportsEvent",
            name: event.name,
            sport: "Cycling",
            startDate: (() => {
              const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
              const mi = months.indexOf(event.defaultMonth);
              if (mi < 0) return undefined;
              const now = new Date();
              const year = mi >= now.getMonth() ? now.getFullYear() : now.getFullYear() + 1;
              return `${year}-${String(mi + 1).padStart(2, "0")}`;
            })(),
            location: {
              "@type": "Place",
              name: event.region,
            },
          },
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".event-hub-intro"],
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
              item: eventUrl,
            },
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
                {event.region.toUpperCase()} · {event.type.toUpperCase().replace("-", " ")}
              </p>
              <h1
                className="font-heading text-off-white mb-6 leading-none"
                style={{ fontSize: "var(--text-hero)" }}
              >
                {event.name.toUpperCase()}
                <br />
                <span className="text-coral">TRAINING PLAN.</span>
              </h1>
              <p className="event-hub-intro text-foreground-muted text-lg md:text-xl leading-relaxed mb-6 max-w-2xl mx-auto">
                {event.description}
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

        {/* Pick your window */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-10 text-center">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                PICK YOUR WINDOW
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                HOW LONG TILL YOUR {event.shortName.toUpperCase()}?
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto">
                Count back from your event date. Pick the weeks-out plan that
                matches your window. Each one is a week-by-week framework
                built around the demands of this specific course.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PHASES.map((phase, i) => (
                <ScrollReveal key={phase.slug} direction="up" delay={i * 0.04}>
                  <Link href={`/plan/${event.slug}/${phase.slug}`} className="block h-full">
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

        {/* Event-specific intel */}
        <Section background="deep-purple" grain>
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
                    <span className="text-coral mt-0.5 shrink-0">&#10007;</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <p className="font-heading text-coral text-xs tracking-widest mb-2">
                  PACING
                </p>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  {event.pacingStrategy}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <p className="font-heading text-coral text-xs tracking-widest mb-2">
                  FUELLING
                </p>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  {event.nutritionAngle}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <p className="font-heading text-coral text-xs tracking-widest mb-2">
                  KIT
                </p>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  {event.kitAngle}
                </p>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* FAQ */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-10">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                FAQ
              </p>
              <h2
                className="font-heading text-off-white"
                style={{ fontSize: "var(--text-section)" }}
              >
                {event.shortName.toUpperCase()} TRAINING, ANSWERED.
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
                  READY FOR A PLAN MADE FOR YOU?
                </h2>
                <p className="text-foreground-muted text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                  The framework above gets you in the right territory.
                  Roadman coaching builds it around your FTP, your life, and
                  your weeks remaining.
                </p>
                <Button href="/apply" size="lg" dataTrack="plan_hub_apply">
                  Apply for Coaching
                </Button>
                <div className="mt-4">
                  <Button href="/coaching" variant="ghost" size="lg" dataTrack="plan_hub_coaching">
                    How Coaching Works
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Back to /plan */}
        <Section background="charcoal" className="!pt-0 !pb-16">
          <Container width="narrow" className="text-center">
            <Link
              href="/plan"
              className="text-coral hover:text-coral/80 text-sm font-heading tracking-widest transition-colors"
            >
              ← BACK TO ALL TRAINING PLANS
            </Link>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

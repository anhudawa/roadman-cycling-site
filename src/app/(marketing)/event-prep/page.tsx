import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import { EVENTS, PHASES, getEvent } from "@/lib/training-plans";
import { getAllPosts } from "@/lib/blog";

/**
 * /event-prep — front door for the bucket-list gran fondo achiever.
 * Pulls the existing /plan event data, the tools shelf, and curated
 * blog posts into one decision surface, then routes to coaching via
 * the Plateau Diagnostic → Find Your Fit ladder.
 *
 * Server-rendered so the countdown numbers are accurate at request
 * time without shipping client JS.
 */

export const metadata: Metadata = {
  title: "Cycling Event Prep Hub — Train, Fuel, and Pace Your Target Event",
  description:
    "Your event is on the calendar. Get the training plan, fuelling math, pacing strategy, and taper protocol that turn a bucket-list sportive into a finish you're proud of. Étape, Marmotte, Ride London, Fred Whitton, Mallorca 312 and more.",
  alternates: {
    canonical: `${SITE_ORIGIN}/event-prep`,
  },
  openGraph: {
    title: "Cycling Event Prep Hub — Roadman Cycling",
    description:
      "The training plan, fuelling math, pacing strategy, and taper protocol for your target event. Direct, evidence-based, no fluff.",
    type: "website",
    url: `${SITE_ORIGIN}/event-prep`,
    images: [
      {
        url: `${SITE_ORIGIN}/event-prep/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Roadman Cycling — Event Prep Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cycling Event Prep Hub — Roadman Cycling",
    description:
      "Train, fuel, pace and taper for your target sportive. Built around the events you're actually riding.",
  },
  robots: { index: true, follow: true },
};

/* ============================================================ */
/* Featured events with approximate 2026 / 2027 dates           */
/* ============================================================ */

interface FeaturedEvent {
  slug: string;
  /** Approximate next-edition date (ISO string at midday UTC). */
  nextEdition: string;
  /** Display label for the date. */
  dateLabel: string;
}

/**
 * Approximate next-edition dates. We don't pretend these are official
 * — that's the organiser's job. We use them to surface a realistic
 * "weeks until your event" countdown so a rider knows whether base,
 * build, peak or taper is the right call right now.
 */
const FEATURED_EVENTS: FeaturedEvent[] = [
  { slug: "etape-du-tour", nextEdition: "2026-07-12T12:00:00Z", dateLabel: "12 July 2026" },
  { slug: "marmotte", nextEdition: "2026-07-04T12:00:00Z", dateLabel: "4 July 2026" },
  { slug: "maratona-dles-dolomites", nextEdition: "2026-07-05T12:00:00Z", dateLabel: "5 July 2026" },
  { slug: "ride-london-100", nextEdition: "2026-05-31T12:00:00Z", dateLabel: "31 May 2026" },
  { slug: "wicklow-200", nextEdition: "2026-06-07T12:00:00Z", dateLabel: "7 June 2026" },
  { slug: "fred-whitton-challenge", nextEdition: "2026-05-10T12:00:00Z", dateLabel: "10 May 2026" },
  { slug: "haute-route-alps", nextEdition: "2026-08-23T12:00:00Z", dateLabel: "23 Aug 2026" },
  { slug: "gran-fondo-nyc", nextEdition: "2026-05-17T12:00:00Z", dateLabel: "17 May 2026" },
  { slug: "mallorca-312", nextEdition: "2027-04-24T12:00:00Z", dateLabel: "24 Apr 2027" },
];

/* ============================================================ */
/* Curated blog posts — race nutrition, taper, heat, altitude   */
/* ============================================================ */

const EVENT_PREP_BLOG_SLUGS = [
  "cycling-nutrition-race-day-guide",
  "cycling-tapering-guide",
  "cycling-taper-discipline-15-percent-gain",
  "cycling-carbs-per-hour-fuel-like-a-pro",
  "cycling-nutrition-plan-100-mile-sportive",
  "cycling-heat-training-guide",
  "cycling-altitude-training",
  "cycling-sportive-preparation",
  "cycling-race-tactics-guide",
  "travel-fatigue-cycling-pre-event-protocol",
  "cycling-cramp-prevention",
  "cycling-climbing-tips-stop-getting-dropped",
];

/* ============================================================ */
/* Tools shelf                                                  */
/* ============================================================ */

const TOOLS = [
  {
    href: "/predict",
    name: "Race Predictor",
    blurb: "Project your finish time from FTP, weight and the course profile. Sets a realistic target, not a hopeful one.",
  },
  {
    href: "/tools/ftp-zones",
    name: "FTP Zones",
    blurb: "Threshold, tempo, sweet spot, VO2. The wattage ceilings every interval in your build phase sits underneath.",
  },
  {
    href: "/tools/fuelling",
    name: "In-Ride Fuelling",
    blurb: "Carbs per hour by event duration. The single biggest performance lever amateurs leave on the table.",
  },
  {
    href: "/tools/race-weight",
    name: "Race Weight",
    blurb: "Find your honest race weight without dieting yourself into a hole the week before the event.",
  },
  {
    href: "/tools/hr-zones",
    name: "HR Zones",
    blurb: "Heart-rate ceilings for the days power isn't talking — long Zone 2, hot days, and pacing the early climbs.",
  },
  {
    href: "/tools/tyre-pressure",
    name: "Tyre Pressure",
    blurb: "Real numbers for your weight, tyre width, and surface. Saves watts the rest of your training can't.",
  },
];

/* ============================================================ */
/* FAQ                                                          */
/* ============================================================ */

const FAQ = [
  {
    question: "How many weeks out should I start training for a sportive or gran fondo?",
    answer:
      "Sixteen weeks gives you a full base-build-peak-taper cycle and is what every Roadman plan is built around. Twelve is workable if you've kept a year-round Zone 2 base. Eight or fewer means you're protecting fitness and pacing the day, not building. The earlier you start, the less of the event you have to survive and the more of it you actually ride.",
  },
  {
    question: "What's the single biggest mistake amateurs make on event day?",
    answer:
      "Underfuelling. Most riders show up with a 30-40g carbs/hour habit from training and try to ride a 6-9 hour event on it. The current evidence supports 80-120g of carbs per hour for events over 2.5 hours, from a 2:1 glucose-to-fructose mix. You have to gut-train this in the build phase — race day is not the day to find out your stomach can't handle it.",
  },
  {
    question: "How should I taper for an event without losing fitness?",
    answer:
      "Drop volume by 30-50% across the final 10-14 days while keeping intensity short and sharp — race-pace openers, not threshold blocks. You can't add fitness in the last fortnight, but you can shed every gram of fatigue. Riders who taper properly typically arrive a measurable 5-15% sharper than the same rider who panic-trains through the final week.",
  },
  {
    question: "Do I need a coach to prepare for a bucket-list event?",
    answer:
      "No — but most riders self-coaching through their first big sportive end up either overcooked or undertrained. The Roadman library, the /plan event pages, and the tools here will get a disciplined rider to the start line in shape. The Not Done Yet community adds the structured plan, weekly accountability, and the room to ask questions. The Inner Circle adds daily coach feedback when the stakes are high enough that you don't want to guess.",
  },
];

/* ============================================================ */
/* Countdown helpers                                            */
/* ============================================================ */

function weeksUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.round(ms / (1000 * 60 * 60 * 24 * 7));
}

function focusForWeeks(weeks: number): { phase: string; focus: string } {
  if (weeks <= 0) return { phase: "Race day", focus: "Pace it. Fuel it. Enjoy it." };
  if (weeks === 1) return { phase: "Race week", focus: "Sleep, hydrate, openers. Don't do anything clever." };
  if (weeks <= 2) return { phase: "Taper", focus: "Drop volume. Hold sharpness with race-pace openers." };
  if (weeks <= 4) return { phase: "Peak", focus: "Event-specific intensity. Volume drops, quality rises." };
  if (weeks <= 8) return { phase: "Build", focus: "Threshold + VO2 max. The real fitness moves now." };
  if (weeks <= 12) return { phase: "Late base", focus: "Tempo work begins. Long rides get longer." };
  return { phase: "Base", focus: "Aerobic foundation. Volume rules. Resist the urge to go hard." };
}

/* ============================================================ */
/* Page                                                         */
/* ============================================================ */

export default function EventPrepPage() {
  const featuredWithCountdown = FEATURED_EVENTS.map((f) => {
    const event = getEvent(f.slug);
    const weeks = weeksUntil(f.nextEdition);
    const focus = focusForWeeks(weeks);
    return { ...f, event, weeks, focus };
  })
    .filter((row): row is typeof row & { event: NonNullable<typeof row.event> } => Boolean(row.event))
    .sort((a, b) => {
      // Upcoming first (sorted by proximity), then past editions at the bottom.
      const aFuture = a.weeks >= 0;
      const bFuture = b.weeks >= 0;
      if (aFuture !== bFuture) return aFuture ? -1 : 1;
      return Math.abs(a.weeks) - Math.abs(b.weeks);
    });

  const blogPosts = (() => {
    const all = getAllPosts();
    return EVENT_PREP_BLOG_SLUGS.map((slug) => all.find((p) => p.slug === slug)).filter(
      (p): p is NonNullable<typeof p> => Boolean(p),
    );
  })();

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
      { "@type": "ListItem", position: 2, name: "Event Prep", item: `${SITE_ORIGIN}/event-prep` },
    ],
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_ORIGIN}/event-prep#webpage`,
    url: `${SITE_ORIGIN}/event-prep`,
    name: "Cycling Event Prep Hub",
    description:
      "Training plans, fuelling tools, pacing guides, and coaching pathways for cyclists targeting a specific sportive, gran fondo, or bucket-list event.",
    isPartOf: { "@id": ENTITY_IDS.website },
    publisher: { "@id": ENTITY_IDS.organization },
    inLanguage: "en",
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${SITE_ORIGIN}/event-prep/opengraph-image`,
    },
    hasPart: featuredWithCountdown.map((row) => ({
      "@type": "WebPage",
      name: `${row.event.name} Training Plan`,
      url: `${SITE_ORIGIN}/plan/${row.event.slug}`,
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbsJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <FAQSchema faqs={FAQ} />

      <Header />

      <main id="main-content">
        {/* ─────────────── Hero ─────────────── */}
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                EVENT PREP
              </p>
              <h1
                className="font-heading text-off-white mb-6 leading-none uppercase"
                style={{ fontSize: "var(--text-hero)" }}
              >
                Your event is on the calendar.{" "}
                <span className="text-coral">Are you actually ready?</span>
              </h1>
              <p className="text-foreground-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Bucket-list sportives reward riders who showed up with a plan
                and a fuelling strategy. They eat everyone else alive. This is
                where you turn a date on the calendar into a finish you're
                proud of.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
                <Button href="#events" size="lg" dataTrack="event_prep_hero_events">
                  Find Your Event Plan
                </Button>
                <Button
                  href="/plateau"
                  variant="ghost"
                  size="lg"
                  dataTrack="event_prep_hero_plateau"
                >
                  Take the Plateau Diagnostic
                </Button>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ─────────────── Countdown framework ─────────────── */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="mb-10 text-center">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                THE CLOCK IS THE COACH
              </p>
              <h2
                className="font-heading text-off-white uppercase"
                style={{ fontSize: "var(--text-section)" }}
              >
                Your event is X weeks away — here's what to focus on
              </h2>
              <p className="text-foreground-muted text-base md:text-lg leading-relaxed max-w-2xl mx-auto mt-5">
                Every Roadman plan moves through the same four phases. Where
                you are in the calendar dictates what good training looks like
                this week — not what your group ride buddies are doing.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-6xl mx-auto">
              {PHASES.map((p, i) => (
                <ScrollReveal key={p.slug} direction="up" delay={i * 0.04}>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 h-full flex flex-col">
                    <p className="font-heading text-coral text-3xl leading-none">
                      {p.weeksOut}w
                    </p>
                    <p className="font-heading text-off-white text-sm uppercase tracking-wider mt-3">
                      {p.label}
                    </p>
                    <p className="text-foreground-muted text-xs leading-relaxed mt-2 flex-1">
                      {p.tagline}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ─────────────── Events grid ─────────────── */}
        <Section background="deep-purple" grain id="events">
          <Container>
            <ScrollReveal direction="up" className="mb-10 text-center">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                BY EVENT
              </p>
              <h2
                className="font-heading text-off-white uppercase"
                style={{ fontSize: "var(--text-section)" }}
              >
                The events riders are training for
              </h2>
              <p className="text-foreground-muted text-base md:text-lg leading-relaxed max-w-2xl mx-auto mt-5">
                Each event opens onto an event-specific training plan with
                weeks-out phasing — the same framework Roadman coaches use,
                tuned to your target.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {featuredWithCountdown.map((row, i) => {
                const isUpcoming = row.weeks >= 0;
                return (
                  <ScrollReveal key={row.slug} direction="up" delay={i * 0.04}>
                    <Card className="p-6 h-full flex flex-col" glass>
                      <div className="flex items-start justify-between mb-3 gap-3">
                        <h3 className="font-heading text-xl text-off-white leading-tight uppercase">
                          {row.event.name}
                        </h3>
                        <span className="text-xs text-foreground-subtle font-body tracking-widest uppercase shrink-0 mt-1">
                          {row.event.region}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-foreground-subtle mb-4">
                        <span>{row.event.distanceKm} km</span>
                        <span className="opacity-50">·</span>
                        <span>{row.event.elevationGainM.toLocaleString()} m</span>
                        <span className="opacity-50">·</span>
                        <span>{row.dateLabel}</span>
                      </div>
                      <div
                        className={`mb-4 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs ${
                          isUpcoming
                            ? "border-coral/30 bg-coral/10 text-coral"
                            : "border-white/10 bg-white/[0.03] text-foreground-subtle"
                        }`}
                      >
                        {isUpcoming ? (
                          <>
                            <span className="font-heading tracking-wider">
                              {row.weeks === 0
                                ? "Race week"
                                : row.weeks === 1
                                  ? "1 week out"
                                  : `${row.weeks} weeks out`}
                            </span>
                            <span className="opacity-70">·</span>
                            <span className="opacity-90">{row.focus.focus}</span>
                          </>
                        ) : (
                          <>
                            <span className="font-heading tracking-wider">
                              Next edition
                            </span>
                            <span className="opacity-90">— start base now</span>
                          </>
                        )}
                      </div>
                      <p className="text-foreground-muted text-sm leading-relaxed mb-5 flex-1">
                        {row.event.description}
                      </p>
                      <Link
                        href={`/plan/${row.event.slug}`}
                        className="inline-flex items-center justify-between gap-2 font-heading uppercase tracking-wider text-coral hover:text-coral-hover text-sm"
                      >
                        See the {row.event.shortName} plan
                        <span aria-hidden>&rarr;</span>
                      </Link>
                    </Card>
                  </ScrollReveal>
                );
              })}
            </div>

            <ScrollReveal direction="up" className="text-center mt-10">
              <Link
                href="/plan"
                className="inline-flex items-center gap-2 font-heading text-sm tracking-widest uppercase text-foreground-muted hover:text-coral transition-colors"
              >
                Browse all {EVENTS.length} events
                <span aria-hidden>&rarr;</span>
              </Link>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ─────────────── Tools shelf ─────────────── */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="mb-10 text-center">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                THE NUMBERS
              </p>
              <h2
                className="font-heading text-off-white uppercase"
                style={{ fontSize: "var(--text-section)" }}
              >
                Tools that turn vague effort into a plan
              </h2>
              <p className="text-foreground-muted text-base md:text-lg leading-relaxed max-w-2xl mx-auto mt-5">
                Six calculators that answer the questions every event rider
                eventually asks. Free, no signup, instant.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
              {TOOLS.map((t, i) => (
                <ScrollReveal key={t.href} direction="up" delay={i * 0.04}>
                  <Link
                    href={t.href}
                    className="block h-full rounded-xl border border-white/10 bg-white/[0.03] hover:border-coral/40 hover:bg-white/[0.05] transition-all p-6"
                  >
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <p className="font-heading text-off-white text-lg uppercase tracking-wide leading-tight">
                        {t.name}
                      </p>
                      <span className="text-coral text-lg" aria-hidden>
                        &rarr;
                      </span>
                    </div>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      {t.blurb}
                    </p>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ─────────────── Blog library ─────────────── */}
        <Section background="deep-purple" grain>
          <Container>
            <ScrollReveal direction="up" className="mb-10 text-center">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                THE LIBRARY
              </p>
              <h2
                className="font-heading text-off-white uppercase"
                style={{ fontSize: "var(--text-section)" }}
              >
                What to read before the start line
              </h2>
              <p className="text-foreground-muted text-base md:text-lg leading-relaxed max-w-2xl mx-auto mt-5">
                Race-day fuelling, taper discipline, heat acclimation, altitude,
                travel fatigue, climbing — the topics that decide whether your
                event goes the way you imagined.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
              {blogPosts.map((post, i) => (
                <ScrollReveal key={post.slug} direction="up" delay={i * 0.03}>
                  <Link href={`/blog/${post.slug}`} className="block h-full">
                    <Card hoverable className="h-full p-5">
                      <p className="font-heading text-coral text-xs tracking-widest uppercase mb-2">
                        {post.pillar}
                      </p>
                      <p className="font-heading text-off-white text-base leading-tight mb-2">
                        {post.title}
                      </p>
                      <p className="text-foreground-muted text-xs leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </Card>
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal direction="up" className="text-center mt-10">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 font-heading text-sm tracking-widest uppercase text-foreground-muted hover:text-coral transition-colors"
              >
                Full blog library
                <span aria-hidden>&rarr;</span>
              </Link>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ─────────────── Coaching ladder ─────────────── */}
        <Section background="charcoal" className="section-glow-coral !py-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-8 md:p-12">
                <div className="text-center mb-10">
                  <p className="font-heading text-coral text-xs tracking-widest mb-3">
                    WHEN GUESSING ISN'T GOOD ENOUGH
                  </p>
                  <h2
                    className="font-heading text-off-white uppercase"
                    style={{ fontSize: "var(--text-section)" }}
                  >
                    Want this built around your numbers?
                  </h2>
                  <p className="text-foreground-muted text-base md:text-lg max-w-2xl mx-auto mt-5 leading-relaxed">
                    Three ways into the Roadman coaching system, ordered by how
                    much hand-holding you actually need.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 flex flex-col">
                    <p className="font-heading text-coral text-xs tracking-widest mb-2">
                      START HERE
                    </p>
                    <p className="font-heading text-off-white text-lg uppercase mb-2">
                      Plateau Diagnostic
                    </p>
                    <p className="text-foreground-muted text-sm leading-relaxed flex-1 mb-4">
                      Twelve questions, four minutes. Tells you which of the
                      four masters profiles you fit and where the leak is.
                    </p>
                    <Link
                      href="/plateau"
                      className="text-coral hover:text-coral-hover font-heading uppercase tracking-wider text-sm"
                    >
                      Take the diagnostic &rarr;
                    </Link>
                  </div>
                  <div className="rounded-xl border border-coral/30 bg-coral/[0.05] p-5 flex flex-col">
                    <p className="font-heading text-coral text-xs tracking-widest mb-2">
                      THE COMMUNITY
                    </p>
                    <p className="font-heading text-off-white text-lg uppercase mb-2">
                      Not Done Yet
                    </p>
                    <p className="text-foreground-muted text-sm leading-relaxed flex-1 mb-4">
                      Structured plan around your event date. Weekly live calls
                      with Anthony. Tactical reviews before your race. $195/mo.
                    </p>
                    <Link
                      href="/community/not-done-yet"
                      className="text-coral hover:text-coral-hover font-heading uppercase tracking-wider text-sm"
                    >
                      Join Not Done Yet &rarr;
                    </Link>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 flex flex-col">
                    <p className="font-heading text-coral text-xs tracking-widest mb-2">
                      1:1 COACHING
                    </p>
                    <p className="font-heading text-off-white text-lg uppercase mb-2">
                      Inner Circle
                    </p>
                    <p className="text-foreground-muted text-sm leading-relaxed flex-1 mb-4">
                      Daily coach feedback. Performance Health bloodwork. The
                      five pillars, dialled to your race calendar. $525/mo.
                    </p>
                    <Link
                      href="/inner-circle"
                      className="text-coral hover:text-coral-hover font-heading uppercase tracking-wider text-sm"
                    >
                      Inner Circle details &rarr;
                    </Link>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-foreground-muted text-sm mb-4">
                    Not sure which one fits how you actually train?
                  </p>
                  <Button href="/find-your-fit" size="lg" dataTrack="event_prep_find_your_fit">
                    Find Your Fit
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ─────────────── FAQ ─────────────── */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-10 text-center">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                COMMON QUESTIONS
              </p>
              <h2
                className="font-heading text-off-white uppercase"
                style={{ fontSize: "var(--text-section)" }}
              >
                Event prep, asked and answered
              </h2>
            </ScrollReveal>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {FAQ.map((f) => (
                <details key={f.question} className="group py-5">
                  <summary className="cursor-pointer flex items-center justify-between gap-4 font-heading tracking-wide uppercase text-off-white text-base md:text-lg list-none">
                    <span>{f.question}</span>
                    <span className="text-coral transition-transform group-open:rotate-45 shrink-0">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-foreground-muted leading-relaxed">
                    {f.answer}
                  </p>
                </details>
              ))}
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

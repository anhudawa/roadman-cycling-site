import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { EvidenceBlock } from "@/components/seo/EvidenceBlock";
import {
  BRAND_STATS,
  ENTITY_IDS,
  SITE_ORIGIN,
} from "@/lib/brand-facts";
import { getTestimonialsByName } from "@/lib/testimonials";
import { EVENTS } from "@/lib/training-plans";
import { buildSearchOwnerTrustProperties } from "@/lib/seo/search-owner-schema";
import { OFFER_TIERS } from "@/lib/offer-ladder";

const STRUCTURED_IMAGE_URL = `${SITE_ORIGIN}/api/og/blog-hero?title=${encodeURIComponent("Cycling Training Plans")}&pillar=coaching`;
const PLAN_OFFER = OFFER_TIERS.notDoneYet;

/**
 * /training-plans — pillar hub for the "cycling training plans" topic
 * cluster.
 *
 * The page is built around one editorial argument: a useful plan makes its
 * rider inputs and review rules explicit. The four-pattern self-assessment at
 * `/plateau` is the first routing step before a coaching review.
 *
 * Delivery is TrainingPeaks. Periodisation is 16 weeks. Hours/week
 * tiers are 6, 8, 10, 12. None of this is invented — it mirrors the
 * Not Done Yet build that Anthony already coaches against.
 */

export const metadata: Metadata = {
  title: { absolute: "Cycling Training Plans for 6–12 Hours a Week" },
  description:
    "Coached 16-week cycling training plans for 6–12 hours a week, with TrainingPeaks delivery, weekly review and live group coaching. $195/month.",
  keywords: [
    "cycling training plans",
    "structured cycling training",
    "periodised cycling plan",
    "cycling training plan 6 hours per week",
    "cycling training plan 8 hours per week",
    "cycling training plan 10 hours per week",
    "16 week cycling training plan",
    "training peaks cycling plan",
    "polarised training plan",
    "cycling base plan",
  ],
  alternates: {
    canonical: `${SITE_ORIGIN}/training-plans`,
  },
  openGraph: {
    title:
      "Cycling Training Plans — Periodised, Coach-Designed, TrainingPeaks-Delivered",
    description:
      "Roadman's coached 16-week cycling plans for 6 to 12 hours a week, delivered in TrainingPeaks with weekly review and live group coaching.",
    type: "website",
    url: `${SITE_ORIGIN}/training-plans`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Cycling Training Plans — Roadman Cycling",
    description:
      "Coached 16-week TrainingPeaks plans for 6 to 12 hours a week, with weekly review and live group coaching.",
  },
  robots: { index: true, follow: true },
};

/* ============================================================ */
/* Hours-per-week variants                                      */
/* ============================================================ */

interface PlanVariant {
  hours: string;
  label: string;
  audience: string;
  weeklyShape: string;
  bestFor: string;
  tradeoff: string;
}

const PLAN_VARIANTS: PlanVariant[] = [
  {
    hours: "6",
    label: "Six hours a week",
    audience: "Working parents. Two-job households. Riders with one bike window per day.",
    weeklyShape:
      "A lower-volume structure in which priority work, endurance and recovery must fit inside a firm weekly ceiling.",
    bestFor:
      "Riders who can protect roughly six hours consistently and need the block scaled to that constraint.",
    tradeoff:
      "Less volume leaves fewer optional sessions, so the goal and priority work must be explicit.",
  },
  {
    hours: "8",
    label: "Eight hours a week",
    audience:
      "Serious amateurs balancing a full working week, family commitments and a longer weekend riding window.",
    weeklyShape:
      "Priority sessions, endurance volume and recovery arranged around the rider's available days and current training tolerance.",
    bestFor:
      "Riders who can protect roughly eight hours but want a named team to review how the week is working.",
    tradeoff:
      "Adding intensity can displace recovery quickly, so completed load and feedback still govern progression.",
  },
  {
    hours: "10",
    label: "Ten hours a week",
    audience:
      "Riders with a target event. Club racers. People who've trained 8 and want to push the ceiling.",
    weeklyShape:
      "A larger endurance allowance with priority work, recovery and any strength training coordinated across the week.",
    bestFor:
      "Riders preparing for a demanding event whose recent training supports a higher-volume block.",
    tradeoff:
      "The extra hours are useful only when the rider can recover from them and preserve the priority sessions.",
  },
  {
    hours: "12",
    label: "Twelve hours a week",
    audience:
      "Masters racing seriously, ultra-distance riders, comeback athletes with the time to commit.",
    weeklyShape:
      "Higher-volume endurance and event-specific work with recovery placed according to the rider's response.",
    bestFor:
      "Experienced riders whose event demands, training history and life schedule justify roughly twelve hours.",
    tradeoff:
      "A twelve-hour target is not automatically better; sleep, fuelling, work and recent load may require less.",
  },
];

/* ============================================================ */
/* The four-cause diagnostic — gateway content                  */
/* ============================================================ */

const FOUR_CAUSES = [
  {
    label: "UNDER-RECOVERED",
    summary:
      "Recent training load and life stress may be exceeding the recovery the rider currently has available.",
  },
  {
    label: "GREY-ZONE TRAP",
    summary:
      "Too much work may be accumulating at a similar moderate intensity, leaving priority and recovery days poorly separated.",
  },
  {
    label: "STRENGTH GAP",
    summary:
      "The goal may benefit from strength work, depending on lifting history, cycling load, technique and recovery capacity.",
  },
  {
    label: "FUELLING DEFICIT",
    summary:
      "Session fuelling or overall energy availability may not match the work; clinical concerns require qualified assessment.",
  },
];

/* ============================================================ */
/* What's inside the plan                                       */
/* ============================================================ */

const INSIDE_THE_PLAN = [
  {
    number: "01",
    title: "16-week periodisation",
    body: "Base, build, peak, taper. Phases sequenced for what your body actually needs in week 1 vs week 12. Not the same workouts on a loop.",
  },
  {
    number: "02",
    title: "TrainingPeaks delivery",
    body: "Workouts land on your calendar, push to your head unit, and report back when you're done. No PDFs to print, no separate apps to wrestle.",
  },
  {
    number: "03",
    title: "Hours-tier matching",
    body: "Six, eight, ten or twelve hours a week — the same periodisation, scaled honestly to the time you actually have.",
  },
  {
    number: "04",
    title: "Strength block, not bolt-on",
    body: "Cycling-specific strength work is coordinated with the riding and adjusted for lifting experience, soreness, priority sessions and event timing.",
  },
  {
    number: "05",
    title: "Fuelling and recovery built in",
    body: "General fuelling and recovery guidance is coordinated with session demand. Therapeutic nutrition and clinical questions sit outside coaching scope.",
  },
  {
    number: "06",
    title: "Weekly coaching with Anthony",
    body: "Weekly live group coaching, an individual plan review by the Roadman coaching team and a private rider community between reviews.",
  },
];

/* ============================================================ */
/* Roadman vs alternatives                                      */
/* ============================================================ */

const COMPARISONS = [
  {
    alt: "TrainerRoad / Zwift workouts",
    them: "Workout libraries and adaptive scheduling differ by product. Check which inputs drive changes, what is reviewed and when the rider must override the system.",
    us: "A personalised TrainingPeaks plan reviewed weekly by the Roadman coaching team, with live group coaching and rider feedback in the loop.",
  },
  {
    alt: "Free YouTube plans",
    them: "Free plans can provide useful structure. Check the author, intended rider, progression, recovery, modification rules and date before using one.",
    us: "The Roadman service adds individual plan review, current rider context and an agreed route for questions and changes.",
  },
  {
    alt: "Self-coached on Strava / Garmin",
    them: "The rider controls every decision and bears the cost of analysis, objectivity and knowing when to change the plan.",
    us: "A named coaching team reviews the plan each week and is accountable for explaining the next change.",
  },
  {
    alt: "Off-the-shelf PDF plans",
    them: "A predetermined schedule can suit a predictable goal and week. Its value depends on fit and clear rules for missed or modified sessions.",
    us: "Roadman uses a pre-start profile plus weekly review; the profile is a routing aid, not a medical diagnosis or performance guarantee.",
  },
];

/* ============================================================ */
/* FAQ                                                          */
/* ============================================================ */

const FAQ = [
  {
    question: "How long is a Roadman cycling training plan?",
    answer:
      "Roadman currently uses 16-week planning blocks. The phase emphasis and starting point depend on the rider's goal, recent training, event date and recovery; 16 weeks is the service format, not a claim that every cyclist needs the same sequence.",
  },
  {
    question: "How many hours a week do I need to train on a Roadman plan?",
    answer:
      "Roadman currently supports 6, 8, 10 and 12-hour weekly variants. Choose the time you can protect consistently, then confirm that the starting load and event demands fit your recent training rather than assuming more hours are better.",
  },
  {
    question: "How are the plans delivered?",
    answer:
      "Through TrainingPeaks. Structured workouts can sync to supported devices, and completed data returns to the calendar for review. The service also includes weekly live group coaching with Anthony Walsh and the private rider community.",
  },
  {
    question: "What is periodised cycling training?",
    answer:
      "Periodisation is the organisation of training so priorities change across time. Base, build, peak and taper are useful labels, but phase length and order depend on the athlete and event; research in trained cyclists does not establish one universally superior model.",
  },
  {
    question:
      "Why should I take the plateau diagnostic before getting a plan?",
    answer:
      "The four-minute self-assessment helps route the first conversation toward recovery, intensity distribution, strength or fuelling. It is not a medical diagnosis and does not determine the plan on its own; recent training, goals, feedback and coaching review still matter.",
  },
  {
    question: "Do I need a power meter to follow a Roadman plan?",
    answer:
      "No. Power can make some targets and reviews more precise, but heart rate and rate of perceived exertion can also guide sessions when zones and limitations are understood. The coaching team confirms the available data during onboarding.",
  },
  {
    question: "How much does a Roadman training plan cost?",
    answer: `The plans are part of Not Done Yet group coaching, currently ${PLAN_OFFER.pricing.display} with a ${PLAN_OFFER.pricing.trial}. That includes a personalised TrainingPeaks plan, weekly team review, live group coaching with Anthony Walsh, strength and general fuelling guidance, and the private rider community. The application shows the current terms before signup.`,
  },
  {
    question: "Can I follow the plan if I've never used TrainingPeaks before?",
    answer:
      "Yes. We get you set up in the first week — the calendar, the device sync, and how to read the prescriptions. After that it's two clicks: open today's workout, send to your head unit. The interface stops feeling new about four sessions in.",
  },
  {
    question:
      "How do Roadman plans compare to TrainerRoad or a free YouTube plan?",
    answer:
      "Apps and free plans can both provide useful structure. Compare their inputs, progression, review and modification rules with what you need. Roadman's difference is the named human review loop: a personalised TrainingPeaks plan is reviewed weekly alongside rider feedback and live group coaching.",
  },
];

/* ============================================================ */
/* Editorial testimonials — riders who've used the plans        */
/* ============================================================ */

const TESTIMONIAL_NAMES = [
  "Damien Maloney",
  "Blair Corey",
  "Brian Morrissey",
  "Daniel Stone",
];

/* ============================================================ */
/* Page                                                         */
/* ============================================================ */

export default function TrainingPlansPage() {
  const testimonials = getTestimonialsByName(TESTIMONIAL_NAMES);

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
      {
        "@type": "ListItem",
        position: 2,
        name: "Training Plans",
        item: `${SITE_ORIGIN}/training-plans`,
      },
    ],
  };

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_ORIGIN}/training-plans#webpage`,
    url: `${SITE_ORIGIN}/training-plans`,
    name: "Cycling Training Plans — Roadman Cycling",
    description:
      "Roadman's coached 16-week cycling training-plan service for riders training 6, 8, 10 or 12 hours per week, delivered through TrainingPeaks with weekly review.",
    ...buildSearchOwnerTrustProperties("cycling-training-plans"),
    dateModified: "2026-08-26",
    editor: { "@id": ENTITY_IDS.person },
    publisher: { "@id": ENTITY_IDS.organization },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: STRUCTURED_IMAGE_URL,
    },
    about: {
      "@type": "Thing",
      name: "Cycling training plans",
      description:
        "Structured, periodised cycling training programmes for amateur and masters cyclists.",
    },
  };

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${SITE_ORIGIN}/training-plans#course`,
    name: "Roadman Cycling Training Plans — 16-Week Periodised",
    description:
      "A coached 16-week TrainingPeaks plan for 6, 8, 10 or 12 hours per week, with individual weekly plan review, live group coaching, strength and general fuelling guidance, and a private rider community.",
    provider: { "@id": ENTITY_IDS.organization },
    audience: {
      "@type": "Audience",
      audienceType: "Serious amateur and masters cyclists",
    },
    hasCourseInstance: PLAN_VARIANTS.map((v) => ({
      "@type": "CourseInstance",
      name: `${v.label} cycling training plan`,
      courseMode: "Online",
      courseWorkload: `PT${v.hours}H`,
      instructor: { "@id": ENTITY_IDS.person },
    })),
    offers: {
      "@type": "Offer",
      price: String(PLAN_OFFER.pricing.monthlyUsd),
      priceCurrency: "USD",
      category: "Monthly subscription",
      url: `${SITE_ORIGIN}${PLAN_OFFER.cta.href}`,
      availability: "https://schema.org/InStock",
      seller: { "@id": ENTITY_IDS.organization },
    },
  };

  return (
    <>
      <JsonLd data={breadcrumbsJsonLd} />
      <JsonLd data={collectionPageJsonLd} />
      <JsonLd data={courseJsonLd} />
      <FAQSchema faqs={FAQ} />

      <Header />

      <main id="main-content">
        {/* ─────────────── Hero ─────────────── */}
        <Section background="deep-purple" grain className="pt-32 pb-20">
          <Container className="text-center">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-widest mb-6">
                CYCLING TRAINING PLANS
              </p>
              <h1
                className="font-heading text-off-white mb-6 leading-[0.95]"
                style={{ fontSize: "var(--text-hero)" }}
              >
                CYCLING TRAINING PLANS
                <br />
                <span className="text-coral">BUILT AROUND YOUR LIFE.</span>
              </h1>
              <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                Periodised cycling plans built by coaches, delivered through
                TrainingPeaks. Sixteen weeks. Six to twelve hours a week. Matched
                with a four-pattern rider profile used as one input before the
                first session. The profile routes the conversation; the weekly
                review keeps the plan tied to what actually happens.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <Button
                  href="/plateau"
                  size="lg"
                  dataTrack="training_plans_hero_diagnostic"
                >
                  Find Your Profile First
                </Button>
                <Button
                  href="#variants"
                  variant="ghost"
                  size="lg"
                >
                  See the Plan Variants
                </Button>
              </div>
              <p className="text-foreground-subtle text-sm">
                Four minutes &middot; No card &middot; Tells you which plan
                shape fits
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <div className="gradient-divider" />

        <Section background="charcoal" className="!py-12 md:!py-16">
          <Container>
            <div className="mx-auto max-w-5xl">
              <div className="mx-auto mb-8 max-w-3xl rounded-2xl border border-coral/25 bg-coral/[0.06] px-6 py-6 text-center">
                <p className="font-heading text-xs tracking-[0.25em] text-coral mb-3">
                  THE SHORT ANSWER
                </p>
                <h2 className="font-heading text-2xl text-off-white mb-3">
                  WHAT ROADMAN CYCLING TRAINING PLANS ARE
                </h2>
                <p className="font-heading text-xs tracking-[0.18em] text-foreground-subtle mb-4">
                  SERVICE FACTS · REVIEWED 26 AUGUST 2026
                </p>
                <p className="text-foreground-muted leading-relaxed">
                  Roadman training plans are part of Not Done Yet group
                  coaching, not one-off downloads. Each rider receives a
                  personalised 16-week TrainingPeaks plan for 6, 8, 10 or 12
                  hours a week, reviewed every week by the Roadman coaching
                  team. The service also includes live group coaching with
                  Anthony Walsh, cycling-specific strength, general fuelling
                  guidance and a private rider community. The current price is
                  {" "}{PLAN_OFFER.pricing.display} with a {PLAN_OFFER.pricing.trial}.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                {[
                  {
                    href: "/topics/cycling-training-plans",
                    label: "Learn the method",
                    detail: "Inputs, periodisation, intensity, recovery and review rules",
                  },
                  {
                    href: "/blog/cycling-how-to-choose-a-training-plan-guide",
                    label: "Compare formats",
                    detail: "Static plan, app, self-coaching or coached plan",
                  },
                  {
                    href: "/plan",
                    label: "Choose an event",
                    detail: "Frameworks organised by event and weeks remaining",
                  },
                  {
                    href: "/blog/how-pro-cyclist-trains-60-days",
                    label: "Read the case study",
                    detail: "Anthony Walsh's documented N=1 60-day experiment",
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-coral/40"
                  >
                    <p className="font-heading text-sm uppercase tracking-wide text-off-white mb-2">
                      {item.label}
                    </p>
                    <p className="text-foreground-subtle text-sm leading-relaxed">
                      {item.detail}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        {/* ─────────────── The argument: matched plan, not shelf plan ─── */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <ScrollReveal direction="left">
                <h2
                  className="font-heading text-off-white mb-6"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  <GradientText as="span">
                    WHEN A STATIC PLAN MEETS A CHANGING WEEK.
                  </GradientText>
                </h2>
                <div className="space-y-4 text-foreground-muted leading-relaxed">
                  <p>
                    A static plan can be useful when the goal and weekly schedule
                    are predictable. Its limitation appears when work, sleep,
                    illness or the rider&apos;s response changes and nobody is
                    responsible for the next decision.
                  </p>
                  <p>
                    That does not make every template wrong or every coached
                    plan better. It means the rider should know which inputs the
                    plan used, how progression works and what evidence will
                    justify a change.
                  </p>
                  <p className="text-off-white font-medium">
                    Roadman&apos;s proposition is a matched plan plus a named
                    weekly human review loop.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right">
                <Card className="p-6" hoverable={false}>
                  <h3 className="font-heading text-lg text-off-white mb-4">
                    WHAT MATCHED LOOKS LIKE
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Record the rider profile before writing the first week",
                      "Scale to the hours the rider can actually protect",
                      "Periodise across 16 weeks — base, build, peak, taper",
                      "Deliver through TrainingPeaks so the file talks back",
                      "Pair strength and fuelling with the riding, not after",
                      "Make the coaching team accountable for a weekly review",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-foreground-muted"
                      >
                        <span className="text-coral mt-0.5 shrink-0">
                          &#10003;
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* ─────────────── Diagnostic gateway ─────────────── */}
        <Section background="deep-purple" grain id="diagnostic">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-[0.3em] mb-3">
                BEFORE THE PLAN
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                START WITH THE RIDER PROFILE
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                Twelve questions about training, recovery, strength and
                fuelling. The four-minute self-assessment helps route the first
                conversation; it is not a medical diagnosis or a promise that
                one profile explains every plateau.
              </p>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {FOUR_CAUSES.map((c, i) => (
                <ScrollReveal key={c.label} direction="up" delay={i * 0.06}>
                  <div className="h-full rounded-xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="font-heading text-coral text-xs tracking-widest mb-3">
                      {c.label}
                    </p>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      {c.summary}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal direction="up" className="text-center">
              <Button
                href="/plateau"
                size="lg"
                dataTrack="training_plans_diagnostic_cta"
              >
                Take the 4-Minute Diagnostic
              </Button>
              <p className="text-foreground-subtle text-xs mt-4">
                Free &middot; No card &middot; Email only when you want the
                result
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* ─────────────── Plan variants — hours/week tiers ─────────────── */}
        <Section background="charcoal" id="variants">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                THE VARIANTS
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                PICK THE HOURS YOU CAN PROTECT
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                Four 16-week service variants, scaled around the time the rider
                can protect. The final week still depends on the goal, recent
                training, response and recovery—not the hours label alone.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" className="max-w-6xl mx-auto mb-8">
              <Link
                href="/plan"
                data-track="training_plans_event_directory"
                className="group flex flex-col gap-3 rounded-xl border border-coral/25 bg-coral/[0.05] p-6 transition-colors hover:border-coral/50 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-coral font-heading text-xs tracking-widest mb-2">
                    TRAINING FOR A SPECIFIC EVENT?
                  </p>
                  <h3 className="font-heading text-xl text-off-white uppercase tracking-wide mb-2 group-hover:text-coral transition-colors">
                    Browse {EVENTS.length} event-specific plan frameworks
                  </h3>
                  <p className="text-foreground-muted text-sm leading-relaxed max-w-2xl">
                    Choose your sportive and the weeks you have left. Get the
                    right base, build, peak or taper framework for that point in
                    the calendar.
                  </p>
                </div>
                <span className="font-heading text-coral tracking-wide uppercase shrink-0">
                  Find my event →
                </span>
              </Link>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-6xl mx-auto">
              {PLAN_VARIANTS.map((v, i) => (
                <ScrollReveal key={v.hours} direction="up" delay={i * 0.06}>
                  <Card className="p-7 h-full" glass hoverable={false}>
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="font-heading text-coral text-5xl leading-none">
                        {v.hours}
                      </span>
                      <span className="font-heading text-off-white text-base tracking-wider uppercase">
                        hrs / week
                      </span>
                    </div>
                    <h3 className="font-heading text-off-white text-lg tracking-wide mb-4 uppercase">
                      {v.label}
                    </h3>
                    <dl className="space-y-3 text-sm">
                      <div>
                        <dt className="text-coral font-heading text-xs tracking-widest mb-1">
                          WHO IT&apos;S FOR
                        </dt>
                        <dd className="text-foreground-muted leading-relaxed">
                          {v.audience}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-coral font-heading text-xs tracking-widest mb-1">
                          THE WEEK
                        </dt>
                        <dd className="text-foreground-muted leading-relaxed">
                          {v.weeklyShape}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-coral font-heading text-xs tracking-widest mb-1">
                          BEST FOR
                        </dt>
                        <dd className="text-foreground-muted leading-relaxed">
                          {v.bestFor}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-coral font-heading text-xs tracking-widest mb-1">
                          THE HONEST BIT
                        </dt>
                        <dd className="text-foreground-muted leading-relaxed">
                          {v.tradeoff}
                        </dd>
                      </div>
                    </dl>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ─────────────── Inside the plan ─────────────── */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                WHAT&apos;S IN IT
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                INSIDE EVERY ROADMAN PLAN
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto leading-relaxed">
                Informed by {BRAND_STATS.episodeCountLabel} on-the-record
                podcast conversations with researchers, coaches and athletes,
                including Stephen Seiler, Dan Lorang, Greg LeMond and Joe Friel.
                Their different perspectives inform Roadman&apos;s method; they
                are not presented as endorsers of this programme.
              </p>
            </ScrollReveal>

            <div className="space-y-4">
              {INSIDE_THE_PLAN.map((item, i) => (
                <ScrollReveal key={item.number} direction="up" delay={i * 0.05}>
                  <Card className="p-6 group" glass tilt tiltStrength={3}>
                    <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                      <div className="shrink-0">
                        <span className="font-heading text-4xl text-coral/40 group-hover:text-coral transition-colors duration-300">
                          {item.number}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-xl text-off-white mb-2 group-hover:text-coral transition-colors duration-300 uppercase tracking-wide">
                          {item.title}
                        </h3>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* ─────────────── Roadman vs alternatives ─────────────── */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                WHY NOT THE FREE STUFF?
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                ROADMAN VS THE ALTERNATIVES
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                The free and paid alternatives all have a job they do well.
                Here&apos;s where the Roadman plan picks up where each of them
                runs out.
              </p>
            </ScrollReveal>

            <div className="max-w-5xl mx-auto space-y-4">
              {COMPARISONS.map((c, i) => (
                <ScrollReveal key={c.alt} direction="up" delay={i * 0.05}>
                  <Card className="p-6 md:p-7" hoverable={false}>
                    <p className="font-heading text-off-white text-base tracking-wide uppercase mb-4">
                      {c.alt}
                    </p>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                        <p className="font-heading text-foreground-subtle text-xs tracking-widest mb-2">
                          TYPICAL FORMAT
                        </p>
                        <p className="text-foreground-muted text-sm leading-relaxed">
                          {c.them}
                        </p>
                      </div>
                      <div className="rounded-lg border border-coral/30 bg-coral/5 p-4">
                        <p className="font-heading text-coral text-xs tracking-widest mb-2">
                          ROADMAN SERVICE
                        </p>
                        <p className="text-foreground-muted text-sm leading-relaxed">
                          {c.us}
                        </p>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ─────────────── Testimonials ─────────────── */}
        <Section background="deep-purple" grain>
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                IN THEIR WORDS
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                RIDERS WHO BROKE THE PLATEAU
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto leading-relaxed">
                Named rider accounts with different starting points. Individual
                outcomes do not forecast what another rider will achieve.
              </p>
            </ScrollReveal>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 list-none p-0 max-w-6xl mx-auto">
              {testimonials.map((t, i) => (
                <li key={t.name}>
                  <ScrollReveal direction="up" delay={i * 0.06}>
                    <figure
                      className="
                        h-full rounded-2xl bg-background-elevated
                        border border-white/10 p-6
                        flex flex-col
                        transition-all duration-300
                        hover:border-coral/30 hover:-translate-y-0.5
                      "
                    >
                      {t.stat && (
                        <div className="mb-4 inline-flex items-center self-start gap-2 rounded-full bg-coral/10 border border-coral/30 px-3 py-1">
                          <span className="font-heading text-coral text-base tracking-wide">
                            {t.stat}
                          </span>
                          {t.statLabel && (
                            <span className="text-foreground-muted text-xs">
                              {t.statLabel}
                            </span>
                          )}
                        </div>
                      )}
                      <blockquote className="text-off-white text-sm leading-relaxed flex-1">
                        &ldquo;{t.shortQuote ?? t.quote}&rdquo;
                      </blockquote>
                      <figcaption className="mt-5 pt-5 border-t border-white/10">
                        <p className="font-heading text-off-white text-sm tracking-wide">
                          {t.name.toUpperCase()}
                        </p>
                        <p className="text-foreground-subtle text-xs mt-1">
                          {t.detail}
                        </p>
                      </figcaption>
                    </figure>
                  </ScrollReveal>
                </li>
              ))}
            </ul>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* ─────────────── Related reading ─────────────── */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-10">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                FROM THE LIBRARY
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                READ BEFORE YOU PICK A PLAN
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto leading-relaxed">
                The reading that puts the plan in context — periodisation,
                polarised training, time-crunched riding, masters work.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  href: "/blog/how-to-structure-cycling-training-plan",
                  title: "How to Structure a Cycling Training Plan",
                },
                {
                  href: "/blog/how-to-periodise-cycling-season",
                  title: "How to Periodise a Cycling Season",
                },
                {
                  href: "/blog/polarised-vs-sweet-spot-training",
                  title: "Polarised vs Sweet Spot: What the Science Says",
                },
                {
                  href: "/blog/time-crunched-cyclist-8-hours-week",
                  title: "How to Train on 8 Hours a Week",
                },
                {
                  href: "/blog/masters-cyclist-guide-getting-faster-after-40",
                  title: "Getting Faster After 40: The Masters Guide",
                },
                {
                  href: "/blog/trainerroad-vs-online-cycling-coach",
                  title: "TrainerRoad vs Online Cycling Coach",
                },
              ].map((article) => (
                <Link
                  key={article.href}
                  href={article.href}
                  className="block p-4 rounded-lg bg-white/5 hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all group"
                >
                  <p className="font-heading text-sm text-off-white group-hover:text-coral transition-colors tracking-wide">
                    {article.title.toUpperCase()}
                  </p>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/topics/cycling-training-plans"
                className="inline-flex items-center gap-2 font-heading text-sm tracking-widest uppercase text-foreground-muted hover:text-coral transition-colors"
              >
                See the full training plans topic hub
                <span aria-hidden>&rarr;</span>
              </Link>
            </div>
          </Container>
        </Section>

        {/* ─────────────── FAQ ─────────────── */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                COMMON QUESTIONS
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                BEFORE YOU START
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

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <EvidenceBlock
              lastReviewed="26 August 2026"
              reviewedBy="Anthony Walsh, founder and head coach"
              experts={[
                {
                  name: "Prof. Stephen Seiler",
                  role: "Exercise physiologist and polarised-training researcher",
                  href: "/guests/stephen-seiler",
                },
                {
                  name: "Dan Lorang",
                  role: "Head of Performance, Lidl-Trek",
                  href: "/guests/dan-lorang",
                },
                {
                  name: "Joe Friel",
                  role: "Author, The Cyclist's Training Bible",
                  href: "/guests/joe-friel",
                },
              ]}
            />
          </Container>
        </Section>

        {/* ─────────────── Final CTA ─────────────── */}
        <Section background="coral" className="!py-16 md:!py-24">
          <Container className="text-center">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              YOUR PLAN STARTS WITH A DIAGNOSIS.
            </h2>
            <p className="text-off-white/80 max-w-lg mx-auto mb-8 leading-relaxed">
              Four minutes. Twelve questions. The result helps route the first
              coaching conversation; recent training, goals and feedback still
              determine what comes next.
            </p>
            <Link
              href="/plateau"
              className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md transition-all cursor-pointer active:scale-[0.97] active:duration-75 px-8 md:px-10 py-4 text-lg bg-off-white text-coral hover:bg-off-white/90 shadow-lg"
              style={{ transitionDuration: "var(--duration-fast)" }}
              data-track="training_plans_footer_diagnostic"
            >
              Find My Profile
            </Link>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 text-off-white/60 text-sm">
              <span>Free</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>No card</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>4 minutes</span>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

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

/**
 * /training-plans — pillar hub for the "cycling training plans" topic
 * cluster.
 *
 * The page is built around one editorial argument: a plan only works
 * when it's matched to the rider. The four-cause diagnostic at
 * `/plateau` is the gate — the page funnels readers there first, then
 * routes them to the Not Done Yet plan tier that matches their hours.
 *
 * Delivery is TrainingPeaks. Periodisation is 16 weeks. Hours/week
 * tiers are 6, 8, 10, 12. None of this is invented — it mirrors the
 * Not Done Yet build that Anthony already coaches against.
 */

export const metadata: Metadata = {
  title: { absolute: "Cycling Training Plans for 6–12 Hours a Week" },
  description:
    "16-week cycling training plans for 6, 8, 10 or 12 hours a week, delivered in TrainingPeaks and matched to your goal, fitness and available time.",
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
      "16-week periodised cycling plans built around 6 to 12 hours a week and tuned to one of four plateau profiles. No shelf templates.",
    type: "website",
    url: `${SITE_ORIGIN}/training-plans`,
    images: [
      {
        url: `${SITE_ORIGIN}/training-plans/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Roadman Cycling — Training Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cycling Training Plans — Roadman Cycling",
    description:
      "Periodised, coach-designed, TrainingPeaks-delivered. Matched to your plateau profile, not pulled off a shelf.",
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
      "Two quality sessions, one long ride, the rest is short Zone 2 or commute. Every minute earns its place.",
    bestFor:
      "Holding FTP through a brutal work block, or building cleanly when life isn't quiet enough for more.",
    tradeoff:
      "You won't add huge volume. You will move the needle — sharper intervals, smarter recovery, no junk miles.",
  },
  {
    hours: "8",
    label: "Eight hours a week",
    audience:
      "The most common bucket — serious amateur, full job, family, one big ride on the weekend.",
    weeklyShape:
      "Two hard days, one long endurance day, two short Zone 2 days. The week the rest of the plans are built around.",
    bestFor:
      "Cyclists who've plateaued on apps. The hours are enough — the structure usually isn't.",
    tradeoff:
      "Needs honest easy riding. Most plateaus on 8 hours come from grey-zone training, not too little time.",
  },
  {
    hours: "10",
    label: "Ten hours a week",
    audience:
      "Riders with a target event. Club racers. People who've trained 8 and want to push the ceiling.",
    weeklyShape:
      "Three quality days, one big endurance ride, two recovery rides, plus the weekly S&C block.",
    bestFor:
      "Cat 3 to Cat 1 progress. Building toward a Marmotte, Étape or 70.3. Climbing-specific blocks.",
    tradeoff:
      "Real recovery matters more here than the next interval. The plan calls the easy ride easy on purpose.",
  },
  {
    hours: "12",
    label: "Twelve hours a week",
    audience:
      "Masters racing seriously, ultra-distance riders, comeback athletes with the time to commit.",
    weeklyShape:
      "Three to four quality sessions, two long rides, recovery days that look easy and stay easy.",
    bestFor:
      "Race-season builds, big sportives, ultra prep. The volume where polarised training really starts paying off.",
    tradeoff:
      "Twelve hours is a recovery problem, not a training problem. Sleep, food and life stress dictate the plan.",
  },
];

/* ============================================================ */
/* The four-cause diagnostic — gateway content                  */
/* ============================================================ */

const FOUR_CAUSES = [
  {
    label: "UNDER-RECOVERED",
    summary:
      "Doing the training. Not absorbing it. Sleep, life stress and back-to-back hard sessions are eating the adaptation.",
  },
  {
    label: "GREY-ZONE TRAP",
    summary:
      "Most riding is neither easy enough to recover from nor hard enough to drive change. The middle is where progress dies.",
  },
  {
    label: "STRENGTH GAP",
    summary:
      "The aerobic engine still works. The neuromuscular power that drives it is leaking quietly — about 1% a year after 40 without lifting.",
  },
  {
    label: "FUELLING DEFICIT",
    summary:
      "Training hungry. Chasing race weight. Every session is paid for with tomorrow's adaptation.",
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
    body: "Cycling-specific S&C runs alongside the riding, periodised with it. Two sessions a week. Movements that transfer to power on the bike.",
  },
  {
    number: "05",
    title: "Fuelling and recovery built in",
    body: "Carbs per hour by session, recovery windows, sleep targets. The bits most plans hand-wave that decide whether the training sticks.",
  },
  {
    number: "06",
    title: "Weekly coaching with Anthony",
    body: "Live group calls, written reviews when something doesn't go to plan, a community of riders running the same system. The reason the plan adapts when life moves.",
  },
];

/* ============================================================ */
/* Roadman vs alternatives                                      */
/* ============================================================ */

const COMPARISONS = [
  {
    alt: "TrainerRoad / Zwift workouts",
    them: "A library of sessions, AI scheduling, indoor focus. Useful for raw fitness in winter, less useful when life moves.",
    us: "A periodised plan tied to your goal, with a coach watching the file. The plan adjusts when you don't sleep, not when an algorithm guesses.",
  },
  {
    alt: "Free YouTube plans",
    them: "Generic templates, no progression, no accountability. Excellent if you're brand new to the sport.",
    us: "Built around your hours, your plateau profile and your event date — and someone to talk to in week 6 when motivation dips.",
  },
  {
    alt: "Self-coached on Strava / Garmin",
    them: "You're the coach, the athlete and the analyst. Works for some riders. Most plateau within 18 months.",
    us: "Independent eyes on your file every week. A second opinion that catches the patterns you can't see in your own data.",
  },
  {
    alt: "Off-the-shelf PDF plans",
    them: "Fixed weeks, no adjustment, no diagnosis. If the plan was wrong for you on day one, it's still wrong on day 56.",
    us: "Matched to a plateau profile before the first session. If the diagnostic says under-recovered, you don't get the build-volume plan.",
  },
];

/* ============================================================ */
/* FAQ                                                          */
/* ============================================================ */

const FAQ = [
  {
    question: "How long is a Roadman cycling training plan?",
    answer:
      "Sixteen weeks. Base, build, peak and taper, sequenced properly — the same shape every coach in the podcast network builds against. You can start mid-cycle if you've kept a year-round Zone 2 base, but the full sixteen weeks is where the methodology actually compounds.",
  },
  {
    question: "How many hours a week do I need to train on a Roadman plan?",
    answer:
      "Six, eight, ten or twelve. Six hours is enough to hold and build cleanly through a heavy work block. Eight is the most common bucket — full job, family, one big weekend ride. Ten and twelve are for riders with a target event or genuine race-season volume. Pick the number you can realistically protect for sixteen weeks, not the one that sounds impressive.",
  },
  {
    question: "How are the plans delivered?",
    answer:
      "Through TrainingPeaks. Workouts land on your calendar each week, push to your Garmin, Wahoo or Hammerhead, and report back when you're done. No printed PDFs, no separate app to wrestle. You also get the weekly coaching call with Anthony and the private community alongside the plan itself.",
  },
  {
    question: "What is periodised cycling training?",
    answer:
      "Splitting the year into phases that each build a different thing. Base for aerobic foundation, build for threshold and VO2 max work, peak for event-specific intensity, taper to shed fatigue before race day. The opposite of doing the same intervals all year and wondering why the gains stop.",
  },
  {
    question:
      "Why should I take the plateau diagnostic before getting a plan?",
    answer:
      "Because the same number of hours produces different results depending on why you're stuck. An under-recovered rider needs less, not more. A grey-zone rider needs harder hard days and slower easy ones. A strength-gap rider needs lifting before another threshold block. The diagnostic is twelve questions and four minutes — it tells you which plan shape actually fits.",
  },
  {
    question: "Do I need a power meter to follow a Roadman plan?",
    answer:
      "It helps, but it isn't required. Plenty of members run the plan on heart rate and rate of perceived exertion, then add a power meter later when they want to dial the intervals tighter. The plan is built so the prescriptions translate cleanly across both.",
  },
  {
    question: "How much does a Roadman training plan cost?",
    answer:
      "Training plans live inside the Not Done Yet coaching community — $195 a month, with a 7-day free trial. That includes the personalised TrainingPeaks plan, the weekly coaching call with Anthony, the S&C roadmap, the nutrition guidance, and a private community of serious cyclists running the same system. Cancel anytime.",
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
      "A TrainerRoad-style library gives you workouts and an algorithm that schedules them. A free plan gives you a fixed template. Both are useful entry points. The difference here is a coached, periodised plan that adapts when life moves — and a second set of eyes on the file every week so the plan corrects before you're three weeks into the wrong block.",
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
      "Periodised, coach-designed cycling training plans delivered through TrainingPeaks. 16-week periodisation across 6, 8, 10 and 12 hours per week, matched to one of four plateau profiles.",
    ...buildSearchOwnerTrustProperties("cycling-training-plans"),
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${SITE_ORIGIN}/training-plans/opengraph-image`,
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
    name: "Roadman Cycling Training Plans — 16-Week Periodised",
    description:
      "16-week periodised cycling training plans across 6, 8, 10 and 12 hours per week. Delivered through TrainingPeaks with weekly coaching from Anthony Walsh. Built around the four-cause plateau diagnostic so each rider follows the plan shape that fits their bottleneck.",
    provider: { "@id": ENTITY_IDS.organization },
    educationalCredentialAwarded: "Structured cycling fitness progression",
    hasCourseInstance: PLAN_VARIANTS.map((v) => ({
      "@type": "CourseInstance",
      name: `${v.label} cycling training plan`,
      courseMode: "Online",
      courseWorkload: `PT${v.hours}H`,
      instructor: { "@id": ENTITY_IDS.person },
    })),
    offers: {
      "@type": "Offer",
      price: "195",
      priceCurrency: "USD",
      category: "Monthly subscription",
      url: `${SITE_ORIGIN}/community/not-done-yet`,
      availability: "https://schema.org/InStock",
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
                to one of four plateau profiles before the first session —
                because the same plan doesn&apos;t fix every kind of stuck.
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

        {/* ─────────────── The argument: matched plan, not shelf plan ─── */}
        <Section background="charcoal">
          <Container width="narrow">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <ScrollReveal direction="left">
                <h2
                  className="font-heading text-off-white mb-6"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  <GradientText as="span">
                    MOST TRAINING PLANS FAIL THE SAME WAY.
                  </GradientText>
                </h2>
                <div className="space-y-4 text-foreground-muted leading-relaxed">
                  <p>
                    You download the plan. Print the calendar. Three weeks in,
                    work goes mad, sleep collapses, and the plan doesn&apos;t
                    know any of that happened. So you push through, the legs go
                    quietly, and by week eight the gains have stopped.
                  </p>
                  <p>
                    The plan wasn&apos;t wrong. The plan was generic. It was
                    written for a rider who doesn&apos;t exist, with hours that
                    look nothing like yours, against a reason for your plateau
                    nobody bothered to diagnose first.
                  </p>
                  <p className="text-off-white font-medium">
                    A plan only works when it&apos;s matched to the rider.
                    That&apos;s the whole argument here.
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
                      "Diagnose the plateau before you write the plan",
                      "Scale to the hours the rider can actually protect",
                      "Periodise across 16 weeks — base, build, peak, taper",
                      "Deliver through TrainingPeaks so the file talks back",
                      "Pair strength and fuelling with the riding, not after",
                      "Put a coach on the file every week so it adjusts when life moves",
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
                FIND OUT WHY YOU&apos;RE STUCK FIRST
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                Twelve questions. Four minutes. Tells you which of four reasons
                your FTP has stalled — and which plan shape actually fits.
                Skip this and you&apos;re guessing.
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
                Same 16-week periodisation. Honestly scaled to the time you
                actually have. Pick the number you can defend for the whole
                block — not the one that sounds the most serious.
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
                Built on {BRAND_STATS.episodeCountLabel} on-the-record
                conversations with the coaches behind Tadej Pogačar, Chris
                Froome and Egan Bernal — Seiler, Lorang, LeMond, Friel. Their
                methodology, structured for your week.
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
                          THEM
                        </p>
                        <p className="text-foreground-muted text-sm leading-relaxed">
                          {c.them}
                        </p>
                      </div>
                      <div className="rounded-lg border border-coral/30 bg-coral/5 p-4">
                        <p className="font-heading text-coral text-xs tracking-widest mb-2">
                          ROADMAN
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
                Real numbers. Real names. Different starting points, same
                periodised system underneath.
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
              lastReviewed="24 August 2026"
              reviewedBy="Roadman Cycling coaching team"
              experts={[
                {
                  name: "Prof. Stephen Seiler",
                  role: "Exercise physiologist and polarised-training researcher",
                  href: "/guests/stephen-seiler",
                },
                {
                  name: "Dan Lorang",
                  role: "Head of Performance, Red Bull–Bora–Hansgrohe",
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
              Four minutes. Twelve questions. Tells you which of the four
              plateau profiles fits you — and which Roadman plan shape comes
              next.
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

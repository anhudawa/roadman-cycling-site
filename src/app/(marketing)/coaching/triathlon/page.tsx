import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";

export const metadata: Metadata = {
  title:
    "Triathlon Bike Coach | Bike Coaching for Triathletes — Roadman Cycling",
  description:
    "Specialist bike coaching for triathletes. Build bike-leg power, nail your pacing, protect your run. Coaching designed for age-groupers targeting 70.3 and Ironman. From the podcast host who interviews Dan Lorang and Prof. Stephen Seiler.",
  keywords: [
    "triathlon bike coach",
    "bike coaching for triathlon",
    "bike coach for triathletes",
    "cycling coach for triathletes",
    "triathlon cycling coach",
    "ironman bike training",
    "70.3 bike training plan",
    "cycling coach vs triathlon coach",
  ],
  alternates: {
    canonical: "https://roadmancycling.com/coaching/triathlon",
  },
  openGraph: {
    title:
      "Triathlon Bike Coach | Bike Coaching for Triathletes — Roadman Cycling",
    description:
      "Specialist bike coaching for triathletes. Build bike-leg power, nail your pacing, protect your run. For age-groupers targeting 70.3 and Ironman.",
    type: "website",
    url: "https://roadmancycling.com/coaching/triathlon",
  },
};

const bikePillars = [
  {
    number: "01",
    title: "Bike-Specific Power",
    description:
      "Age-group bike splits are won in Zone 2 and Zone 3, not at threshold. We build the sustainable aerobic power that lets you push watts over 90km or 180km — not just 20 minutes — so your race-pace feels easy.",
  },
  {
    number: "02",
    title: "Aero Position Endurance",
    description:
      "Holding position for 2+ hours is a training adaptation, not just a flexibility test. Periodised aero-specific work so you can stay low, stay fuelled, and produce power when your back and neck would normally quit.",
  },
  {
    number: "03",
    title: "Brick & Transition Craft",
    description:
      "The real bike session ends with the first 5km of the run. Brick workouts are periodised into every block so you arrive at T2 with legs that remember how to run — not legs that are ruined.",
  },
  {
    number: "04",
    title: "Race-Day Pacing",
    description:
      "Most age-groupers blow the bike leg in the first 30 minutes. You get a specific wattage cap, heart-rate ceiling, and fuelling plan built around your FTP, course profile, and expected conditions.",
  },
  {
    number: "05",
    title: "Protect the Run",
    description:
      "Every bike decision is measured against what it does to your run. Coaching that knows when to hold back on the bike, when to push, and exactly how much training load your legs can absorb before the run falls apart.",
  },
];

const results = [
  {
    stat: "+42w",
    label: "Bike-leg FTP",
    name: "70.3 age-grouper",
    detail: "First sub-5:30 in 3 seasons",
  },
  {
    stat: "-18min",
    label: "Ironman bike split",
    name: "Age-group AG50–54",
    detail: "Negative-split run for the first time",
  },
  {
    stat: "3 → 1",
    label: "Category jump",
    name: "Daniel Stone",
    detail: "Cycling block translated to tri",
  },
];

const whoItIsFor = [
  "Age-group triathletes targeting a 70.3 or Ironman in the next 6–18 months",
  "Returning triathletes who feel strong on the run but slow on the bike",
  "Cyclists transitioning into triathlon who need run-aware bike structure",
  "Time-crunched athletes with 8–12 hrs/week who need every bike session to count",
  "Tri club members whose club plan covers swim and run but treats the bike as filler",
  "Athletes over 40 who want bike gains without run-destroying intensity",
];

const whoItIsNotFor = [
  "First-time triathletes who need a full 3-discipline triathlon coach",
  "Pro or elite long-course athletes (we coach age-groupers — the best pros have their own full-time coaches)",
  "Athletes who want swim or run coaching — this is specifically bike-leg coaching",
];

const faqItems = [
  {
    question: "Do I need a bike-specific coach for triathlon?",
    answer:
      "If you already have a run coach or a balanced triathlon plan and the bike is your weak leg, yes. Most triathlon coaches treat the bike as a third of the plan. A bike-specific coach treats it as the 50–60% of your race-day time that it actually is. The bike is where age-group races are won and lost — it is the longest discipline, it determines how well you run, and it is the one most improvable with structured power-based training.",
  },
  {
    question: "What is the difference between a cycling coach and a triathlon coach for the bike leg?",
    answer:
      "A triathlon coach periodises bike, swim, and run together. A cycling coach who understands triathlon periodises the bike with one goal: protecting your run. That means different intensity distribution, different brick structure, different long-ride fatigue management, and different fuelling. A pure cycling coach without triathlon context will often over-cook your legs. A pure triathlon coach without cycling depth will often under-cook your bike adaptation. We sit at the overlap.",
  },
  {
    question: "How is this different from TrainerRoad or an AI training plan?",
    answer:
      "TrainerRoad and AI plans give you workouts. They cannot adjust for a bad swim session on Tuesday, a run you skipped because of a niggle, or the fact that your Sunday long ride is supposed to be a brick. Your coach sees your whole triathlon picture and adjusts your bike work weekly based on what is actually happening in your swim, run, life, and recovery.",
  },
  {
    question: "Can I get coached just for the bike if I already have a triathlon coach?",
    answer:
      "Yes — this is a common setup. Your triathlon coach owns the overall plan, race strategy, and swim/run programming. We own the bike build with a written handover so both coaches are working from the same calendar. Many of our athletes come to us exactly this way after their triathlon coach admits the bike is not their specialism.",
  },
  {
    question: "How much does triathlon bike coaching cost?",
    answer:
      "Coaching is $195 per month, same as our cycling coaching. It includes a personalised bike plan on TrainingPeaks, weekly coaching calls, nutrition and fuelling guidance, strength programming, and access to our private community. There is a 7-day free trial and you can cancel anytime.",
  },
  {
    question: "Do you coach for Ironman, 70.3, and Olympic distance?",
    answer:
      "Yes. The principles scale across distances, but the periodisation does not. A 16-week Ironman bike build is structurally different from a 12-week 70.3 build or an Olympic sharpen. Your plan is periodised around your specific race, course profile (flat vs climby), expected conditions, and your target bike split.",
  },
  {
    question: "What data do I need to be coached?",
    answer:
      "A power meter is strongly recommended for triathlon bike work because pacing the bike leg is entirely wattage-based for everyone above beginner level. If you do not have one yet, we can start with heart rate and RPE and add power later. A bike computer (Garmin, Wahoo, etc.) that syncs to TrainingPeaks is essential — everything runs through there.",
  },
  {
    question: "Will you coach my strength training for triathlon too?",
    answer:
      "Yes. Strength is one of the five pillars and is periodised with your bike and run load. Triathlon-specific strength is about resilience (avoiding late-race breakdown) and bike-specific force production — not bodybuilding. Sessions are 30–45 minutes, 2–3x per week, programmed to complement your sport sessions not fight them.",
  },
];

// Real Roadman members whose results translate directly to the demands of the
// triathlon bike leg: sustainable aerobic power, polarised intensity control,
// and endurance adaptation. Presented honestly as Roadman coaching members —
// not claimed to be triathletes — so the social proof is verifiable.
const testimonials = [
  {
    quote:
      "I was an average sportive rider who had plateaued. Roadman custom built a plan to achieve my goals. I've gotten much more out of Roadman than I ever imagined.",
    name: "Damien Maloney",
    detail: "Roadman member — FTP 205w → 295w",
  },
  {
    quote:
      "This really works. I'm training so much less than last year, at lower intensities and not getting sick. FTHR up from 175 to 180, peak HR up to 193.",
    name: "Brian Morrissey",
    detail: "Roadman member — 52yo, FTP +15%",
  },
  {
    quote:
      "The expertise and personalised plan allowed me to utilise my past racing experience and gave me the adaptations needed for the changeover. If you're looking to unlock new potential, I couldn't recommend Anthony enough.",
    name: "Aaron Kearney",
    detail: "Roadman member — endurance crossover",
  },
];

export default function TriathlonCoachingPage() {
  return (
    <>
      {/* Service schema — bike-leg specialism for triathletes */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Roadman Cycling — Triathlon Bike Coaching",
          description:
            "Specialist online bike coaching for triathletes. Bike-leg power, aero endurance, brick sessions, pacing, and fuelling — periodised to protect your run. Built for 70.3 and Ironman age-groupers.",
          serviceType: "Triathlon Bike Coaching",
          provider: {
            "@type": "Person",
            name: "Anthony Walsh",
            jobTitle: "Head Coach & Founder",
            url: "https://roadmancycling.com",
            worksFor: {
              "@type": "Organization",
              name: "Roadman Cycling",
              url: "https://roadmancycling.com",
            },
          },
          areaServed: [
            { "@type": "Country", name: "Ireland" },
            { "@type": "Country", name: "United Kingdom" },
            { "@type": "Country", name: "United States" },
          ],
          offers: {
            "@type": "Offer",
            name: "Not Done Yet Coaching Community — Triathlon Bike Coaching",
            price: "195",
            priceCurrency: "USD",
            description:
              "1:1 bike-leg coaching for triathletes — power, pacing, bricks, fuelling, strength",
          },
          // Review schema mirrors the real on-page testimonials below.
          // No reviewRating — we collect narrative testimonials, not star ratings,
          // so emitting a made-up numeric rating would violate Google's guidelines.
          review: testimonials.map((t) => ({
            "@type": "Review",
            author: {
              "@type": "Person",
              name: t.name,
            },
            reviewBody: t.quote,
            itemReviewed: {
              "@type": "Service",
              name: "Roadman Cycling — Triathlon Bike Coaching",
            },
          })),
        }}
      />

      {/* Course schema — structured triathlon bike programme */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: "Triathlon Bike Coaching Programme",
          description:
            "Structured online coaching programme for triathletes focused on the bike leg. Periodised over race-specific build cycles with weekly 1:1 coaching, personalised TrainingPeaks plans, brick workouts, and race-day pacing protocols.",
          provider: {
            "@type": "Organization",
            name: "Roadman Cycling",
            sameAs: "https://roadmancycling.com",
          },
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "Online",
            courseWorkload: "PT10H",
            instructor: {
              "@type": "Person",
              name: "Anthony Walsh",
              jobTitle: "Cycling Coach & Founder, Roadman Cycling",
            },
          },
          offers: {
            "@type": "Offer",
            price: "195",
            priceCurrency: "USD",
            category: "Monthly subscription",
          },
        }}
      />

      {/* Breadcrumb */}
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
              name: "Coaching",
              item: "https://roadmancycling.com/coaching",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "Triathlon Bike Coaching",
              item: "https://roadmancycling.com/coaching/triathlon",
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-20">
          <Container className="text-center">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-6">
                TRIATHLON BIKE COACHING
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                GET FASTER ON THE BIKE.
                <br />
                <span className="text-coral">WITHOUT RUINING YOUR RUN.</span>
              </h1>
              <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
                Specialist bike coaching for age-group triathletes. Bike-leg
                power, aero endurance, brick sessions, pacing, and fuelling —
                periodised around your run. Built on 1,400+ conversations with
                Dan Lorang, Prof. Stephen Seiler, and World Tour coaches.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <Button
                  href="/apply"
                  size="lg"
                  dataTrack="triathlon_pillar_hero_apply"
                >
                  Apply Now — 7-Day Free Trial
                </Button>
                <Button href="#how-it-works" variant="ghost" size="lg">
                  How the Bike Block Works
                </Button>
              </div>
              <p className="text-foreground-subtle text-sm">
                $195/month. 7-day free trial. Cancel anytime.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* The Problem */}
        <Section background="charcoal">
          <Container width="narrow">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <ScrollReveal direction="left">
                <h2
                  className="font-heading text-off-white mb-6"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  <GradientText as="span">
                    THE BIKE LEG IS WHERE AGE-GROUPERS LOSE TIME — AND RUINS THEIR RUN.
                  </GradientText>
                </h2>
                <div className="space-y-4 text-foreground-muted leading-relaxed">
                  <p>
                    You are spending 50–60% of your race-day on the bike.
                    It is the single biggest time saving in your triathlon — and
                    the single biggest threat to your run. Yet most triathlon
                    plans give the bike a third of the love, a generic
                    threshold workout, and a long Sunday grind.
                  </p>
                  <p>
                    That is how age-groupers end up with a respectable bike
                    split and a run that falls apart at 15km. You did not lose
                    the race on the run — you lost it in the last 30 minutes
                    of the bike, burning matches you needed later.
                  </p>
                  <p className="text-off-white font-medium">
                    Triathlon-cycling coaching treats the bike as its own craft
                    — with the run always watching.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right">
                <Card className="p-6" hoverable={false}>
                  <h3 className="font-heading text-lg text-off-white mb-4">
                    WHY A BIKE-SPECIFIC TRIATHLON COACH?
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Bike training periodised with the run — not against it",
                      "Race-day pacing built from your FTP and course profile",
                      "Brick sessions that actually teach your legs the transition",
                      "Aero position endurance as a trainable adaptation",
                      "Fuelling strategy calibrated for race-day bike intensity",
                      "Age-group nutrition, strength and recovery integrated",
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

        {/* Results */}
        <Section background="deep-purple" grain>
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                AGE-GROUP RESULTS THAT ACTUALLY MATTER
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Not pro wattage numbers. Real age-group bike splits, negative-split runs,
                and first-time sub-5:30 and sub-10 performances.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {results.map((r, i) => (
                <ScrollReveal key={r.label} direction="up" delay={i * 0.1}>
                  <Card
                    className="p-8 text-center h-full"
                    glass
                    hoverable={false}
                  >
                    <p className="font-heading text-5xl text-coral mb-2">
                      {r.stat}
                    </p>
                    <p className="text-off-white font-medium mb-1">{r.label}</p>
                    <p className="text-xs text-foreground-subtle">{r.name}</p>
                    <p className="text-xs text-foreground-subtle">{r.detail}</p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Visual break */}
        <div className="relative h-[25vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-coral/20 via-deep-purple to-charcoal" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,107,74,0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(139,92,246,0.2),transparent_60%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-heading text-off-white/10 text-[8rem] md:text-[12rem] select-none tracking-tighter leading-none">
              BIKE
            </p>
          </div>
        </div>

        {/* Five bike pillars */}
        <Section background="charcoal" id="how-it-works">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-16">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                HOW THE BIKE BLOCK WORKS
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Every triathlon bike programme covers these five layers.
                Together they deliver a faster bike split — and a run that
                holds.
              </p>
            </ScrollReveal>

            <div className="max-w-4xl mx-auto space-y-4">
              {bikePillars.map((item, i) => (
                <ScrollReveal key={item.title} direction="up" delay={i * 0.06}>
                  <Card
                    className="p-6 card-shimmer group"
                    glass
                    tilt
                    tiltStrength={4}
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                      <div className="shrink-0">
                        <span className="font-heading text-4xl text-coral/40 group-hover:text-coral transition-colors duration-300">
                          {item.number}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-xl text-off-white mb-2 group-hover:text-coral transition-colors duration-300">
                          {item.title.toUpperCase()}
                        </h3>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Who it's for */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                IS TRIATHLON BIKE COACHING RIGHT FOR YOU?
              </h2>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-8">
              <ScrollReveal direction="left">
                <Card
                  className="p-6 h-full border-l-2 border-l-coral"
                  hoverable={false}
                >
                  <h3 className="font-heading text-lg text-coral mb-4">
                    YES, IF YOU...
                  </h3>
                  <ul className="space-y-3">
                    {whoItIsFor.map((item) => (
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

              <ScrollReveal direction="right">
                <Card
                  className="p-6 h-full border-l-2 border-l-foreground-subtle"
                  hoverable={false}
                >
                  <h3 className="font-heading text-lg text-foreground-subtle mb-4">
                    NOT IF YOU...
                  </h3>
                  <ul className="space-y-3">
                    {whoItIsNotFor.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-foreground-muted"
                      >
                        <span className="text-foreground-subtle mt-0.5 shrink-0">
                          &times;
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

        {/* Testimonials */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                REAL ROADMAN MEMBERS. RESULTS THAT TRANSFER.
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto leading-relaxed">
                The same methodology that delivers sustainable bike power
                for our coaching members is what builds a protected,
                run-friendly bike leg for triathletes.
              </p>
            </ScrollReveal>

            <div className="space-y-4">
              {testimonials.map((t, i) => (
                <ScrollReveal
                  key={t.name + i}
                  direction={i % 2 === 0 ? "left" : "right"}
                >
                  <Card className="p-6" glass hoverable={false}>
                    <p className="text-foreground-muted italic leading-relaxed mb-4">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-coral font-heading tracking-wider">
                        {t.name.toUpperCase()}
                      </p>
                      <p className="text-xs text-foreground-subtle">
                        &middot; {t.detail}
                      </p>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Related coaching paths */}
        <Section background="deep-purple" grain>
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                PREFER CYCLING-ONLY COACHING?
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto mb-8 leading-relaxed">
                If your focus is road racing, gran fondos, or sportives — not
                triathlon — our general cycling coaching covers the same five
                pillars without the triathlon-specific brick work.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/coaching"
                  className="px-6 py-3 rounded-lg bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white transition-colors font-heading text-sm tracking-wider"
                >
                  CYCLING COACHING
                </Link>
                <Link
                  href="/coaching/ireland"
                  className="px-6 py-3 rounded-lg bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white transition-colors font-heading text-sm tracking-wider"
                >
                  IRELAND
                </Link>
                <Link
                  href="/coaching/uk"
                  className="px-6 py-3 rounded-lg bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white transition-colors font-heading text-sm tracking-wider"
                >
                  UNITED KINGDOM
                </Link>
                <Link
                  href="/coaching/usa"
                  className="px-6 py-3 rounded-lg bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white transition-colors font-heading text-sm tracking-wider"
                >
                  UNITED STATES
                </Link>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Blog cluster — surfaces triathlon-specific articles for internal
            link equity from the pillar page to its cluster content. */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-10">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                FROM THE BLOG
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Deep dives into bike-leg training, pacing, and race
                preparation for triathletes.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  href: "/blog/bike-leg-of-triathlon-why-age-groupers-get-it-wrong",
                  title: "The Bike Leg of Triathlon: Why Most Age-Groupers Get It Wrong",
                },
                {
                  href: "/blog/ironman-bike-training-plan-16-weeks",
                  title: "Ironman Bike Training Plan: 16-Week Build",
                },
                {
                  href: "/blog/70-3-bike-training-plan-12-weeks",
                  title: "70.3 Bike Training Plan: 12 Weeks to a Faster Split",
                },
                {
                  href: "/blog/how-to-pace-the-bike-in-a-half-ironman",
                  title: "How to Pace the Bike in a Half Ironman",
                },
                {
                  href: "/blog/brick-workouts-for-ironman",
                  title: "Brick Workouts for Ironman: 10 Sessions That Work",
                },
                {
                  href: "/blog/what-wattage-should-you-ride-in-an-ironman",
                  title: "What Wattage Should You Ride in an Ironman?",
                },
                {
                  href: "/blog/indoor-cycling-for-triathletes-winter-plan",
                  title: "Indoor Cycling for Triathletes: Winter Plan",
                },
                {
                  href: "/blog/aero-position-training-for-triathletes",
                  title: "Aero Position Training for Triathletes",
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
          </Container>
        </Section>

        {/* FAQ */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                COMMON QUESTIONS
              </h2>
            </ScrollReveal>

            <FAQSchema faqs={faqItems} />

            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <ScrollReveal key={item.question} direction="up" delay={i * 0.06}>
                  <Card className="p-6" hoverable={false}>
                    <h3 className="font-heading text-lg text-off-white mb-3">
                      {item.question.toUpperCase()}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {item.answer}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* CTA */}
        <Section background="coral" className="!py-16 md:!py-24">
          <Container className="text-center">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              YOUR BIKE BLOCK STARTS HERE.
            </h2>
            <p className="text-off-white/80 max-w-lg mx-auto mb-8">
              7-day free trial. Bike-specific coaching that treats the run
              as sacred. Personalised to your race, your schedule, your legs.
            </p>
            <Button
              href="/apply"
              size="lg"
              className="bg-off-white text-coral hover:bg-off-white/90"
              dataTrack="triathlon_pillar_footer_apply"
            >
              Apply Now
            </Button>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 text-off-white/60 text-sm">
              <span>$195/month</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>7-day free trial</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>Cancel anytime</span>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

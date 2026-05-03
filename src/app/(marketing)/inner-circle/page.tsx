import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { ENTITY_IDS } from "@/lib/brand-facts";

const SKOOL_URL = "https://www.skool.com/roadmancycling/about";

export const metadata: Metadata = {
  title: "Roadman Inner Circle — The Five NDY Pillars, Levelled Up | $475/month",
  description:
    "The five Not Done Yet pillars — training, nutrition, recovery, strength, community — with a coach reading your data daily and replying on the days it matters. Plus a sixth pillar nobody else gives you: Performance Health. $475/month. Cohorts of 8–12. Limited intake.",
  alternates: {
    canonical: "https://roadmancycling.com/inner-circle",
  },
  openGraph: {
    title: "Roadman Inner Circle — The Five NDY Pillars, Levelled Up",
    description:
      "Everything Not Done Yet gives you, with a coach reading your data daily. Plus a sixth pillar nobody else offers: Performance Health. $475/month.",
    type: "website",
    url: "https://roadmancycling.com/inner-circle",
  },
};

const pillars = [
  {
    number: "01",
    name: "Training",
    ndy:
      "A personalised TrainingPeaks plan, structured around your goals and your week.",
    ic:
      "Daily session feedback. Your coach reads every ride you log — what you did, how it landed, what to change before the next one. Same plan, real-time hands on it.",
  },
  {
    number: "02",
    name: "Nutrition",
    ndy:
      "The fuelling masterclasses, the race-weight frameworks, the protocols you can apply on your own.",
    ic:
      "Daily macro monitoring. Your coach reads what you ate, sees how it lined up against your sessions, and writes back when it's drifting. Race weight without the disordered chaos of MyFitnessPal.",
  },
  {
    number: "03",
    name: "Recovery",
    ndy:
      "The recovery education — sleep, HRV, stress, illness protocols, the principles you can run yourself.",
    ic:
      "Personalised recovery. Your coach reviews your sleep architecture, HRV trend, training-readiness signal, and life stress every week. The protocol moves with you instead of the other way round.",
  },
  {
    number: "04",
    name: "Strength & Conditioning",
    ndy:
      "The Roadman S&C roadmap — the same programme used by every member.",
    ic:
      "Periodised S&C, tuned to your race calendar. Built block-by-block to your training load, your injury history, and the events on your calendar. Strength that transfers to the bike instead of wrecking your legs.",
  },
  {
    number: "05",
    name: "Community",
    ndy:
      "The wider Not Done Yet group — the live calls, the masterclasses, the room of serious cyclists.",
    ic:
      "Your own cohort of 8–12 inside it. Weekly tactical review call with your coach and your group. Pre-event strategy sessions for your target races. The smaller room where the real coaching happens.",
  },
];

const performanceHealth = [
  {
    title: "Quarterly blood work analysis",
    body:
      "Iron, ferritin, full thyroid, Vitamin D, electrolytes — read against your training load, not in isolation. Catches the deficiencies that quietly cost you watts in February so they don't blow up your May.",
  },
  {
    title: "Biomarker trends across seasons",
    body:
      "Not a single snapshot. A trend. Each quarter joins the last until we can see the slow drift coming and head it off before it becomes the spring you spent off the bike.",
  },
  {
    title: "Hormone panels",
    body:
      "Testosterone, cortisol, DHEA, free T3. The markers most coaches don't read and most cyclists never check. The ones that explain why training stopped working before any plan tweak ever could.",
  },
  {
    title: "Inflammation monitoring",
    body:
      "hs-CRP, ferritin in context, post-event recovery markers. The signal that tells us when the body is telling you to back off — long before the leg-feel does.",
  },
  {
    title: "Proactive screening guidance",
    body:
      "Heart screening for masters athletes, bone density, the right conversations to have with your GP. Cycling past 50 is a long-game sport. We treat it like one.",
  },
];

const howItWorks = [
  {
    title: "Cohort of 8–12 riders, assigned coach",
    body:
      "Small enough that your coach knows your training inside out. Big enough that you've got peers in the same window of progress to pull you forward.",
  },
  {
    title: "Daily log review",
    body:
      "Your coach reads your training, sleep, and macro logs every day. Quick written feedback in your private cohort channel — same day, every day.",
  },
  {
    title: "Weekly check-in plus monthly video deep-dive",
    body:
      "You submit your week. Your coach replies inside 24 hours. Once a month, 45 minutes on video — last month reviewed, next month set.",
  },
  {
    title: "Quarterly performance + health review",
    body:
      "The premium touchpoint. Bloods, biomarkers, body comp, power curves, race results — all read together. Then the next twelve weeks re-planned from the data, not from inertia.",
  },
];

const faqs = [
  {
    question: "How is this different from Not Done Yet?",
    answer:
      "Same five pillars. Levelled up. NDY gives you the system, the plan, and the room. Inner Circle puts a coach inside it who reads your data every day and writes back when it matters — and adds a sixth pillar that NDY doesn't have at all: Performance Health. Bloods, biomarkers, hormones, inflammation, proactive screening. The pillar nobody else offers.",
  },
  {
    question: "Why $475? That's a lot for a Skool community.",
    answer:
      "Because it isn't really a Skool community — it's a small-cohort coaching programme that uses Skool to deliver. Your coach reads your logs daily, replies to your written check-in weekly, runs a video with you monthly, reads your bloods quarterly. In-person 1:1 cycling coaching usually runs €600–€1,200/month and stops at the bike. Performance Health alone — bloods plus biomarker tracking — runs €400+/year on its own. The price sits where the value sits.",
  },
  {
    question: "Why a cohort and not pure 1:1?",
    answer:
      "Two reasons. First — the peer accountability inside a small group of riders at the same level beats anything you'll get on a solo call. The cohort sees your wins. They notice when you go quiet. That alone moves more numbers than another hour of 1:1 ever did. Second — pure 1:1 at this depth costs €1,000+/month or it kills the coach. The cohort model lets us deliver coach-level attention without breaking either side. It's how the best academies in the sport actually run.",
  },
  {
    question: "Who actually coaches me?",
    answer:
      "An assigned Roadman coach inside your cohort. They sit inside the Roadman system, talk to Anthony weekly about how the cohort is moving, and use the same five-pillar methodology built from 1,400+ podcast conversations. You're not coached by a clip. You're coached by a person who knows your name, your numbers, and your race calendar.",
  },
  {
    question: "I'm over 50. Is the Performance Health pillar going to be useful for me?",
    answer:
      "It's the reason this pillar exists. The cyclists who get most out of it are masters athletes who want to ride hard for the next twenty years, not just the next twelve months. We're tracking the markers your GP isn't watching for and your coach has no business reading. The work pays back over years, not weeks.",
  },
  {
    question: "I already have a coach. Why switch?",
    answer:
      "You probably shouldn't if your coach is working. But if you're paying €300+/month for a plan that doesn't move with your life, doesn't read your bloods, and doesn't tie nutrition, S&C and recovery into the picture — that's the gap the Inner Circle was built to close.",
  },
  {
    question: "What if I need to pause for a few months?",
    answer:
      "Tell your coach. We pause the membership and hold your spot in the cohort. Inner Circle is a long-game tier — injury weeks, work trips, bad seasons happen. We plan around them, not in spite of them.",
  },
  {
    question: "How quickly will I see results?",
    answer:
      "Eight weeks for the first measurable changes — sleep quality, recovery markers, sometimes power. Twelve weeks for the kind of progress you'll feel on a climb. A full season for the body composition, FTP and biomarker shifts that show up in race results. Coaching is compound, not instant.",
  },
  {
    question: "Is there a contract?",
    answer:
      "No. Monthly billing inside Skool. Cancel any time. The work speaks for itself or it doesn't.",
  },
  {
    question: "What happens after I apply?",
    answer:
      "You pay your first month inside Skool. Your coach is in your DMs within 24 hours with an onboarding questionnaire — training history, recent bloods if you have them, goals, calendar, life context. Within seven days you're in a cohort, on TrainingPeaks, and the daily log review starts.",
  },
];

export default function InnerCirclePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Roadman Inner Circle — Premium Cohort Cycling Coaching",
          description:
            "The five Not Done Yet pillars — training, nutrition, recovery, strength, community — levelled up with daily coach feedback inside a small cohort of 8–12 riders. Plus a sixth pillar exclusive to the Inner Circle: Performance Health (blood work, biomarkers, hormones, inflammation, proactive screening).",
          serviceType: "Premium Cohort Online Cycling Coaching",
          provider: { "@id": ENTITY_IDS.organization },
          brand: { "@id": ENTITY_IDS.organization },
          offers: {
            "@type": "Offer",
            name: "Roadman Inner Circle",
            price: "475",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: SKOOL_URL,
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "475",
              priceCurrency: "USD",
              billingDuration: "P1M",
              billingIncrement: 1,
              referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
            },
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Inner Circle", item: "https://roadmancycling.com/inner-circle" },
          ],
        }}
      />
      <FAQSchema faqs={faqs} />

      <Header />

      <main id="main-content">
        {/* ===========================================================
            HERO — generous space, gradient halo, restrained coral
            =========================================================== */}
        <Section background="deep-purple" grain className="!pt-40 !pb-32 md:!pt-48 md:!pb-40">
          {/* Ambient atmospheric glow */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 900px 600px at 50% 30%, rgba(76,18,115,0.55) 0%, transparent 60%), radial-gradient(ellipse 600px 400px at 80% 80%, rgba(241,99,99,0.08) 0%, transparent 70%)",
            }}
          />
          <Container className="relative text-center">
            <ScrollReveal direction="up" eager>
              <p className="font-heading text-foreground-subtle text-xs md:text-sm tracking-[0.4em] mb-8">
                THE INNER CIRCLE
              </p>
              <h1
                className="font-heading text-off-white mb-10 text-gradient-animated leading-[0.95]"
                style={{ fontSize: "clamp(3.5rem, 9vw, 9rem)" }}
              >
                STILL NOT WHERE
                <br />
                YOU SHOULD BE.
              </h1>
              <p
                className="text-foreground-muted mx-auto mb-8 leading-relaxed font-light"
                style={{ fontSize: "clamp(1.125rem, 1.5vw, 1.375rem)", maxWidth: "640px" }}
              >
                You read the books. You did the FTP tests. You bought the power
                meter, the carbon shoes, the ceramic bearings — all of it. You
                ride more hours than half the lads you can&apos;t drop. And the
                watts haven&apos;t moved in a year.
              </p>
              <p
                className="text-off-white mx-auto mb-16 leading-relaxed"
                style={{ fontSize: "clamp(1.25rem, 1.75vw, 1.5rem)", maxWidth: "640px" }}
              >
                You&apos;re not under-trained.
                <span className="block text-coral mt-1">You&apos;re over-guessed.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
                <Button
                  href={SKOOL_URL}
                  external
                  size="lg"
                  dataTrack="inner_circle_hero_apply"
                >
                  Apply Through Skool
                </Button>
                <Button href="#pillars" variant="ghost" size="lg">
                  See The Six Pillars
                </Button>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-foreground-subtle text-xs md:text-sm tracking-[0.2em] uppercase">
                <span>$475/month</span>
                <span aria-hidden className="text-coral/40">&bull;</span>
                <span>Cohorts of 8&ndash;12</span>
                <span aria-hidden className="text-coral/40">&bull;</span>
                <span>Limited intake</span>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* ===========================================================
            PILLARS INTRO — calm, confident framing
            =========================================================== */}
        <Section background="charcoal" className="!py-32 md:!py-40">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center">
              <p className="font-heading text-foreground-subtle text-xs tracking-[0.4em] mb-8">
                YOU ALREADY KNOW THE WORK
              </p>
              <h2
                className="font-heading text-off-white mb-10 leading-[1.02]"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
              >
                FIVE PILLARS.
                <br />
                ONE SYSTEM.
                <br />
                <span className="text-coral">NO SHORTCUTS.</span>
              </h2>
              <div className="space-y-6 text-foreground-muted leading-relaxed font-light max-w-[640px] mx-auto" style={{ fontSize: "clamp(1.0625rem, 1.4vw, 1.25rem)" }}>
                <p>
                  Not Done Yet runs on five pillars — training, nutrition,
                  recovery, strength, and community. The five things that
                  decide whether you actually get faster, in roughly the order
                  most cyclists lose their gains.
                </p>
                <p className="text-off-white">
                  The Inner Circle is what those same five pillars look like
                  when one coach reads your data every day, replies on the days
                  it matters, and pulls a sixth pillar in that no app, no plan,
                  and no podcast clip can give you.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-14">
                {[
                  { label: "Training", premium: false },
                  { label: "Nutrition", premium: false },
                  { label: "Recovery", premium: false },
                  { label: "Strength", premium: false },
                  { label: "Community", premium: false },
                  { label: "Performance Health", premium: true },
                ].map((p) => (
                  <span
                    key={p.label}
                    className={`font-heading text-[11px] md:text-xs tracking-[0.2em] px-4 py-2 rounded-full border transition-colors ${
                      p.premium
                        ? "bg-coral/10 text-coral border-coral/40 shadow-[0_0_20px_rgba(241,99,99,0.15)]"
                        : "bg-white/[0.03] text-foreground-muted border-white/10"
                    }`}
                  >
                    {p.label.toUpperCase()}
                  </span>
                ))}
              </div>
              <p className="text-foreground-subtle text-[10px] md:text-xs mt-5 tracking-[0.25em]">
                FIVE FROM NDY <span className="text-coral/70">&middot; ONE EXCLUSIVE TO THE INNER CIRCLE</span>
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* ===========================================================
            FIVE PILLARS — NDY vs IC, cinematic cards
            =========================================================== */}
        <Section background="deep-purple" grain id="pillars" className="!py-32 md:!py-40">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-20 md:mb-24">
              <p className="font-heading text-foreground-subtle text-xs tracking-[0.4em] mb-6">
                WHAT CHANGES IN THE INNER CIRCLE
              </p>
              <h2
                className="font-heading text-off-white mb-8 leading-[1.02]"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
              >
                THE SAME FIVE PILLARS.
                <br />
                <span className="text-coral">LEVELLED UP.</span>
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto leading-relaxed font-light text-lg">
                Everything Not Done Yet gives you. Plus a coach watching,
                reading, replying, and adjusting against your data — every day.
              </p>
            </ScrollReveal>

            <div className="max-w-5xl mx-auto space-y-8 md:space-y-10">
              {pillars.map((p, i) => (
                <ScrollReveal key={p.name} direction="up" delay={i * 0.05}>
                  <div className="relative group">
                    {/* Oversized number watermark */}
                    <span
                      aria-hidden
                      className="absolute -top-6 -left-2 md:-top-8 md:-left-6 font-heading text-white/[0.04] select-none pointer-events-none leading-none"
                      style={{ fontSize: "clamp(7rem, 12vw, 11rem)" }}
                    >
                      {p.number}
                    </span>

                    <Card className="relative p-8 md:p-12 card-shimmer" glass hoverable={false}>
                      <div className="flex items-baseline gap-5 mb-8">
                        <span className="font-heading text-coral/70 text-sm md:text-base tracking-[0.3em]">
                          {p.number}
                        </span>
                        <h3
                          className="font-heading text-off-white tracking-wide leading-none"
                          style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
                        >
                          {p.name.toUpperCase()}
                        </h3>
                      </div>

                      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-8 items-stretch">
                        <div className="md:pr-2">
                          <p className="font-heading text-foreground-subtle text-[10px] md:text-xs tracking-[0.3em] mb-3">
                            NOT DONE YET
                          </p>
                          <p className="text-[15px] md:text-base text-foreground-muted leading-relaxed font-light">
                            {p.ndy}
                          </p>
                        </div>

                        {/* Vertical divider on desktop, horizontal on mobile */}
                        <div
                          aria-hidden
                          className="hidden md:block w-px bg-gradient-to-b from-transparent via-coral/30 to-transparent"
                        />
                        <div
                          aria-hidden
                          className="md:hidden h-px bg-gradient-to-r from-transparent via-coral/30 to-transparent"
                        />

                        <div className="md:pl-2">
                          <p className="font-heading text-coral text-[10px] md:text-xs tracking-[0.3em] mb-3">
                            INNER CIRCLE ADDS
                          </p>
                          <p className="text-[15px] md:text-base text-off-white leading-relaxed">
                            {p.ic}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ===========================================================
            SIXTH PILLAR — Performance Health (the halo section)
            =========================================================== */}
        <section
          id="performance-health"
          className="relative overflow-hidden bg-gradient-to-b from-deep-purple via-[#1a0535] to-charcoal py-32 md:py-48"
        >
          {/* Atmospheric coral glow — distinct treatment for the differentiator */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none grain-overlay"
            style={{
              background:
                "radial-gradient(ellipse 1100px 700px at 50% 0%, rgba(241,99,99,0.10) 0%, transparent 60%), radial-gradient(ellipse 800px 500px at 50% 100%, rgba(76,18,115,0.45) 0%, transparent 70%)",
            }}
          />

          {/* Oversized 06 watermark */}
          <span
            aria-hidden
            className="absolute -top-8 left-1/2 -translate-x-1/2 font-heading text-white/[0.025] select-none pointer-events-none leading-none"
            style={{ fontSize: "clamp(16rem, 32vw, 32rem)" }}
          >
            06
          </span>

          <Container className="relative">
            <ScrollReveal direction="up" className="text-center mb-20 md:mb-24 max-w-3xl mx-auto">
              <p className="font-heading text-coral text-xs md:text-sm tracking-[0.4em] mb-6">
                THE SIXTH PILLAR &middot; INNER CIRCLE EXCLUSIVE
              </p>
              <h2
                className="font-heading text-off-white mb-10 leading-[1.02]"
                style={{ fontSize: "clamp(2.75rem, 7vw, 6rem)" }}
              >
                PERFORMANCE
                <br />
                <span className="text-gradient-animated">HEALTH.</span>
              </h2>
              <div className="space-y-6 text-foreground-muted leading-relaxed font-light text-lg md:text-xl">
                <p>
                  Most coaching stops at the bike. The Inner Circle starts
                  where in-bike coaching ends. Quarterly bloods, biomarker
                  trends across seasons, hormone panels, inflammation markers,
                  and proactive screening guidance for the things that quietly
                  decide whether you&apos;re still riding hard at sixty.
                </p>
                <p className="text-off-white">
                  The pillar a training app can&apos;t see, your GP isn&apos;t
                  watching for, and a regular cycling coach has no business
                  reading. Built so masters athletes can ride strong for
                  decades — not just one more season.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {performanceHealth.map((item, i) => (
                <ScrollReveal key={item.title} direction="up" delay={(i % 3) * 0.08}>
                  <Card
                    className={`relative p-8 h-full card-shimmer overflow-hidden ${
                      i === 0 ? "lg:col-span-1" : ""
                    }`}
                    glass
                    hoverable={false}
                  >
                    {/* Coral accent line on top */}
                    <div
                      aria-hidden
                      className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-coral/60 to-transparent"
                    />
                    <span className="font-heading text-coral/50 text-sm tracking-[0.3em] mb-4 block">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-heading text-off-white text-xl md:text-2xl tracking-wide leading-tight mb-4">
                      {item.title.toUpperCase()}
                    </h3>
                    <p className="text-[15px] text-foreground-muted leading-relaxed font-light">
                      {item.body}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal direction="up" className="mt-16 md:mt-20 max-w-2xl mx-auto text-center">
              <p className="text-foreground-muted text-base md:text-lg leading-relaxed italic font-light">
                The pros stay in the sport for decades because someone watches
                the things you can&apos;t see from the saddle. Performance
                Health is built around that idea.
              </p>
            </ScrollReveal>
          </Container>
        </section>

        <div className="gradient-divider" />

        {/* ===========================================================
            HOW IT WORKS — quiet, confident
            =========================================================== */}
        <Section background="deep-purple" grain id="how-it-works" className="!py-32 md:!py-40">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-16 md:mb-20">
              <p className="font-heading text-foreground-subtle text-xs tracking-[0.4em] mb-6">
                HOW IT&apos;S DELIVERED
              </p>
              <h2
                className="font-heading text-off-white mb-8 leading-[1.02]"
                style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
              >
                A SMALL ROOM.
                <br />
                ONE COACH.
                <br />
                <span className="text-coral">THE FULL SYSTEM.</span>
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto leading-relaxed font-light text-lg">
                Inner Circle runs in cohorts. Daily contact when it matters,
                deeper sessions when they&apos;re needed. Built so a working
                cyclist gets coach-level attention without burning the coach or
                the cyclist.
              </p>
            </ScrollReveal>

            <div className="space-y-5">
              {howItWorks.map((step, i) => (
                <ScrollReveal key={step.title} direction="up" delay={i * 0.06}>
                  <div className="relative pl-8 md:pl-10 py-2 group">
                    <span
                      aria-hidden
                      className="absolute left-0 top-3 font-heading text-coral/40 text-sm tracking-[0.3em]"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      aria-hidden
                      className="absolute left-[14px] top-9 bottom-2 w-px bg-white/[0.06]"
                    />
                    <h3 className="font-heading text-off-white text-lg md:text-xl tracking-wide mb-2">
                      {step.title.toUpperCase()}
                    </h3>
                    <p className="text-[15px] text-foreground-muted leading-relaxed font-light">
                      {step.body}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* ===========================================================
            WHO IT'S FOR
            =========================================================== */}
        <Section background="charcoal" className="!py-32 md:!py-40">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-16 md:mb-20">
              <p className="font-heading text-foreground-subtle text-xs tracking-[0.4em] mb-6">
                WHO IT&apos;S FOR
              </p>
              <h2
                className="font-heading text-off-white leading-[1.02]"
                style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
              >
                IS THE INNER CIRCLE
                <br />
                <span className="text-coral">FOR YOU?</span>
              </h2>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <ScrollReveal direction="left">
                <div className="relative p-8 md:p-10 h-full rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                  <div
                    aria-hidden
                    className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-coral/50 to-transparent"
                  />
                  <h3 className="font-heading text-coral text-sm tracking-[0.3em] mb-7">
                    YES, IF YOU&hellip;
                  </h3>
                  <ul className="space-y-4">
                    {[
                      "Have been training consistently for 1–2+ years and stopped improving",
                      "Train 8+ hours a week and want every one of them to count",
                      "Are over 40 and want to ride strong for decades, not one more season",
                      "Have a target — a category jump, a Grand Fondo PB, an Ironman bike split",
                      "Will share your data honestly so it can be coached against",
                      "Want a small room of serious cyclists watching your work",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-[15px] text-foreground-muted leading-relaxed font-light"
                      >
                        <span className="text-coral mt-1.5 shrink-0 text-xs">&#9679;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right">
                <div className="relative p-8 md:p-10 h-full rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                  <div
                    aria-hidden
                    className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  />
                  <h3 className="font-heading text-foreground-subtle text-sm tracking-[0.3em] mb-7">
                    NOT IF YOU&hellip;
                  </h3>
                  <ul className="space-y-4">
                    {[
                      "Are starting out — the free Clubhouse and NDY are better fits",
                      "Want a plug-and-play plan with no input expected from you",
                      "Aren't ready to share honest data — coaching needs the truth",
                      "Already have a coach you trust who's still moving you forward",
                      "Want a status badge — this is a working tier, not a vanity one",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-[15px] text-foreground-muted leading-relaxed font-light"
                      >
                        <span className="text-foreground-subtle mt-1.5 shrink-0 text-xs">&#9675;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* ===========================================================
            PRICING — invitation, not checkout
            =========================================================== */}
        <Section background="deep-purple" grain className="!py-32 md:!py-44">
          {/* Atmospheric glow */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 800px 500px at 50% 50%, rgba(241,99,99,0.06) 0%, transparent 70%)",
            }}
          />
          <Container width="narrow" className="relative">
            <ScrollReveal direction="up" className="text-center mb-12 md:mb-16">
              <p className="font-heading text-foreground-subtle text-xs tracking-[0.4em] mb-5">
                THE INVITATION
              </p>
              <h2
                className="font-heading text-off-white leading-[1.02]"
                style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
              >
                READY TO STOP GUESSING?
              </h2>
            </ScrollReveal>

            <ScrollReveal direction="up">
              <div className="relative">
                <Card
                  className="relative p-10 md:p-16 card-shimmer border-rotating border-coral/30 bg-gradient-to-b from-background-elevated/80 via-deep-purple/40 to-background-elevated/80 backdrop-blur-sm"
                  hoverable={false}
                >
                  <div className="text-center mb-12">
                    <p className="font-heading text-coral text-xs tracking-[0.4em] mb-6">
                      THE INNER CIRCLE
                    </p>
                    <div className="flex items-baseline justify-center gap-2 mb-6">
                      <span
                        className="font-heading text-off-white leading-none"
                        style={{ fontSize: "clamp(4rem, 9vw, 7rem)" }}
                      >
                        $475
                      </span>
                      <span className="text-foreground-subtle text-lg md:text-xl tracking-wider">
                        / month
                      </span>
                    </div>
                    <p className="text-foreground-muted max-w-md mx-auto leading-relaxed font-light text-base md:text-lg">
                      Six pillars. One assigned coach. A small cohort that
                      knows your work.
                      <br className="hidden sm:block" />
                      Cancel any time — the work speaks for itself or it
                      doesn&apos;t.
                    </p>
                  </div>

                  {/* Headline benefits — six items, breathing room */}
                  <div className="grid sm:grid-cols-2 gap-x-10 gap-y-4 max-w-xl mx-auto mb-12">
                    {[
                      "All five Not Done Yet pillars",
                      "Performance Health (sixth pillar)",
                      "Cohort of 8–12 with assigned coach",
                      "Daily session & macro feedback",
                      "Weekly cohort tactical call",
                      "Quarterly bloods + performance review",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 text-[15px] text-off-white py-1 font-light"
                      >
                        <span className="text-coral mt-1 shrink-0 text-xs">
                          &#9679;
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <Button
                      href={SKOOL_URL}
                      external
                      size="lg"
                      dataTrack="inner_circle_pricing_apply"
                      className="w-full sm:w-auto"
                    >
                      Apply Through Skool
                    </Button>
                    <p className="text-foreground-subtle text-[11px] md:text-xs mt-6 tracking-[0.2em] uppercase">
                      Limited intake &middot; In a cohort within seven days
                    </p>
                  </div>
                </Card>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* ===========================================================
            FAQ
            =========================================================== */}
        <Section background="charcoal" className="!py-32 md:!py-40">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-16 md:mb-20">
              <p className="font-heading text-foreground-subtle text-xs tracking-[0.4em] mb-6">
                BEFORE YOU APPLY
              </p>
              <h2
                className="font-heading text-off-white leading-[1.02]"
                style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
              >
                THE QUESTIONS
                <br />
                <span className="text-coral">WE GET.</span>
              </h2>
            </ScrollReveal>

            <div className="space-y-4">
              {faqs.map((item, i) => (
                <ScrollReveal key={item.question} direction="up" delay={i * 0.03}>
                  <details className="group rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors overflow-hidden">
                    <summary className="cursor-pointer list-none p-6 md:p-7 flex items-start justify-between gap-6">
                      <h3 className="font-heading text-base md:text-lg text-off-white tracking-wide leading-snug pr-2">
                        {item.question.toUpperCase()}
                      </h3>
                      <span
                        aria-hidden
                        className="text-coral text-2xl leading-none shrink-0 transition-transform group-open:rotate-45 mt-0.5"
                      >
                        +
                      </span>
                    </summary>
                    <div className="px-6 md:px-7 pb-6 md:pb-7 -mt-2">
                      <p className="text-[15px] text-foreground-muted leading-relaxed font-light">
                        {item.answer}
                      </p>
                    </div>
                  </details>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ===========================================================
            FINAL CTA — confident, identity-led
            =========================================================== */}
        <section className="relative bg-coral overflow-hidden py-24 md:py-36">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
              backgroundSize: "256px 256px",
            }}
          />
          <Container className="relative text-center">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white leading-[0.98] mb-8"
                style={{ fontSize: "clamp(2.75rem, 7vw, 6rem)" }}
              >
                YOU KNOW IF
                <br />
                THIS IS YOU.
              </h2>
              <p className="text-off-white/85 max-w-lg mx-auto mb-12 leading-relaxed font-light text-lg md:text-xl">
                You&apos;ve been training around the edges of your potential
                for years. The Inner Circle exists for the rider who&apos;s
                done with edges.
              </p>
              <Link
                href={SKOOL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-[0.15em] uppercase rounded-md transition-all cursor-pointer active:scale-[0.97] active:duration-75 px-10 md:px-12 py-5 text-base md:text-lg bg-off-white text-coral hover:bg-off-white/95 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.35)]"
                style={{ transitionDuration: "var(--duration-fast)" }}
                data-track="inner_circle_footer_apply"
              >
                Apply Through Skool
              </Link>
              <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 mt-8 text-off-white/75 text-xs tracking-[0.25em] uppercase">
                <span>$475/month</span>
                <span aria-hidden>&bull;</span>
                <span>Cohorts of 8&ndash;12</span>
                <span aria-hidden>&bull;</span>
                <span>Limited intake</span>
              </div>
            </ScrollReveal>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  );
}

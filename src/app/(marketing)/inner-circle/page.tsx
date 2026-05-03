import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { ENTITY_IDS } from "@/lib/brand-facts";

const SKOOL_URL = "https://www.skool.com/roadmancycling/about";

export const metadata: Metadata = {
  title: "Roadman Inner Circle — Premium 1:1 Cycling Coaching | $475/month",
  description:
    "The premium 1:1 coaching tier inside Roadman Cycling. Quarterly blood work, weekly 1:1 calls, daily macro monitoring, race-week protocols, and everything in Not Done Yet. $475/month. Limited intake.",
  alternates: {
    canonical: "https://roadmancycling.com/inner-circle",
  },
  openGraph: {
    title: "Roadman Inner Circle — Premium 1:1 Cycling Coaching",
    description:
      "Premium 1:1 cycling coaching with quarterly blood work, weekly calls, and daily macro monitoring. The full Roadman system, dialled to one rider. $475/month.",
    type: "website",
    url: "https://roadmancycling.com/inner-circle",
  },
};

const features = [
  {
    title: "Quarterly blood work analysis",
    body:
      "The bloods pros pay specialists to read — iron, ferritin, Vitamin D, full thyroid, hormones — read against your actual training load. We catch the deficiencies that quietly cost you watts in February so they don't blow up your May.",
  },
  {
    title: "Weekly 1:1 coaching call",
    body:
      "Same time every week, camera on, last week's data on screen. Not a check-in. A working session — what hit, what didn't, what's coming, and what we change before Monday.",
  },
  {
    title: "Daily macro monitoring",
    body:
      "Your fueling stops being a guess. Your coach sees what you ate, how it lined up with the session, and where the gaps were. Race weight without the disordered chaos of MyFitnessPal.",
  },
  {
    title: "1:1 personalised plan reviews",
    body:
      "Every block reviewed line-by-line before it loads. Adjusted for the wedding on Saturday, the head cold last Tuesday, the work trip in week three. No template ever survived contact with your life.",
  },
  {
    title: "Priority async coaching via Skool DM",
    body:
      "Question at 11pm before a 5am ride? Send the DM. You'll have an answer before your alarm goes off. The kind of access usually reserved for athletes the team is paying for.",
  },
  {
    title: "Quarterly performance deep-dives",
    body:
      "Once a quarter we stop, lay everything out, and ask the harder question: are we still going the right direction? Power curves, body comp trends, race results, recovery markers — then re-plan the next twelve weeks from the data, not from inertia.",
  },
  {
    title: "Race & event prep plans",
    body:
      "Marmotte, Étape, Unbound, your local A-race — built backwards from the day. Course-specific intervals, taper, fueling protocol, race-week check-ins. We don't just train you for the event — we prepare you for it.",
  },
  {
    title: "Body composition tracking",
    body:
      "DEXA-quality monitoring without the monthly clinic fees. Skinfolds, bioimpedance, photos against a calibrated background. We track lean mass and fat mass — the two numbers that actually move power-to-weight.",
  },
  {
    title: "Recovery protocol customisation",
    body:
      "Your sleep, your HRV, your stress, your life. A recovery protocol built for the 47-year-old with two kids and a mortgage — not the one written for a 23-year-old in a French training camp.",
  },
  {
    title: "Sleep & HRV review",
    body:
      "Whoop, Garmin, Oura — whatever you wear, we read it weekly. Sleep architecture, autonomic balance, illness flags, training-readiness signal. The stuff that quietly decides whether the work sticks.",
  },
  {
    title: "Early access to new content & tools",
    body:
      "When we test a new training block, build a new tool, or interview the next World Tour coach, you see it first. You're inside the lab — not waiting for the white paper.",
  },
  {
    title: "Everything in Not Done Yet",
    body:
      "TrainingPeaks plans, full S&C programme, weekly community calls, the masterclass library, and the same private group of serious cyclists. The Inner Circle sits on top of NDY — not instead of it.",
  },
];

const comparison = [
  {
    label: "Personalised TrainingPeaks plan",
    ndy: "Yes — built around your week",
    ic: "Yes — adjusted weekly from your data",
  },
  {
    label: "Coaching cadence",
    ndy: "Group coaching call weekly",
    ic: "Dedicated 1:1 call weekly",
  },
  {
    label: "Plan review depth",
    ndy: "Per-block",
    ic: "Per-block, line-by-line, with deep-dive every quarter",
  },
  {
    label: "Async support",
    ndy: "Community Q&A",
    ic: "Priority 1:1 DM, same-day answers",
  },
  {
    label: "Nutrition guidance",
    ndy: "Frameworks, principles, masterclasses",
    ic: "Daily macro monitoring + race-week protocols",
  },
  {
    label: "Strength programme",
    ndy: "Roadman S&C programme",
    ic: "Roadman S&C, periodised against your block",
  },
  {
    label: "Recovery & sleep",
    ndy: "Education + protocols",
    ic: "Weekly review of HRV, sleep, illness flags",
  },
  {
    label: "Blood work analysis",
    ndy: "—",
    ic: "Quarterly read against your training load",
  },
  {
    label: "Body composition tracking",
    ndy: "—",
    ic: "Monthly skinfolds + photo protocol",
  },
  {
    label: "Race & event prep",
    ndy: "Templates + community advice",
    ic: "Bespoke plan, taper, fueling, race-week check-ins",
  },
  {
    label: "Intake",
    ndy: "Open enrolment",
    ic: "Limited — priority for serious applicants",
  },
];

const faqs = [
  {
    question: "Why $475? That's a lot for a Skool community.",
    answer:
      "Because it isn't really a Skool community. The Inner Circle uses Skool as the rail — the comms, the masterclass library, the private group — but the coaching itself is one-to-one. Your coach reads your blood work, monitors your macros daily, reviews your plan weekly, and is on a 1:1 video call with you every seven days. In-person 1:1 cycling coaching usually runs $600–$1,200/month and doesn't include the rest of the Roadman system. The price sits where the value sits, not where Skool sits.",
  },
  {
    question: "Is this really 1:1, or is it group coaching with extras?",
    answer:
      "It's 1:1. You get a dedicated Roadman coach who knows your training history, your race calendar, your physiology, and your life context. The group elements — community, masterclasses, the wider NDY membership — are the bonus, not the core. The coaching relationship is the product.",
  },
  {
    question: "How is this different from Not Done Yet?",
    answer:
      "Not Done Yet is structured group coaching with a personalised training plan inside it. Inner Circle is dedicated 1:1 coaching with the entire NDY system underneath. NDY is the gym membership and the trainer-led classes. Inner Circle is the personal trainer who also gets you membership.",
  },
  {
    question: "I already have a coach. Why switch?",
    answer:
      "You probably shouldn't, if your coach is working. But if you're already paying $300+/month for a plan that doesn't move with your life, doesn't read your bloods, and doesn't tie nutrition, S&C and recovery into the picture — that's the gap the Inner Circle was built to close.",
  },
  {
    question: "What if I need to pause for a few months?",
    answer:
      "Tell us. We pause the membership and hold your spot. Inner Circle is a long-game tier — injury weeks, work trips, bad seasons happen. We plan around them, not in spite of them.",
  },
  {
    question: "How quickly will I see results?",
    answer:
      "Eight weeks for the first measurable changes — sleep quality, recovery markers, sometimes power. Twelve weeks for the kind of progress you'll feel on a climb. A full season for the body composition and FTP changes that show up in race results. Coaching is compound, not instant.",
  },
  {
    question: "Is there a contract?",
    answer:
      "No. Monthly billing inside Skool. Cancel any time. The work speaks for itself or it doesn't.",
  },
  {
    question: "Who actually coaches me?",
    answer:
      "A dedicated Roadman coach matched to your goals and physiology. They sit inside the Roadman system, talk to Anthony weekly about the cohort, and use the same five-pillar methodology built from 1,400+ podcast conversations. You're not coached by a podcast clip and a generic plan — you're coached by a person who knows your name, your numbers, and your race calendar.",
  },
];

export default function InnerCirclePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Roadman Inner Circle — Premium 1:1 Cycling Coaching",
          description:
            "Premium 1:1 cycling coaching tier delivered inside Skool. Quarterly blood work, weekly 1:1 coaching calls, daily macro monitoring, plan reviews, and everything in Not Done Yet.",
          serviceType: "Premium 1:1 Online Cycling Coaching",
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
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-20">
          <Container className="text-center">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-[0.3em] mb-5">
                PREMIUM 1:1 COACHING
              </p>
              <h1
                className="font-heading text-off-white text-gradient-animated mb-4"
                style={{ fontSize: "var(--text-hero)" }}
              >
                ROADMAN
                <br />
                INNER CIRCLE
              </h1>
              <p className="font-heading text-coral tracking-[0.25em] uppercase mt-2 mb-8 text-sm md:text-base">
                One coach. One rider. The full Roadman system.
              </p>
              <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-6 leading-relaxed">
                Most coaching gives you a plan. The Inner Circle gives you a coach
                who knows your blood work, your sleep score, what you ate
                yesterday, and how your legs felt on Tuesday&apos;s climb — then
                builds the week around all of it.
              </p>
              <p className="text-foreground-muted text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                It&apos;s the closest a working professional gets to riding like a
                pro — without the genetics, the team car, or quitting your job to
                do it.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <Button
                  href={SKOOL_URL}
                  external
                  size="lg"
                  dataTrack="inner_circle_hero_apply"
                >
                  Apply Through Skool
                </Button>
                <Button href="#whats-inside" variant="ghost" size="lg">
                  See What&apos;s Inside
                </Button>
              </div>

              <p className="text-foreground-subtle text-sm tracking-wider">
                $475/month &middot; Delivered inside Skool &middot; Limited intake
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* Transformation promise */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-10">
              <p className="text-coral font-heading text-xs tracking-[0.3em] mb-4">
                WHAT THIS BUYS YOU
              </p>
              <h2
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-section)" }}
              >
                NOT A PLAN.
                <br />
                <span className="text-coral">A SECOND BRAIN FOR YOUR CYCLING.</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal direction="up">
              <div className="space-y-6 text-foreground-muted text-lg leading-relaxed">
                <p>
                  You&apos;ve already done the work. You read the books. You did
                  the FTP tests. You crunched the numbers on TrainingPeaks. And
                  you&apos;ve gone as far as that takes you.
                </p>
                <p>
                  The Inner Circle is for the cyclist who wants what every World
                  Tour rider has — a coach who watches the data daily, sees the
                  patterns you can&apos;t, and adjusts before you break. The kind
                  of coaching that catches the iron deficiency in February so you
                  don&apos;t blow up in May. The kind that re-writes a climbing
                  block when your fueling logs say it&apos;s the meal before, not
                  the threshold work, that&apos;s breaking you.
                </p>
                <p className="text-off-white font-medium">
                  Same five pillars as Not Done Yet. Tighter loop. Higher
                  resolution. One coach watching one rider.
                </p>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* Feature breakdown */}
        <Section background="deep-purple" grain id="whats-inside">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-14">
              <p className="text-coral font-heading text-xs tracking-[0.3em] mb-4">
                WHAT&apos;S IN THE INNER CIRCLE
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                EVERY LEVER A PRO HAS.
                <br />
                BUILT FOR A WORKING CYCLIST.
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Twelve things, each one chosen because it changes outcomes. No
                fluff. No padding for the price tag.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {features.map((f, i) => (
                <ScrollReveal key={f.title} direction="up" delay={(i % 6) * 0.06}>
                  <Card className="p-6 card-shimmer h-full" glass hoverable={false}>
                    <div className="flex items-start gap-3 mb-3">
                      <span className="font-heading text-coral text-sm tracking-widest pt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-heading text-lg text-off-white tracking-wide leading-tight">
                        {f.title.toUpperCase()}
                      </h3>
                    </div>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {f.body}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* NDY vs Inner Circle */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-[0.3em] mb-4">
                NDY VS INNER CIRCLE
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                SAME PHILOSOPHY.
                <br />
                <span className="text-coral">DIFFERENT INTENSITY.</span>
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Both run on the same five-pillar system. The difference is how
                close the coach is — and how much of your data they&apos;re
                reading.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up">
              <div className="max-w-5xl mx-auto rounded-xl border border-white/10 bg-background-elevated overflow-hidden">
                {/* Header row */}
                <div className="grid grid-cols-3 border-b border-white/10 bg-deep-purple/30">
                  <div className="p-4 md:p-6">
                    <p className="font-heading text-foreground-subtle text-xs tracking-widest">
                      FEATURE
                    </p>
                  </div>
                  <div className="p-4 md:p-6 border-l border-white/10">
                    <p className="font-heading text-off-white text-base md:text-lg tracking-wider">
                      NOT DONE YET
                    </p>
                    <p className="text-xs text-foreground-subtle mt-1">$195/mo</p>
                  </div>
                  <div className="p-4 md:p-6 border-l border-white/10 bg-coral/10">
                    <p className="font-heading text-coral text-base md:text-lg tracking-wider">
                      INNER CIRCLE
                    </p>
                    <p className="text-xs text-foreground-subtle mt-1">$475/mo</p>
                  </div>
                </div>

                {/* Rows */}
                {comparison.map((row, i) => (
                  <div
                    key={row.label}
                    className={`grid grid-cols-3 ${
                      i % 2 === 0 ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <div className="p-4 md:p-5 text-sm text-off-white font-medium">
                      {row.label}
                    </div>
                    <div className="p-4 md:p-5 border-l border-white/10 text-sm text-foreground-muted leading-snug">
                      {row.ndy}
                    </div>
                    <div className="p-4 md:p-5 border-l border-white/10 text-sm text-off-white leading-snug bg-coral/[0.04]">
                      {row.ic}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-center text-foreground-subtle text-xs mt-6">
                Already in Not Done Yet?{" "}
                <Link
                  href="/community/not-done-yet"
                  className="text-coral hover:text-coral-hover underline-offset-2 hover:underline"
                >
                  Members upgrade through Skool — same checkout.
                </Link>
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* Who it's for */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-[0.3em] mb-4">
                WHO IT&apos;S FOR
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                IS THE INNER CIRCLE FOR YOU?
              </h2>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-6">
              <ScrollReveal direction="left">
                <Card className="p-7 h-full border-l-2 border-l-coral" hoverable={false}>
                  <h3 className="font-heading text-lg text-coral mb-5 tracking-wider">
                    YES, IF YOU&hellip;
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Train 8+ hours a week and want every one of them to count",
                      "Have a target — a category jump, a Grand Fondo PB, an Ironman bike split",
                      "Hit a level where free advice and group plans stopped moving the needle",
                      "Will actually do the work — this is a system, not a status symbol",
                      "Want a coach who knows your name, your numbers, and your race calendar",
                      "Are ready to share your data honestly so it can be coached against",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-foreground-muted leading-relaxed"
                      >
                        <span className="text-coral mt-0.5 shrink-0">&#10003;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>

              <ScrollReveal direction="right">
                <Card className="p-7 h-full border-l-2 border-l-foreground-subtle" hoverable={false}>
                  <h3 className="font-heading text-lg text-foreground-subtle mb-5 tracking-wider">
                    NOT IF YOU&hellip;
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Are starting out — the free Clubhouse and NDY are better fits",
                      "Want a plug-and-play plan with no input expected from you",
                      "Aren't ready to share honest data — coaching needs the truth",
                      "Already have a coach you trust who's still moving you forward",
                      "Want a status badge — this is a working tier, not a vanity one",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-foreground-muted leading-relaxed"
                      >
                        <span className="text-foreground-subtle mt-0.5 shrink-0">&times;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* Pricing card */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-coral text-off-white text-xs font-heading tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap shadow-[var(--shadow-glow-coral)]">
                    LIMITED INTAKE
                  </span>
                </div>
                <Card
                  className="p-8 md:p-12 card-shimmer border-rotating border-coral/40 bg-gradient-to-b from-background-elevated via-deep-purple/30 to-background-elevated pt-12 md:pt-14"
                  hoverable={false}
                >
                  <div className="text-center mb-8">
                    <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                      THE INNER CIRCLE
                    </p>
                    <div className="flex items-baseline justify-center gap-1 mb-3">
                      <span className="font-heading text-coral" style={{ fontSize: "clamp(3rem, 7vw, 5rem)" }}>
                        $475
                      </span>
                      <span className="text-foreground-subtle text-lg">/month</span>
                    </div>
                    <p className="text-foreground-muted max-w-md mx-auto leading-relaxed">
                      One tier. One price. One dedicated coach. Cancel any time —
                      the work speaks for itself or it doesn&apos;t.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 max-w-xl mx-auto mb-10">
                    {[
                      "Quarterly blood work analysis",
                      "Weekly 1:1 coaching call",
                      "Daily macro monitoring",
                      "1:1 plan reviews, every block",
                      "Priority Skool DM access",
                      "Race & event prep plans",
                      "Body composition tracking",
                      "Sleep & HRV review",
                      "Recovery protocol customisation",
                      "Quarterly performance deep-dives",
                      "Early access to new tools",
                      "Everything in Not Done Yet",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-2 text-sm text-foreground-muted py-1"
                      >
                        <span className="text-coral mt-0.5 shrink-0">&#10003;</span>
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
                    <p className="text-foreground-subtle text-xs mt-4 tracking-wider">
                      Pay your first month inside Skool. A Roadman coach is in
                      your DMs within 24 hours.
                    </p>
                  </div>
                </Card>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* FAQ */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE QUESTIONS WE GET
              </h2>
              <p className="text-foreground-muted">
                The honest answers — same as you&apos;d get on a call.
              </p>
            </ScrollReveal>

            <div className="space-y-4">
              {faqs.map((item, i) => (
                <ScrollReveal key={item.question} direction="up" delay={i * 0.04}>
                  <Card className="p-6" hoverable={false}>
                    <h3 className="font-heading text-lg text-off-white mb-3 tracking-wide">
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

        {/* Final CTA */}
        <Section background="coral" className="!py-16 md:!py-24">
          <Container className="text-center">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              YOU KNOW IF THIS IS YOU.
            </h2>
            <p className="text-off-white/80 max-w-lg mx-auto mb-8 leading-relaxed">
              You&apos;ve been training around the edges of your potential for
              years. The Inner Circle exists for the rider who&apos;s done with
              edges.
            </p>
            <Link
              href={SKOOL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md transition-all cursor-pointer active:scale-[0.97] active:duration-75 px-8 md:px-10 py-4 text-lg bg-off-white text-coral hover:bg-off-white/90 shadow-lg"
              style={{ transitionDuration: "var(--duration-fast)" }}
              data-track="inner_circle_footer_apply"
            >
              Join The Inner Circle
            </Link>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 text-off-white/70 text-sm">
              <span>$475/month</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>Cancel any time</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>Limited intake</span>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

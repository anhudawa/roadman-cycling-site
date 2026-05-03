import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { ENTITY_IDS } from "@/lib/brand-facts";

const APPLY_URL = "https://www.skool.com/roadmancycling/about";

export const metadata: Metadata = {
  title:
    "Roadman Inner Circle — Premium 1:1 Cycling Coaching | $525/month",
  description:
    "The five Roadman pillars — training, nutrition, recovery, strength, community — levelled up with daily coach feedback. Plus a sixth pillar nobody else gives you: Performance Health. $525/month. Limited intake.",
  alternates: {
    canonical: "https://roadmancycling.com/inner-circle",
  },
  openGraph: {
    title: "Roadman Inner Circle — Premium 1:1 Cycling Coaching",
    description:
      "Everything Not Done Yet gives you, with a coach reading your data daily. Plus Performance Health: bloods, biomarkers, hormones, inflammation. $525/month.",
    type: "website",
    url: "https://roadmancycling.com/inner-circle",
  },
};

const pillars = [
  {
    number: "01",
    name: "Training",
    ndy: "A personalised TrainingPeaks plan, built around your week.",
    ic: "Personalised, adjusted daily as your schedule changes. Your coach reviews every session and gives feedback the same day.",
  },
  {
    number: "02",
    name: "Nutrition",
    ndy: "Fuelling frameworks and race-weight protocols.",
    ic: "Daily monitoring of your macros. Your coach sees what you ate, how it lined up with training, and writes back when it's drifting.",
  },
  {
    number: "03",
    name: "Recovery",
    ndy: "Recovery education — sleep, HRV, stress protocols.",
    ic: "Your coach reviews your sleep, HRV trends, and life stress weekly. Recovery protocols that move with you.",
  },
  {
    number: "04",
    name: "Strength & Conditioning",
    ndy: "The Roadman S&C roadmap.",
    ic: "Periodised S&C tuned to your race calendar, injury history, and training load.",
  },
  {
    number: "05",
    name: "Community",
    ndy: "Live calls, masterclasses, the room of serious cyclists.",
    ic: "Weekly tactical review call. Pre-event strategy sessions for your target races.",
  },
];

const performanceHealth = [
  {
    label: "01",
    title: "Quarterly blood work analysis",
    body: "Iron, ferritin, full thyroid, Vitamin D, electrolytes — read against your training load, not in isolation. Catches the deficiencies that quietly cost you watts in February so they don't blow up your May.",
  },
  {
    label: "02",
    title: "Biomarker trends across seasons",
    body: "Not a single snapshot. A trend. Each quarter joins the last until we can see the slow drift coming and head it off before it becomes the spring you spent off the bike.",
  },
  {
    label: "03",
    title: "Hormone panels",
    body: "Testosterone, cortisol, DHEA, free T3. The markers most coaches don't read and most cyclists never check. The ones that explain why training stopped working before any plan tweak ever could.",
  },
  {
    label: "04",
    title: "Inflammation monitoring",
    body: "hs-CRP, ferritin in context, post-event recovery markers. The signal that tells us when the body is telling you to back off — long before the leg-feel does.",
  },
  {
    label: "05",
    title: "Proactive screening guidance",
    body: "Heart screening for masters athletes, bone density, the right conversations to have with your GP. Cycling past 50 is a long-game sport. We treat it like one.",
  },
];

const triedBefore = [
  {
    title: "Training apps",
    sub: "TrainerRoad, Zwift, Wahoo SYSTM",
    body: "Delivers workouts. Doesn't watch you do them. The plan never adjusts when your sleep tanks, when work blows up, or when your knee has been niggling since Tuesday. You're still the coach — the app is just a calendar.",
  },
  {
    title: "Free YouTube and podcast plans",
    sub: "Including ours, frankly",
    body: "Brilliant information. Zero accountability. Nobody reads your training. Nobody flags the week you under-fuelled. Nobody connects what your bloods say to why your power dropped in March.",
  },
  {
    title: "A part-time coach",
    sub: "$200–300 / month",
    body: "Was probably a decent racer once. Works full-time elsewhere. Writes your plan on a Sunday night, checks your data once a fortnight if you're lucky. Good at training plans. Doesn't integrate nutrition, strength, recovery, or bloods. Doesn't have the knowledge that comes from interviewing World Tour coaches and sports scientists every week.",
  },
  {
    title: "Riding more with the lads",
    sub: "Still the most common plan",
    body: "Well-meant, occasionally fun. Not coaching. Your mates aren't reading your HRV. They're doing their own training while you're doing theirs. Two riders on the same plan get different results — and nobody's watching to spot the gap.",
  },
];

const howItWorks = [
  {
    title: "Daily session review",
    body: "Anthony and the Roadman coaching team read every ride you log. Quick written feedback the same day — what landed, what to change before the next session, what the data is actually saying.",
  },
  {
    title: "Weekly written check-in",
    body: "You submit your week — training, sleep, life context, anything affecting the plan. Your coach replies inside 24 hours with the next week mapped against how the last one actually went.",
  },
  {
    title: "Monthly 45-minute video deep-dive",
    body: "Once a month, on video. The previous month reviewed in full — power curves, body composition, fuelling, recovery markers. The next month built block by block from what the data is telling us.",
  },
  {
    title: "Quarterly bloods + performance review",
    body: "The premium touchpoint. Bloods, biomarkers, body comp, FTP and race results read together — then the next twelve weeks re-planned from the data, not from inertia.",
  },
];

const yesIf = [
  "Have been training consistently for 1–2+ years and stopped improving",
  "Train 8+ hours a week and want every one of them to count",
  "Are over 40 and want to ride strong for decades, not one more season",
  "Have a target — a category jump, a Grand Fondo PB, an Ironman bike split",
  "Will share your data honestly so it can be coached against",
  "Want a coach who reads your work every day, not every fortnight",
];

const notIf = [
  "Are starting out — the free Clubhouse and Not Done Yet are better fits",
  "Want a plug-and-play plan with no input expected from you",
  "Aren't ready to share honest data — coaching needs the truth",
  "Already have a coach you trust who's still moving you forward",
  "Want a status badge — this is a working tier, not a vanity one",
];

const comparisonRows: Array<{
  feature: string;
  ndy: string;
  ic: string;
  highlight?: boolean;
}> = [
  { feature: "Personalised TrainingPeaks plan", ndy: "Yes", ic: "Yes" },
  { feature: "Nutrition frameworks and protocols", ndy: "Yes", ic: "Yes" },
  { feature: "Recovery education", ndy: "Yes", ic: "Yes" },
  { feature: "Strength & Conditioning roadmap", ndy: "Yes", ic: "Yes" },
  { feature: "Live masterclasses", ndy: "Yes", ic: "Yes" },
  {
    feature: "Daily session review and feedback",
    ndy: "—",
    ic: "Same-day, every day",
  },
  {
    feature: "Daily macro and fuelling check",
    ndy: "—",
    ic: "Reviewed daily, written feedback when drifting",
  },
  {
    feature: "Weekly written check-in",
    ndy: "—",
    ic: "24-hour reply, plan adjusted weekly",
  },
  {
    feature: "Monthly video deep-dive",
    ndy: "—",
    ic: "45 minutes, on video",
  },
  {
    feature: "Pre-event race strategy",
    ndy: "—",
    ic: "Tactical review before each target event",
  },
  {
    feature: "Quarterly blood work analysis",
    ndy: "—",
    ic: "Iron, thyroid, hormones, inflammation",
    highlight: true,
  },
  {
    feature: "Biomarker trends across seasons",
    ndy: "—",
    ic: "Tracked quarter by quarter",
    highlight: true,
  },
  {
    feature: "Proactive screening guidance",
    ndy: "—",
    ic: "Heart, bone density, masters protocols",
    highlight: true,
  },
  { feature: "Price", ndy: "$95 / month", ic: "$525 / month" },
];

const faqs = [
  {
    question: "How is this different from Not Done Yet?",
    answer:
      "Same five pillars. Levelled up. Not Done Yet gives you the system, the plan, and the room. Inner Circle puts a coach inside it who reads your data every day and writes back when it matters — and adds a sixth pillar that NDY doesn't have at all: Performance Health. Bloods, biomarkers, hormones, inflammation, proactive screening. The pillar nobody else offers.",
  },
  {
    question: "Who actually coaches me?",
    answer:
      "Anthony and the Roadman coaching team. The same methodology Anthony has built from 1,400+ podcast conversations with World Tour coaches and sports scientists — Seiler, Lorang, Wakefield, Kerrison, Friel — applied to your data, your week, your races. You're coached by people who know your name, your numbers, and your race calendar.",
  },
  {
    question: "Why $525 a month?",
    answer:
      "Because of what's inside it. Daily session review, weekly written check-in, monthly video deep-dive, quarterly bloods. In-person 1:1 cycling coaching at this depth typically runs $700–$1,400 per month and stops at the bike. Quarterly blood work and biomarker tracking on its own runs $400+ per year. The price sits where the value sits.",
  },
  {
    question: "How is daily feedback actually delivered?",
    answer:
      "You log your sessions, sleep, and macros each day. Your coach reviews them and writes back the same day — short, sharp, specific. What worked, what to change before tomorrow, what the data is actually saying. No waiting two weeks for a check-in to flag something that needed fixing on Tuesday.",
  },
  {
    question: "I'm over 50. Is the Performance Health pillar useful for me?",
    answer:
      "It's the reason this pillar exists. The cyclists who get most out of it are masters athletes who want to ride hard for the next twenty years, not just the next twelve months. We track the markers your GP isn't watching for and a regular cycling coach has no business reading. The work pays back over years, not weeks.",
  },
  {
    question: "I already have a coach. Why switch?",
    answer:
      "You probably shouldn't if your coach is working. But if you're paying $300+ a month for a plan that doesn't move with your life, doesn't read your bloods, and doesn't tie nutrition, S&C and recovery into the picture — that's the gap the Inner Circle was built to close.",
  },
  {
    question: "What if I need to pause for a few months?",
    answer:
      "Tell us. We pause the membership and your spot is held. Inner Circle is a long-game tier — injuries, work trips, bad seasons happen. We plan around them, not in spite of them.",
  },
  {
    question: "How quickly will I see results?",
    answer:
      "Eight weeks for the first measurable changes — sleep quality, recovery markers, sometimes power. Twelve weeks for the kind of progress you'll feel on a climb. A full season for the body composition, FTP and biomarker shifts that show up in race results. Coaching is compound, not instant.",
  },
  {
    question: "Is there a contract?",
    answer:
      "No. Monthly billing. Cancel any time. The work speaks for itself or it doesn't.",
  },
  {
    question: "What happens after I apply?",
    answer:
      "Within 24 hours you get an onboarding questionnaire — training history, recent bloods if you have them, goals, calendar, life context. Within seven days you're set up on TrainingPeaks, your first plan is live, and the daily session review starts.",
  },
];

export default function InnerCirclePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Roadman Inner Circle — Premium Cycling Coaching",
          description:
            "Premium cycling coaching across six pillars — training, nutrition, recovery, strength, community, and Performance Health (blood work, biomarkers, hormones, inflammation, proactive screening). Daily session review, weekly written check-in, monthly video deep-dive, quarterly bloods.",
          serviceType: "Premium Online Cycling Coaching",
          provider: { "@id": ENTITY_IDS.organization },
          brand: { "@id": ENTITY_IDS.organization },
          offers: {
            "@type": "Offer",
            name: "Roadman Inner Circle",
            price: "525",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: APPLY_URL,
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "525",
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
            HERO — problem-first, generous space, restrained coral
            =========================================================== */}
        <Section
          background="deep-purple"
          grain
          className="!pt-40 !pb-32 md:!pt-48 md:!pb-44"
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 1000px 700px at 50% 25%, rgba(76,18,115,0.55) 0%, transparent 60%), radial-gradient(ellipse 600px 400px at 85% 90%, rgba(241,99,99,0.08) 0%, transparent 70%)",
            }}
          />
          <Container className="relative text-center">
            <ScrollReveal direction="up" eager>
              <p className="font-heading text-foreground-subtle text-xs md:text-sm tracking-[0.4em] mb-8">
                THE ROADMAN INNER CIRCLE
              </p>
              <h1
                className="font-heading text-off-white mb-10 text-gradient-animated leading-[0.95]"
                style={{ fontSize: "clamp(3.25rem, 9vw, 9rem)" }}
              >
                YOU&apos;RE NOT
                <br />
                UNDER&#8209;TRAINED.
              </h1>
              <p
                className="font-heading text-coral mb-14 leading-tight"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", letterSpacing: "0.02em" }}
              >
                YOU&apos;RE OVER&#8209;GUESSED.
              </p>

              <p
                className="text-foreground-muted mx-auto mb-10 leading-relaxed font-light"
                style={{ fontSize: "clamp(1.0625rem, 1.4vw, 1.25rem)", maxWidth: "640px" }}
              >
                You read the books. You did the FTP tests. You bought the
                power meter, the carbon shoes, the ceramic bearings. You
                ride more hours than half the lads you can&apos;t drop.
                And the watts haven&apos;t moved in a year.
              </p>
              <p
                className="text-off-white mx-auto mb-16 leading-relaxed font-light"
                style={{ fontSize: "clamp(1.125rem, 1.5vw, 1.375rem)", maxWidth: "620px" }}
              >
                The Inner Circle is what happens when one coach reads your
                data every day, replies on the days it matters, and pulls
                a sixth pillar in that no app, plan, or part-time coach
                can give you.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
                <Button
                  href={APPLY_URL}
                  external
                  size="lg"
                  dataTrack="inner_circle_hero_apply"
                >
                  Apply for Inner Circle
                </Button>
                <Button href="#pillars" variant="ghost" size="lg">
                  See The Six Pillars
                </Button>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-foreground-subtle text-xs md:text-sm tracking-[0.2em] uppercase">
                <span>$525 / month</span>
                <span aria-hidden className="text-coral/40">&bull;</span>
                <span>Limited intake</span>
                <span aria-hidden className="text-coral/40">&bull;</span>
                <span>Cancel any time</span>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* ===========================================================
            PILLARS INTRO — five plus one
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
                LEVELLED UP.
                <br />
                <span className="text-coral">PLUS ONE MORE.</span>
              </h2>
              <div
                className="space-y-6 text-foreground-muted leading-relaxed font-light max-w-[640px] mx-auto"
                style={{ fontSize: "clamp(1.0625rem, 1.4vw, 1.25rem)" }}
              >
                <p>
                  You already know the five pillars from Not Done Yet —
                  training, nutrition, recovery, strength, community.
                  They&apos;re what separates riders who keep getting
                  faster from riders who hit a ceiling at thirty.
                </p>
                <p className="text-off-white">
                  Inner Circle takes every one of those pillars and adds
                  a coach reading your data every day. Then adds a sixth
                  pillar that no app, podcast, or part-time coach can
                  give you.
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
                        ? "bg-coral/10 text-coral border-coral/40 shadow-[0_0_20px_rgba(241,99,99,0.18)]"
                        : "bg-white/[0.03] text-foreground-muted border-white/10"
                    }`}
                  >
                    {p.label.toUpperCase()}
                  </span>
                ))}
              </div>
              <p className="text-foreground-subtle text-[10px] md:text-xs mt-5 tracking-[0.25em]">
                FIVE FROM NOT DONE YET{" "}
                <span className="text-coral/70">
                  &middot; ONE EXCLUSIVE TO THE INNER CIRCLE
                </span>
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* ===========================================================
            FIVE PILLARS — NDY vs IC, cinematic cards
            =========================================================== */}
        <Section
          background="deep-purple"
          grain
          id="pillars"
          className="!py-32 md:!py-40"
        >
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
                <span className="text-coral">A COACH INSIDE THEM.</span>
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto leading-relaxed font-light text-lg">
                Everything Not Done Yet gives you. Plus a coach watching,
                reading, replying, and adjusting against your data — every
                single day.
              </p>
            </ScrollReveal>

            <div className="max-w-5xl mx-auto space-y-8 md:space-y-10">
              {pillars.map((p, i) => (
                <ScrollReveal key={p.name} direction="up" delay={i * 0.05}>
                  <div className="relative group">
                    <span
                      aria-hidden
                      className="absolute -top-6 -left-2 md:-top-8 md:-left-6 font-heading text-white/[0.04] select-none pointer-events-none leading-none"
                      style={{ fontSize: "clamp(7rem, 12vw, 11rem)" }}
                    >
                      {p.number}
                    </span>

                    <Card
                      className="relative p-8 md:p-12 card-shimmer"
                      glass
                      hoverable={false}
                    >
                      <div className="flex items-baseline gap-5 mb-8">
                        <span className="font-heading text-coral/70 text-sm md:text-base tracking-[0.3em]">
                          {p.number}
                        </span>
                        <h3
                          className="font-heading text-off-white tracking-wide leading-none"
                          style={{ fontSize: "clamp(1.625rem, 3vw, 2.5rem)" }}
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
                            INNER CIRCLE
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
            SIXTH PILLAR — Performance Health (priority placement)
            =========================================================== */}
        <section
          id="performance-health"
          className="relative overflow-hidden bg-gradient-to-b from-deep-purple via-[#1a0535] to-charcoal py-32 md:py-48"
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none grain-overlay"
            style={{
              background:
                "radial-gradient(ellipse 1100px 700px at 50% 0%, rgba(241,99,99,0.10) 0%, transparent 60%), radial-gradient(ellipse 800px 500px at 50% 100%, rgba(76,18,115,0.45) 0%, transparent 70%)",
            }}
          />

          <span
            aria-hidden
            className="absolute -top-8 left-1/2 -translate-x-1/2 font-heading text-white/[0.025] select-none pointer-events-none leading-none"
            style={{ fontSize: "clamp(15rem, 32vw, 32rem)" }}
          >
            06
          </span>

          <Container className="relative">
            <ScrollReveal
              direction="up"
              className="text-center mb-20 md:mb-24 max-w-3xl mx-auto"
            >
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
                  trends across seasons, hormone panels, inflammation
                  markers, and proactive screening guidance for the
                  things that quietly decide whether you&apos;re still
                  riding hard at sixty.
                </p>
                <p className="text-off-white">
                  The pillar a training app can&apos;t see, your GP
                  isn&apos;t watching for, and a regular cycling coach
                  has no business reading. Built so masters athletes can
                  ride strong for decades — not just one more season.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {performanceHealth.map((item, i) => (
                <ScrollReveal
                  key={item.title}
                  direction="up"
                  delay={(i % 3) * 0.08}
                >
                  <Card
                    className="relative p-8 h-full card-shimmer overflow-hidden"
                    glass
                    hoverable={false}
                  >
                    <div
                      aria-hidden
                      className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-coral/60 to-transparent"
                    />
                    <span className="font-heading text-coral/50 text-sm tracking-[0.3em] mb-4 block">
                      {item.label}
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

            <ScrollReveal
              direction="up"
              className="mt-16 md:mt-20 max-w-2xl mx-auto text-center"
            >
              <p className="text-foreground-muted text-base md:text-lg leading-relaxed italic font-light">
                The pros stay in the sport for decades because someone
                watches the things you can&apos;t see from the saddle.
                Performance Health is built around that idea.
              </p>
            </ScrollReveal>
          </Container>
        </section>

        <div className="gradient-divider" />

        {/* ===========================================================
            WHAT YOU&apos;VE TRIED — honest comparison
            =========================================================== */}
        <Section background="charcoal" className="!py-32 md:!py-40">
          <Container>
            <ScrollReveal
              direction="up"
              className="text-center mb-16 md:mb-20 max-w-3xl mx-auto"
            >
              <p className="font-heading text-foreground-subtle text-xs tracking-[0.4em] mb-6">
                WHAT YOU&apos;VE PROBABLY TRIED
              </p>
              <h2
                className="font-heading text-off-white mb-8 leading-[1.02]"
                style={{ fontSize: "clamp(2.25rem, 5.5vw, 4.5rem)" }}
              >
                THE FOUR THINGS
                <br />
                <span className="text-coral">THAT GET CYCLISTS STUCK.</span>
              </h2>
              <p className="text-foreground-muted leading-relaxed font-light text-lg">
                None of these are bad. They just leave gaps. The Inner
                Circle was built for the rider who&apos;s ridden every one
                of these and is honest about why they hit a ceiling.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
              {triedBefore.map((item, i) => (
                <ScrollReveal key={item.title} direction="up" delay={i * 0.06}>
                  <div className="relative h-full p-8 md:p-10 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors backdrop-blur-sm">
                    <div className="flex items-baseline gap-4 mb-5">
                      <span className="font-heading text-coral/50 text-sm tracking-[0.3em]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="font-heading text-off-white text-xl md:text-2xl tracking-wide leading-tight">
                          {item.title.toUpperCase()}
                        </h3>
                        <p className="font-heading text-foreground-subtle text-[10px] md:text-xs tracking-[0.25em] mt-1.5">
                          {item.sub.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <p className="text-[15px] text-foreground-muted leading-relaxed font-light">
                      {item.body}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* ===========================================================
            HOW IT&apos;S DELIVERED
            =========================================================== */}
        <Section
          background="deep-purple"
          grain
          id="how-it-works"
          className="!py-32 md:!py-40"
        >
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-16 md:mb-20">
              <p className="font-heading text-foreground-subtle text-xs tracking-[0.4em] mb-6">
                HOW IT&apos;S DELIVERED
              </p>
              <h2
                className="font-heading text-off-white mb-8 leading-[1.02]"
                style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
              >
                ANTHONY AND THE
                <br />
                ROADMAN COACHING TEAM.
                <br />
                <span className="text-coral">EVERY DAY.</span>
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto leading-relaxed font-light text-lg">
                Daily contact when it matters. Deeper sessions when
                they&apos;re needed. Built so a working cyclist gets
                premium coaching attention without burning the coach or
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
            COMPARISON TABLE — NDY vs Inner Circle
            =========================================================== */}
        <Section background="charcoal" className="!py-32 md:!py-40">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-14 md:mb-16">
              <p className="font-heading text-foreground-subtle text-xs tracking-[0.4em] mb-6">
                NOT DONE YET vs INNER CIRCLE
              </p>
              <h2
                className="font-heading text-off-white leading-[1.02]"
                style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
              >
                WHAT&apos;S IN
                <br />
                <span className="text-coral">EACH TIER.</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal
              direction="up"
              className="max-w-5xl mx-auto rounded-xl overflow-hidden bg-white/[0.02] border border-white/5 backdrop-blur-sm"
            >
              {/* Desktop / tablet header */}
              <div className="hidden sm:grid grid-cols-[1.4fr_1fr_1.2fr] gap-6 px-6 md:px-10 py-5 border-b border-white/10 bg-white/[0.015]">
                <span className="font-heading text-foreground-subtle text-xs tracking-[0.3em]">
                  WHAT YOU GET
                </span>
                <span className="font-heading text-foreground-subtle text-xs tracking-[0.3em]">
                  NOT DONE YET
                </span>
                <span className="font-heading text-coral text-xs tracking-[0.3em]">
                  INNER CIRCLE
                </span>
              </div>

              <div className="divide-y divide-white/5">
                {comparisonRows.map((row) => (
                  <div
                    key={row.feature}
                    className={`grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_1.2fr] gap-2 sm:gap-6 px-6 md:px-10 py-5 ${
                      row.highlight
                        ? "bg-coral/[0.04]"
                        : "hover:bg-white/[0.015] transition-colors"
                    }`}
                  >
                    <div className="text-off-white text-[15px] md:text-base font-light">
                      {row.feature}
                      {row.highlight && (
                        <span className="ml-2 inline-block font-heading text-coral text-[9px] tracking-[0.25em] align-middle">
                          &middot; SIXTH PILLAR
                        </span>
                      )}
                    </div>
                    <div className="text-[14px] md:text-[15px] text-foreground-muted font-light">
                      <span className="sm:hidden font-heading text-foreground-subtle text-[10px] tracking-[0.3em] mr-2">
                        NDY:
                      </span>
                      {row.ndy}
                    </div>
                    <div
                      className={`text-[14px] md:text-[15px] font-light ${
                        row.highlight ? "text-coral" : "text-off-white"
                      }`}
                    >
                      <span className="sm:hidden font-heading text-coral text-[10px] tracking-[0.3em] mr-2">
                        IC:
                      </span>
                      {row.ic}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* ===========================================================
            WHO IT&apos;S FOR
            =========================================================== */}
        <Section
          background="deep-purple"
          grain
          className="!py-32 md:!py-40"
        >
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
                    {yesIf.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-[15px] text-foreground-muted leading-relaxed font-light"
                      >
                        <span className="text-coral mt-1.5 shrink-0 text-xs">
                          &#9679;
                        </span>
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
                    {notIf.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-[15px] text-foreground-muted leading-relaxed font-light"
                      >
                        <span className="text-foreground-subtle mt-1.5 shrink-0 text-xs">
                          &#9675;
                        </span>
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
            PRICING — invitation
            =========================================================== */}
        <Section background="charcoal" className="!py-32 md:!py-44">
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
                        $525
                      </span>
                      <span className="text-foreground-subtle text-lg md:text-xl tracking-wider">
                        / month
                      </span>
                    </div>
                    <p className="text-foreground-muted max-w-md mx-auto leading-relaxed font-light text-base md:text-lg">
                      Six pillars. Daily coaching feedback. Quarterly
                      bloods.
                      <br className="hidden sm:block" />
                      Cancel any time — the work speaks for itself or it
                      doesn&apos;t.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-10 gap-y-4 max-w-xl mx-auto mb-12">
                    {[
                      "All five Not Done Yet pillars",
                      "Performance Health (sixth pillar)",
                      "Daily session and macro feedback",
                      "Weekly written check-in, 24-hour reply",
                      "Monthly 45-minute video deep-dive",
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
                      href={APPLY_URL}
                      external
                      size="lg"
                      dataTrack="inner_circle_pricing_apply"
                      className="w-full sm:w-auto"
                    >
                      Apply for Inner Circle
                    </Button>
                    <p className="text-foreground-subtle text-[11px] md:text-xs mt-6 tracking-[0.2em] uppercase">
                      Limited intake &middot; Onboarded inside seven days
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
        <Section
          background="deep-purple"
          grain
          className="!py-32 md:!py-40"
        >
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
                <ScrollReveal
                  key={item.question}
                  direction="up"
                  delay={i * 0.03}
                >
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
                You&apos;ve been training around the edges of your
                potential for years. The Inner Circle exists for the
                rider who&apos;s done with edges.
              </p>
              <Link
                href={APPLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-[0.15em] uppercase rounded-md transition-all cursor-pointer active:scale-[0.97] active:duration-75 px-10 md:px-12 py-5 text-base md:text-lg bg-off-white text-coral hover:bg-off-white/95 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.35)]"
                style={{ transitionDuration: "var(--duration-fast)" }}
                data-track="inner_circle_footer_apply"
              >
                Apply for Inner Circle
              </Link>
              <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 mt-8 text-off-white/75 text-xs tracking-[0.25em] uppercase">
                <span>$525 / month</span>
                <span aria-hidden>&bull;</span>
                <span>Limited intake</span>
                <span aria-hidden>&bull;</span>
                <span>Cancel any time</span>
              </div>
            </ScrollReveal>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  );
}

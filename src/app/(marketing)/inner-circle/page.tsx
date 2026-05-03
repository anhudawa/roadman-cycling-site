import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { ENTITY_IDS } from "@/lib/brand-facts";

const SKOOL_URL = "https://www.skool.com/roadmancycling/about";

export const metadata: Metadata = {
  title: "Roadman Inner Circle — Premium Cohort Coaching | $475/month",
  description:
    "Premium cohort coaching for cyclists who've stopped improving. Small cohorts of 8-12 riders, an assigned Roadman coach, daily log review, monthly 1:1 deep-dives, and quarterly blood work. The full Roadman system, dialled in. $475/month. Limited intake.",
  alternates: {
    canonical: "https://roadmancycling.com/inner-circle",
  },
  openGraph: {
    title: "Roadman Inner Circle — Premium Cohort Coaching",
    description:
      "Premium cohort coaching for cyclists who've stopped improving. Small cohorts, assigned coach, daily review, quarterly blood work. $475/month.",
    type: "website",
    url: "https://roadmancycling.com/inner-circle",
  },
};

const broken = [
  {
    title: "A training app that gives you workouts",
    body:
      "It doesn't know about Tuesday's bad sleep, last week's head cold, or the deadline that wrecked your Wednesday. So it keeps prescribing the same intensities, and you keep wondering why the numbers won't move.",
  },
  {
    title: "A free YouTube plan written for someone else",
    body:
      "Whoever wrote it has never met you. Doesn't know your hours, your history, your weight, your sleep, your stress, or what your last block actually looked like. It worked for them. That doesn't make it right for you.",
  },
  {
    title: "An in-person coach at €600+/month",
    body:
      "Reads your data once a fortnight if you're lucky, then sends you a plan they wrote on a Sunday night. Probably good. Probably expensive. Almost never integrated with your nutrition, your strength, or your bloods.",
  },
  {
    title: "Friends in the bunch saying 'just train more'",
    body:
      "You already are. You're not under-trained. You're over-guessed. More volume on top of bad structure is just more fatigue with the same outcome.",
  },
];

const howItWorks = [
  {
    number: "01",
    title: "You join a cohort of 8–12 riders",
    body:
      "Small enough that the coach knows your training inside out. Big enough that you've got peers in the same window of progress to pull you forward. Not a class. Not a Discord. A real working group.",
  },
  {
    number: "02",
    title: "An assigned Roadman coach is matched to you",
    body:
      "One coach inside your cohort — your point of contact for everything. They know your race calendar, your numbers, your physiology, your work week. They sit inside the Roadman system, talk to Anthony weekly about the cohort, and use the same five-pillar methodology built from 1,400+ podcast conversations.",
  },
  {
    number: "03",
    title: "Daily log review — async, every day",
    body:
      "Your coach reads your training, sleep, and macro logs every day. Quick written feedback in your private channel. Catches the small leaks that add up — fueling drift, recovery slipping, an interval that didn't land — before they become weeks lost.",
  },
  {
    number: "04",
    title: "Weekly 1:1 written check-in",
    body:
      "You submit. Your coach replies inside 24 hours. Last week reviewed, next week confirmed, anything in your life that changes the plan factored in. Tight loop. No waiting a fortnight to ask the obvious question.",
  },
  {
    number: "05",
    title: "Monthly 1:1 video deep-dive",
    body:
      "45 minutes, camera on, last month's data on screen. Where's the trend going. What's working. What's stalling. What we change for the next four weeks. Less frequent than a check-in. Much deeper than a chat.",
  },
  {
    number: "06",
    title: "Weekly cohort live call",
    body:
      "The 8–12 of you on a call together. Group coaching, peer accountability, and the kind of small-room honesty that doesn't happen in a 200-person community. The bit most coaching skips, and the bit that decides whether the work sticks.",
  },
  {
    number: "07",
    title: "Quarterly blood work analysis",
    body:
      "Iron, ferritin, Vitamin D, full thyroid, hormones. Read against your training load, not in isolation. Catches the deficiencies that quietly cost you watts in February so they don't blow up your May.",
  },
  {
    number: "08",
    title: "Quarterly performance deep-dive",
    body:
      "Once a quarter we stop, lay it all out, and ask the harder question — are we still going the right direction? Power curves, body comp trends, race results, recovery markers. Then we re-plan the next twelve weeks from the data, not from inertia.",
  },
];

const features = [
  {
    title: "Personalised TrainingPeaks plan",
    body:
      "Built for your week, your goals, your bike. Adjusted weekly based on what your data actually says — not what an algorithm guessed.",
  },
  {
    title: "Cycling-specific S&C programme",
    body:
      "Periodised against your block so it transfers to the bike instead of wrecking your legs. Scales for the rider with two kids and a forty-hour week, not the one in a French training camp.",
  },
  {
    title: "Daily macro & training feedback",
    body:
      "Your fueling stops being a guess. Quick written notes from your coach on the days the data drifts. Race weight without the disordered chaos of MyFitnessPal.",
  },
  {
    title: "Race & event prep plans",
    body:
      "Marmotte, Étape, Unbound, your local A-race — built backwards from the day. Course-specific intervals, taper, fueling protocol, race-week check-ins.",
  },
  {
    title: "Body composition tracking",
    body:
      "Skinfolds, bioimpedance, photos against a calibrated background. We track lean mass and fat mass — the two numbers that actually move power-to-weight.",
  },
  {
    title: "Recovery protocol — built for your life",
    body:
      "Sleep, HRV, stress, illness flags. A protocol that respects the 47-year-old with a mortgage, not one written for a 23-year-old in altitude camp.",
  },
  {
    title: "Sleep & HRV review",
    body:
      "Whoop, Garmin, Oura — whatever you wear, your coach reads it weekly. Sleep architecture, autonomic balance, training-readiness signal. The stuff that quietly decides whether the work sticks.",
  },
  {
    title: "Private cohort Skool channel",
    body:
      "Just your 8–12 and your coach. Wins, questions, screenshots, video clips, race reports. The room where the real coaching happens between calls.",
  },
  {
    title: "Roadman masterclass library",
    body:
      "Every masterclass we've recorded with Seiler, Lorang, LeMond, Friel and the rest — yours to work through. The audio version of a coaching education.",
  },
  {
    title: "Early access to new content & tools",
    body:
      "When we test a new training block, build a new tool, or interview the next World Tour coach, the cohort sees it first. Inside the lab — not waiting for the white paper.",
  },
  {
    title: "Travel & camp protocols",
    body:
      "Time zones, altitude, work trips, family holidays. We plan around your life — racing weekends and rest weeks both — instead of pretending it's not there.",
  },
  {
    title: "Everything in Not Done Yet",
    body:
      "TrainingPeaks plans, weekly community calls, the masterclass library, and the wider private group of serious cyclists. The Inner Circle sits on top of NDY, not instead of it.",
  },
];

const comparison = [
  {
    label: "TrainingPeaks plan",
    ndy: "Personalised, built around your week",
    ic: "Personalised, adjusted weekly from your daily data",
  },
  {
    label: "Coaching contact",
    ndy: "Weekly group coaching call",
    ic: "Daily async + weekly check-in + monthly 1:1 video",
  },
  {
    label: "Cohort size",
    ndy: "Open community",
    ic: "Small cohort of 8–12 riders",
  },
  {
    label: "Assigned coach",
    ndy: "Community-led",
    ic: "Assigned Roadman coach inside your cohort",
  },
  {
    label: "Plan review depth",
    ndy: "Per block",
    ic: "Daily log read + weekly review + monthly deep-dive",
  },
  {
    label: "Async support",
    ndy: "Community Q&A",
    ic: "Priority cohort channel, same-day answers",
  },
  {
    label: "Nutrition guidance",
    ndy: "Frameworks, principles, masterclasses",
    ic: "Daily macro feedback + race-week protocols",
  },
  {
    label: "Strength programme",
    ndy: "Roadman S&C programme",
    ic: "Roadman S&C, periodised against your block",
  },
  {
    label: "Recovery & sleep",
    ndy: "Education and protocols",
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
    ndy: "Templates and community advice",
    ic: "Bespoke plan, taper, fueling, race-week check-ins",
  },
  {
    label: "Intake",
    ndy: "Open enrolment",
    ic: "Limited — cohorts open as spots free up",
  },
];

const faqs = [
  {
    question: "Why $475? That's a lot for a Skool community.",
    answer:
      "Because it isn't really a Skool community — it's a small-cohort coaching programme that happens to be delivered through Skool. Your assigned Roadman coach reads your logs daily, replies to your written check-in weekly, runs a 1:1 video with you monthly, reviews your bloods quarterly, and runs a live cohort call every week. In-person 1:1 cycling coaching usually runs €600–€1,200/month and doesn't include the rest of the Roadman system. The price sits where the value sits.",
  },
  {
    question: "How is this different from Not Done Yet?",
    answer:
      "Not Done Yet is open-enrolment group coaching with personalised training plans inside it — the right tier for the cyclist who needs structure and a serious community. Inner Circle is a small assigned cohort with a named coach and quarterly bloods on top. NDY is the gym membership and the trainer-led classes. Inner Circle is the small-group programme inside it where the coach knows your name.",
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
      "Eight weeks for the first measurable changes — sleep quality, recovery markers, sometimes power. Twelve weeks for the kind of progress you'll feel on a climb. A full season for the body composition and FTP changes that show up in race results. Coaching is compound, not instant.",
  },
  {
    question: "Is there a contract?",
    answer:
      "No. Monthly billing inside Skool. Cancel any time. The work speaks for itself or it doesn't.",
  },
  {
    question: "What happens after I apply?",
    answer:
      "You pay your first month inside Skool. Your coach is in your DMs within 24 hours with an onboarding questionnaire — training history, bloods (if you have recent ones), goals, calendar, life context. Within seven days you're in a cohort, on TrainingPeaks, and the daily log review starts.",
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
            "Premium cohort cycling coaching delivered inside Skool. Small cohorts of 8-12 riders with an assigned Roadman coach, daily async log review, weekly check-ins, monthly 1:1 video deep-dives, and quarterly blood work analysis.",
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
        {/* Hero — problem-first, identity hook */}
        <Section background="deep-purple" grain className="pt-32 pb-20">
          <Container className="text-center">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-[0.3em] mb-5">
                THE INNER CIRCLE &middot; PREMIUM COHORT COACHING
              </p>
              <h1
                className="font-heading text-off-white text-gradient-animated mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                STILL NOT WHERE
                <br />
                YOU SHOULD BE.
              </h1>
              <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-6 leading-relaxed">
                You read the books. You did the FTP tests. You bought the power
                meter, the carbon shoes, the ceramic bearings — all of it. You
                ride more hours than half the lads you can&apos;t drop. And the
                watts haven&apos;t moved in a year.
              </p>
              <p className="text-off-white text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                You&apos;re not under-trained. You&apos;re over-guessed.
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
                <Button href="#how-it-works" variant="ghost" size="lg">
                  See How It Works
                </Button>
              </div>

              <p className="text-foreground-subtle text-sm tracking-wider">
                $475/month &middot; Cohorts of 8&ndash;12 &middot; Limited intake
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* Problem — what they've tried */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-[0.3em] mb-4">
                WHAT YOU&apos;VE TRIED
              </p>
              <h2
                className="font-heading text-off-white mb-5"
                style={{ fontSize: "var(--text-section)" }}
              >
                FOUR THINGS THAT
                <br />
                <span className="text-coral">DON&apos;T QUITE WORK.</span>
              </h2>
              <p className="text-foreground-muted leading-relaxed">
                Most of what gets pitched at the cyclist who&apos;s stuck looks
                like one of these. None are the answer on their own — they all
                see one piece of the puzzle. And the puzzle has five.
              </p>
            </ScrollReveal>

            <div className="space-y-4">
              {broken.map((item, i) => (
                <ScrollReveal key={item.title} direction="up" delay={i * 0.06}>
                  <Card
                    className="p-6 md:p-7 border-l-2 border-l-foreground-subtle/40"
                    hoverable={false}
                  >
                    <h3 className="font-heading text-lg text-off-white mb-2 tracking-wide">
                      {item.title.toUpperCase()}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {item.body}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* The reframe — here's what nobody tells you */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-xs tracking-[0.3em] mb-4 text-center">
                HERE&apos;S WHAT NOBODY TELLS YOU
              </p>
              <h2
                className="font-heading text-off-white mb-8 text-center"
                style={{ fontSize: "var(--text-section)" }}
              >
                IT&apos;S NEVER YOUR EFFORT.
                <br />
                <span className="text-coral">IT&apos;S YOUR STRUCTURE.</span>
              </h2>
              <div className="space-y-5 text-foreground-muted text-lg leading-relaxed">
                <p>
                  Two years into structured training, your ceiling stops being
                  your genetics. It starts being whatever you&apos;re not
                  watching. The bloods you&apos;ve never read. The fueling that
                  drifts on Wednesdays. The sleep that quietly went south in
                  February. The strength block you keep meaning to start.
                </p>
                <p>
                  Pros don&apos;t train harder than you. They train against more
                  data, with more eyes on it, and they correct the small leaks
                  before those leaks become months lost. That&apos;s the
                  difference. Five pillars, one system, watched closely by
                  someone whose job it is to watch.
                </p>
                <p className="text-off-white font-medium">
                  The good news — that&apos;s fixable. And it doesn&apos;t need a
                  six-figure budget or a sabbatical from your job.
                </p>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* How it works — the cohort model */}
        <Section background="charcoal" id="how-it-works">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-14">
              <p className="text-coral font-heading text-xs tracking-[0.3em] mb-4">
                HOW THE INNER CIRCLE WORKS
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                A SMALL ROOM.
                <br />
                <span className="text-coral">THE FULL ROADMAN SYSTEM.</span>
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                We took everything we learned from how the best academies in
                the sport actually run, and built it into a small-cohort model
                that delivers coach-level attention without burning the coach
                or the cyclist.
              </p>
            </ScrollReveal>

            <div className="max-w-4xl mx-auto space-y-4">
              {howItWorks.map((step, i) => (
                <ScrollReveal key={step.title} direction="up" delay={i * 0.05}>
                  <Card className="p-6 md:p-7 card-shimmer" glass hoverable={false}>
                    <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-7">
                      <div className="shrink-0">
                        <span className="font-heading text-4xl text-coral/50">
                          {step.number}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-xl text-off-white mb-2 tracking-wide">
                          {step.title.toUpperCase()}
                        </h3>
                        <p className="text-sm md:text-base text-foreground-muted leading-relaxed">
                          {step.body}
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

        {/* Features — what's in it */}
        <Section background="deep-purple" grain id="whats-inside">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-14">
              <p className="text-coral font-heading text-xs tracking-[0.3em] mb-4">
                WHAT&apos;S IN IT
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
                Twelve things, each chosen because it changes outcomes. No
                fluff. No padding for the price tag.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {features.map((f, i) => (
                <ScrollReveal key={f.title} direction="up" delay={(i % 6) * 0.05}>
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

        {/* Comparison */}
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
                Both run on the five-pillar system. The difference is how close
                the coach gets, how much of your data they read, and how small
                the room is.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up">
              <div className="max-w-5xl mx-auto rounded-xl border border-white/10 bg-background-elevated overflow-hidden">
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
                      "Have been training consistently for 1–2+ years and stopped improving",
                      "Train 8+ hours a week and want every one of them to count",
                      "Have a target — a category jump, a Grand Fondo PB, an Ironman bike split",
                      "Want a small room of serious cyclists watching your work, not a 200-person feed",
                      "Will share your data honestly so it can be coached against",
                      "Are ready to back a coach's call instead of second-guessing it on Reddit",
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
                      One tier. One price. A small cohort with an assigned
                      Roadman coach. Cancel any time — the work speaks for
                      itself or it doesn&apos;t.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 max-w-xl mx-auto mb-10">
                    {[
                      "Cohort of 8–12 riders",
                      "Assigned Roadman coach",
                      "Daily async log review",
                      "Weekly written 1:1 check-in",
                      "Monthly 1:1 video deep-dive",
                      "Weekly cohort live call",
                      "Quarterly blood work analysis",
                      "Quarterly performance deep-dive",
                      "Body composition tracking",
                      "Race & event prep plans",
                      "Roadman masterclass library",
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
                      Pay your first month inside Skool. Your coach is in your
                      DMs within 24 hours. You&apos;re in a cohort within seven
                      days.
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
              Apply Through Skool
            </Link>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 text-off-white/70 text-sm">
              <span>$475/month</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>Cohorts of 8–12</span>
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

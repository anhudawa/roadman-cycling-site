import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import { getTestimonialsByName } from "@/lib/testimonials";

/**
 * /apps-vs-coaching — comparison page positioning coaching as the
 * interpretation layer that sits on top of the apps a serious cyclist
 * is already paying for. Not a replacement for TrainingPeaks, Zwift,
 * Strava, Garmin, Whoop — a layer that reads the data, decides what
 * changes, and writes the next four weeks based on what the last four
 * actually said.
 *
 * Surface: commercial. Primary CTA is the Plateau Diagnostic; secondary
 * is Not Done Yet Coaching. Audience is the rider already spending
 *  to /month on apps and still stalled.
 */

const PAGE_PATH = "/apps-vs-coaching";
const PAGE_URL = `${SITE_ORIGIN}${PAGE_PATH}`;

type AppEntry = {
  name: string;
  role: string;
  strength: string;
  cost: string;
  favourable?: boolean;
};

const APPS: readonly AppEntry[] = [
  {
    name: "TrainingPeaks",
    role: "The plan calendar",
    strength:
      "The standard the coaching world runs on. Workout structure, TSS, CTL/ATL/TSB, post-ride compliance, the comments thread between rider and coach — all in one place. Roadman runs Not Done Yet coaching on TrainingPeaks — plans push directly into your calendar. If you only have one paid app, this is the one that earns it.",
    cost: "USD $19.95/mo Premium",
    favourable: true,
  },
  {
    name: "Zwift",
    role: "The indoor workout engine",
    strength:
      "The reason a lot of riders actually finish their Tuesday intervals in winter. Group rides, race series, structured workouts that pair with TrainingPeaks. When the weather kills your block, Zwift keeps the block alive.",
    cost: "USD $19.99/mo",
  },
  {
    name: "TrainerRoad",
    role: "Adaptive workouts",
    strength:
      "Smart progression, useful workout library, AI FTP detection that actually correlates with field tests. Strong for riders who want a structured workout served to them with the prescription already calculated.",
    cost: "USD $19.95/mo",
  },
  {
    name: "Strava",
    role: "The ride record and the social layer",
    strength:
      "Where the ride lives after it ends. Segments, fitness/freshness, kudos, the group context. Useful for context and pattern-spotting; lousy as a sole source of truth for training load.",
    cost: "USD $11.99/mo or USD $79.99/yr Premium",
  },
  {
    name: "Garmin Connect",
    role: "Head-unit and recovery layer",
    strength:
      "The ride captures itself, syncs everywhere, and the Body Battery / sleep / HRV data is genuinely useful as a trend line. The Edge head-unit is the workhorse of structured outdoor training.",
    cost: "Free with hardware",
  },
  {
    name: "Wahoo SYSTM",
    role: "Indoor workout library",
    strength:
      "The Sufferfest pedigree, with structured 4DP-based workouts and named training plans. Good for riders who like a defined eight-week block they can run.",
    cost: "USD $14.99/mo",
  },
  {
    name: "Whoop / Oura",
    role: "The recovery signal",
    strength:
      "Sleep architecture, HRV trend, strain score. Best used as a trend line over weeks, not a daily verdict. Pairs well with a coach who can read the trend in context.",
    cost: "USD $30/mo (Whoop) · USD $299/yr (Oura, hardware separate)",
  },
];

const APPS_DO = [
  {
    title: "Capture the work",
    body: "Garmin records every pedal stroke. Zwift gives you a watt target to chase. Strava saves the ride. The data exists.",
  },
  {
    title: "Schedule structure",
    body: "TrainingPeaks lays the week out on a calendar. Workouts open on the day, close on the day, and the file gets attached.",
  },
  {
    title: "Surface load",
    body: "TSS, CTL, ATL, TSB. Garmin Body Battery. Whoop strain. The numbers are visible and the trend is plottable.",
  },
  {
    title: "Stack a library",
    body: "TrainerRoad and SYSTM hand you well-built sessions. You don't have to write them yourself.",
  },
] as const;

const APPS_DONT = [
  {
    title: "Read the data in context",
    body: "An app shows your TSB went red. It doesn't know your daughter was up sick three nights running, your hardest meeting of the quarter is on Friday, and last week's race file actually understated the effort. A coach does.",
  },
  {
    title: "Decide what changes",
    body: "An algorithm can suggest a deload. It can't decide whether the right call is two easy days, swap the threshold session for VO2 because your trajectory needs it, or hold the line because you're three weeks from your A-event.",
  },
  {
    title: "Programme around your real life",
    body: "An app builds around your settings. A coach builds around the fact you have eight to twelve hours, two of which are non-negotiably indoor, you're flat by Thursday afternoon, and your weekend rides are with the same group whose pace you can't fully control.",
  },
  {
    title: "Hold the line when motivation drifts",
    body: "An app sends a notification. A coach sees the second missed session of the week, asks the right question on Monday, and adjusts the block instead of letting it quietly fall apart.",
  },
  {
    title: "Integrate strength, fuelling, recovery",
    body: "Apps live in their lanes. The bike app prescribes the bike work. The recovery app reports the recovery. Nobody is responsible for the lift, the protein target, the sleep window, and the bike block hanging together. A coach is.",
  },
  {
    title: "Adjust when the file says one thing and the legs say another",
    body: "A power file is a record, not a verdict. The reason a session went south matters more than the score. An app gives you the score. A coach gives you the reason and the next move.",
  },
] as const;

type StackEntry = {
  layer: string;
  tool: string;
  job: string;
  primary?: boolean;
};

const STACK: readonly StackEntry[] = [
  {
    layer: "Head unit",
    tool: "Garmin Edge / Wahoo Bolt",
    job: "Capture the ride accurately and reliably.",
  },
  {
    layer: "Indoor engine",
    tool: "Zwift / TrainerRoad / SYSTM",
    job: "Deliver the watts on a Tuesday in February.",
  },
  {
    layer: "The plan calendar",
    tool: "TrainingPeaks (Premium)",
    job: "Hold the block, push the workouts, log compliance, host the comments thread.",
  },
  {
    layer: "Ride memory",
    tool: "Strava",
    job: "Long-term context — segments, group rides, the social spine.",
  },
  {
    layer: "Recovery signal",
    tool: "Whoop / Oura / Garmin",
    job: "Trend the sleep, HRV, and strain numbers over weeks.",
  },
  {
    layer: "The interpretation layer",
    tool: "Coaching — Not Done Yet",
    job: "Read everything above in context. Decide what changes. Write the next four weeks.",
    primary: true,
  },
];

const FAQ = [
  {
    q: "Does Roadman coaching replace TrainingPeaks or Zwift?",
    a: "No. We use TrainingPeaks — the plans inside Not Done Yet Coaching push directly into your TrainingPeaks calendar, and most members keep their existing Zwift, Strava, Whoop and Garmin set-up. The coaching is the interpretation layer on top of the tools you already have. If you don't have TrainingPeaks Premium yet, you'll want it; if you do, you'll use it the way it was actually designed to be used.",
  },
  {
    q: "I'm already paying $50–$80/month in app subscriptions. Why add coaching?",
    a: "Because the apps are doing what they're supposed to do — they're showing you the numbers, the workouts, and the calendar. They're not deciding what should change when a block isn't working. The most expensive thing in your training isn't the app stack; it's a year of training that didn't move your FTP. Coaching is the line item that makes the others actually pay back. If your numbers have been flat for 18 months, you don't need another app — you need someone reading the apps you already have.",
  },
  {
    q: "Can't TrainerRoad's adaptive AI do what a coach does?",
    a: "It can do part of the job — it's genuinely good at progressing a workout difficulty curve and detecting an FTP shift from indoor sessions. What it can't do is decide whether the right answer this Tuesday is to back off because your sleep tanked, swap the prescribed VO2 block for sweet spot because your A-event moved, or call you on the phone when you're three weeks from a goal race and the file says one thing but the chat says another. Adaptive software is a useful piece of the stack. It's not the layer above it.",
  },
  {
    q: "I have a coach already and I'm thinking about leaving. What's different here?",
    a: "Two things, usually. One: most generalist coaching plans are templates with a name on them. Roadman plans are built off two decades of reading masters cyclists who train around real lives, and the conversations Anthony has had with the coaches who sit behind the World Tour — Dan Lorang, Stephen Seiler, Joe Friel, David Lipman, Derek Teel, David Dunne. Two: you get the strength roadmap, the fuelling guidance, and the community of riders running the same system, not just a calendar. If your current coach is delivering on those, stay with them — that's a working set-up. If they're not, the Plateau Diagnostic is a four-minute way to see what's actually missing.",
  },
  {
    q: "Do I need a power meter and a smart trainer to make any of this work?",
    a: "A power meter on the bike — outside or inside — is the single highest-leverage purchase a serious cyclist makes after a working bike. A smart trainer matters if your weather, schedule, or family pattern means you're indoors a lot. If you only have heart rate, you can still train well; the prescription just has to lean on RPE and HR, and the load tracking is fuzzier. The Coaching membership doesn't require either, but it gets a lot more precise once you have power.",
  },
  {
    q: "What does the full stack actually cost in USD per month?",
    a: "A representative serious-amateur stack runs roughly: TrainingPeaks Premium $19.95, Zwift $19.99, Strava Premium $11.99, Whoop $30 — about $82/mo before coaching. Add Not Done Yet Coaching at $195/mo and you're at roughly $277/mo, or about $9 a day. The benchmark question isn't whether $9 a day is a lot — it's whether the year of training you're paying for is moving you forward. If it isn't, the cheapest thing in the stack is the one that decides what changes.",
  },
  {
    q: "Why not just read the podcast archive and the blog and self-coach?",
    a: "A lot of riders do — and the free archive is genuinely the most-cited resource members reference once they're inside the paid programme. The two things self-coaching can't give you are the second pair of eyes on your specific data and the accountability that holds the block together when life gets in the way. If you're early in the work, self-coach with the free archive. If you've been doing it for years and your FTP has stalled, the diagnostic at /plateau will tell you which of four common patterns you're caught in.",
  },
  {
    q: "Is this a fit for triathletes, gravel riders, or only road racers?",
    a: "It's built for serious amateur cyclists across road, gravel, and increasingly long-format gran fondo and ultra. There's a separate triathlon coaching track for athletes whose primary goal is a multisport event. If you're not sure, the five-question Find Your Fit quiz routes you to the right product without a sales call.",
  },
];

const STATS = [
  { value: "$9/day", label: "Stack + coaching, all in" },
  { value: "$195", label: "Not Done Yet Coaching, USD per month" },
  { value: "7-day", label: "Free trial. Cancel anytime." },
];

const COMPARISON = [
  {
    label: "Just the apps",
    description:
      "TrainingPeaks, Zwift, Strava, Whoop. The data is captured and the workouts open on the calendar. You're the one reading it.",
    bullets: [
      "Workouts delivered, files captured, load tracked.",
      "Decisions about what changes are yours.",
      "No outside eyes on the file when something looks off.",
      "Strength, fuelling, recovery left to you to integrate.",
    ],
    tone: "neutral",
  },
  {
    label: "A coach with no apps",
    description:
      "Email-and-spreadsheet coaching, no power data flowing, no compliance signal. Common in the past, rare now — and a serious step backward.",
    bullets: [
      "Plans land, but execution is hard to verify.",
      "No structured workout file to follow on the bike.",
      "Adjustments lag the data because the data is hidden.",
      "Doesn't reflect how serious cyclists actually train in 2026.",
    ],
    tone: "weak",
  },
  {
    label: "Apps + coaching",
    description:
      "TrainingPeaks runs the plan. Garmin records the ride. Zwift delivers the watts. Whoop trends the recovery. Coaching reads it all in context and decides what changes.",
    bullets: [
      "Plan written for your hours, your event, your recovery profile.",
      "Compliance and load visible to a second pair of eyes.",
      "Strength, fuelling, recovery integrated, not bolted on.",
      "Direct access when the file and the legs disagree.",
    ],
    tone: "strong",
  },
] as const;

const appsTestimonials = getTestimonialsByName([
  "Brian Morrissey",
  "David Lundy",
  "Chris O'Connor",
]);

export const metadata: Metadata = {
  title: "Cycling Apps vs Coaching — TrainingPeaks, Zwift, Whoop & the Layer Above",
  description:
    "Apps deliver the workout. Coaching writes it. An honest comparison of TrainingPeaks, Zwift, TrainerRoad, Strava, Garmin and Whoop — and where a coach sits above the stack.",
  keywords: [
    "apps vs coaching",
    "TrainingPeaks vs coaching",
    "Zwift vs coach",
    "TrainerRoad vs coach",
    "cycling app subscription stack",
    "do I need a cycling coach",
    "is TrainingPeaks enough",
    "Whoop cycling coach",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Cycling Apps vs Coaching — TrainingPeaks, Zwift, Whoop & the Layer Above",
    description:
      "Apps deliver the workout. Coaching writes it. Honest comparison of TrainingPeaks, Zwift, TrainerRoad, Strava, Garmin and Whoop — and where a coach sits above the stack.",
    type: "website",
    url: PAGE_URL,
    images: [
      {
        url: `${PAGE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Apps vs Coaching — Roadman Cycling",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apps vs Coaching — TrainingPeaks, Zwift, Whoop, and the Layer Above",
    description:
      "Apps deliver the work. Coaching writes it. An honest comparison of the cycling app stack.",
    images: [`${PAGE_URL}/opengraph-image`],
  },
  robots: { index: true, follow: true },
};

export default function AppsVsCoachingPage() {
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
      {
        "@type": "ListItem",
        position: 2,
        name: "Coaching",
        item: `${SITE_ORIGIN}/community/not-done-yet`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Apps vs Coaching",
        item: PAGE_URL,
      },
    ],
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: "Apps vs Coaching — Roadman Cycling",
    description:
      "An honest comparison of the cycling app stack — TrainingPeaks, Zwift, TrainerRoad, Strava, Garmin, Whoop — and where coaching sits as the interpretation layer above them.",
    isPartOf: { "@id": ENTITY_IDS.website },
    publisher: { "@id": ENTITY_IDS.organization },
    about: {
      "@type": "Thing",
      name: "Cycling Coaching vs Training Apps",
      description:
        "Comparison of cycling training apps (TrainingPeaks, Zwift, TrainerRoad, Strava, Garmin, Whoop) versus coaching for serious amateur cyclists.",
    },
    inLanguage: "en",
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${PAGE_URL}/opengraph-image`,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbsJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={faqJsonLd} />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-20">
          <Container>
            <ScrollReveal direction="up" eager>
              <div className="text-center max-w-4xl mx-auto">
                <p className="text-coral font-heading text-sm tracking-[0.3em] uppercase mb-6">
                  Apps vs Coaching
                </p>
                <h1
                  className="font-heading text-off-white uppercase leading-[0.95] mb-6"
                  style={{ fontSize: "var(--text-hero)" }}
                >
                  Apps deliver the work.
                  <br />
                  <span className="text-coral">Coaching writes it.</span>
                </h1>
                <p className="text-foreground-muted text-lg md:text-xl leading-relaxed mb-4">
                  TrainingPeaks runs your plan. Garmin records the ride. Zwift
                  hands you the watts to chase. Whoop trends the recovery.
                  Every one of them is doing its job. None of them is
                  deciding what changes when a block isn&apos;t working.
                </p>
                <p className="text-off-white text-lg md:text-xl leading-relaxed font-medium mb-10">
                  Coaching is the layer that reads the rest of the stack and
                  writes the next four weeks based on what the last four
                  actually said. Not a replacement for the apps — the layer
                  above them.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
                  <Button
                    href="/plateau"
                    size="lg"
                    dataTrack="apps_vs_coaching_hero_plateau"
                  >
                    Take the Plateau Diagnostic
                  </Button>
                  <Button
                    href="/community/not-done-yet"
                    size="lg"
                    variant="ghost"
                    dataTrack="apps_vs_coaching_hero_ndy"
                  >
                    See Not Done Yet Coaching
                  </Button>
                </div>
                <p className="text-foreground-subtle text-sm">
                  Free, four minutes. The diagnostic tells you whether the
                  fix is in the app stack or the layer above it.
                </p>
              </div>
            </ScrollReveal>

            {/* Trust strip */}
            <ScrollReveal direction="up" delay={0.15} className="mt-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="text-center border border-white/10 rounded-lg p-5 bg-white/[0.02]"
                  >
                    <div className="font-heading text-coral text-3xl md:text-4xl tracking-tight">
                      {s.value}
                    </div>
                    <div className="text-foreground-subtle text-xs tracking-widest uppercase mt-2">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* What apps actually do — favourable */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                THE HONEST PART
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                <GradientText as="span">
                  THE APPS ARE GOOD. USE THEM.
                </GradientText>
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                The cycling software stack in 2026 is the best it has ever
                been. TrainingPeaks runs the calendar properly. Zwift makes
                a Tuesday in February possible. Whoop and Oura turn sleep
                and HRV into trend lines you can actually act on. None of
                this is the enemy of getting faster — it&apos;s the
                infrastructure.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-3">
              {APPS.map((app, i) => (
                <ScrollReveal key={app.name} direction="up" delay={i * 0.04}>
                  <Card
                    className={`p-6 h-full ${
                      app.favourable
                        ? "border-2 border-coral/50 bg-coral/[0.04]"
                        : ""
                    }`}
                    hoverable={false}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-heading text-lg text-off-white tracking-wide">
                        {app.name.toUpperCase()}
                      </h3>
                      {app.favourable && (
                        <span className="shrink-0 text-[10px] font-heading tracking-widest text-coral border border-coral/40 rounded px-2 py-0.5">
                          PARTNER
                        </span>
                      )}
                    </div>
                    <p className="font-heading text-coral text-xs tracking-widest mb-3">
                      {app.role.toUpperCase()}
                    </p>
                    <p className="text-sm text-foreground-muted leading-relaxed mb-4">
                      {app.strength}
                    </p>
                    <p className="text-foreground-subtle text-xs tracking-wider">
                      {app.cost}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* What apps do / don't do */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                THE LINE BETWEEN THE TWO
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT APPS DO. WHAT THEY DON&apos;T.
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                The apps are doing the part of the job they were built to
                do. The part that&apos;s missing isn&apos;t a feature — it&apos;s
                a layer.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="font-heading text-off-white text-sm tracking-widest mb-4 border-b border-white/15 pb-3">
                  WHAT APPS DO WELL
                </p>
                <div className="space-y-3">
                  {APPS_DO.map((item, i) => (
                    <ScrollReveal
                      key={item.title}
                      direction="up"
                      delay={i * 0.04}
                    >
                      <div className="p-5 rounded-lg bg-white/[0.04] border border-white/10">
                        <h3 className="font-heading text-base text-off-white tracking-wide mb-2">
                          {item.title.toUpperCase()}
                        </h3>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                          {item.body}
                        </p>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-heading text-coral text-sm tracking-widest mb-4 border-b border-coral/30 pb-3">
                  WHAT APPS DON&apos;T DO
                </p>
                <div className="space-y-3">
                  {APPS_DONT.map((item, i) => (
                    <ScrollReveal
                      key={item.title}
                      direction="up"
                      delay={i * 0.04}
                    >
                      <div className="p-5 rounded-lg bg-coral/[0.07] border border-coral/30">
                        <h3 className="font-heading text-base text-off-white tracking-wide mb-2">
                          {item.title.toUpperCase()}
                        </h3>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                          {item.body}
                        </p>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* Three columns comparison */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                THE THREE SET-UPS
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                APPS, COACH, OR BOTH?
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                Most serious amateurs are sitting in column one and
                wondering why progress has stalled. The fix is rarely
                another app. Once or twice a decade it&apos;s column two.
                Almost always it&apos;s column three.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-4">
              {COMPARISON.map((col, i) => (
                <ScrollReveal key={col.label} direction="up" delay={i * 0.06}>
                  <Card
                    className={`p-6 h-full ${
                      col.tone === "strong"
                        ? "border-2 border-coral relative"
                        : col.tone === "weak"
                          ? "opacity-80"
                          : ""
                    }`}
                    hoverable={false}
                  >
                    {col.tone === "strong" && (
                      <span className="absolute -top-3 left-6 bg-coral text-off-white font-heading text-[10px] tracking-widest px-3 py-1 rounded">
                        WHAT WORKS
                      </span>
                    )}
                    <h3 className="font-heading text-xl text-off-white mb-3 tracking-wide">
                      {col.label.toUpperCase()}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed mb-5">
                      {col.description}
                    </p>
                    <ul className="space-y-2">
                      {col.bullets.map((b) => (
                        <li
                          key={b}
                          className="text-sm text-foreground-muted leading-relaxed flex gap-2"
                        >
                          <span
                            className={`shrink-0 mt-1 ${
                              col.tone === "strong"
                                ? "text-coral"
                                : "text-foreground-subtle"
                            }`}
                          >
                            ›
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* The stack */}
        <Section background="deep-purple" grain id="stack">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                THE FULL STACK
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                COACHING IS THE LAYER, NOT THE TOOL
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                Five layers of infrastructure, one layer of
                interpretation. The interpretation layer is the cheapest
                way to make the other five actually pay back.
              </p>
            </ScrollReveal>

            <div className="space-y-3">
              {STACK.map((s, i) => (
                <ScrollReveal key={s.layer} direction="up" delay={i * 0.04}>
                  <div
                    className={`p-5 rounded-lg border transition-all ${
                      s.primary
                        ? "bg-coral/10 border-coral"
                        : "bg-white/[0.04] border-white/10"
                    }`}
                  >
                    <div className="grid md:grid-cols-12 gap-4 items-start">
                      <div className="md:col-span-3">
                        <p className="font-heading text-coral text-xs tracking-widest mb-1">
                          {s.layer.toUpperCase()}
                        </p>
                      </div>
                      <div className="md:col-span-4">
                        <p className="font-heading text-off-white text-base tracking-wide">
                          {s.tool}
                        </p>
                      </div>
                      <div className="md:col-span-5">
                        <p className="text-sm text-foreground-muted leading-relaxed">
                          {s.job}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Pricing context */}
        <Section background="charcoal" id="pricing">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                THE REAL COST IN USD
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                $9 A DAY, ALL IN
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                A representative serious-amateur stack — built around
                TrainingPeaks Premium and the apps you&apos;re probably
                already paying for — plus Not Done Yet Coaching. No
                hidden charges, no annual contracts.
              </p>
            </ScrollReveal>

            <Card className="p-8" hoverable={false}>
              <div className="space-y-3 mb-6">
                {[
                  ["TrainingPeaks Premium", "$19.95"],
                  ["Zwift", "$19.99"],
                  ["Strava Premium", "$11.99"],
                  ["Whoop", "$30.00"],
                  ["Garmin Connect (with hardware)", "$0.00"],
                ].map(([label, price]) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-2"
                  >
                    <p className="text-sm text-foreground-muted">{label}</p>
                    <p className="font-heading text-off-white text-base tracking-wider">
                      {price}
                    </p>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-4 pt-2">
                  <p className="text-sm text-foreground-subtle tracking-wider uppercase font-heading">
                    App stack subtotal
                  </p>
                  <p className="font-heading text-off-white text-base tracking-wider">
                    $81.93
                  </p>
                </div>
              </div>

              <div className="bg-coral/10 border border-coral/40 rounded-lg p-5 mb-4">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <p className="font-heading text-coral text-sm tracking-widest mb-1">
                      THE INTERPRETATION LAYER
                    </p>
                    <p className="font-heading text-off-white text-lg tracking-wide">
                      NOT DONE YET COACHING
                    </p>
                    <p className="text-sm text-foreground-muted mt-1">
                      Personalised TrainingPeaks plans, weekly coaching
                      calls, strength roadmap, the community. 7-day free
                      trial.
                    </p>
                  </div>
                  <p className="font-heading text-coral text-2xl md:text-3xl tracking-tight shrink-0">
                    $195.00
                  </p>
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-4 pt-3 border-t-2 border-coral/40">
                <p className="font-heading text-off-white text-base tracking-widest uppercase">
                  Full stack, all in
                </p>
                <div className="text-right">
                  <p className="font-heading text-off-white text-2xl md:text-3xl tracking-tight">
                    $276.93
                  </p>
                  <p className="text-foreground-subtle text-xs tracking-widest uppercase">
                    ≈ $9.10 / day
                  </p>
                </div>
              </div>
            </Card>

            <p className="text-foreground-subtle text-sm text-center mt-6 max-w-2xl mx-auto leading-relaxed">
              The benchmark question isn&apos;t whether $9 a day is a lot.
              It&apos;s whether the year of training you&apos;re paying
              for is moving you forward. If it isn&apos;t, the cheapest
              line in the stack is the one that decides what changes.
            </p>
          </Container>
        </Section>

        {/* Testimonials */}
        {appsTestimonials.length > 0 && (
          <Section background="deep-purple" grain id="proof">
            <Container width="narrow">
              <ScrollReveal direction="up" className="text-center mb-12">
                <p className="text-coral font-heading text-xs tracking-widest mb-3">
                  IN THEIR WORDS
                </p>
                <h2
                  className="font-heading text-off-white mb-4"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  RIDERS WHO ADDED THE LAYER
                </h2>
              </ScrollReveal>

              <div className="grid md:grid-cols-3 gap-4">
                {appsTestimonials.map((t, i) => (
                  <ScrollReveal key={t.name} direction="up" delay={i * 0.06}>
                    <Card
                      className="p-6 h-full border-l-2 border-l-coral"
                      hoverable={false}
                    >
                      {t.stat && (
                        <div className="mb-4">
                          <div className="font-heading text-coral text-2xl tracking-tight">
                            {t.stat}
                          </div>
                          <div className="text-foreground-subtle text-[10px] tracking-widest uppercase">
                            {t.statLabel}
                          </div>
                        </div>
                      )}
                      <p className="text-sm text-off-white italic leading-relaxed mb-4">
                        &ldquo;{t.shortQuote ?? t.quote}&rdquo;
                      </p>
                      <p className="font-heading text-xs text-off-white tracking-wider">
                        {t.name.toUpperCase()}
                      </p>
                      <p className="text-foreground-subtle text-xs leading-relaxed mt-1">
                        {t.detail}
                      </p>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal direction="up" className="text-center mt-10">
                <Link
                  href="/results"
                  className="inline-flex items-center gap-2 text-sm text-foreground-subtle hover:text-coral transition-colors font-heading tracking-wider"
                >
                  MORE COACHING RESULTS →
                </Link>
              </ScrollReveal>
            </Container>
          </Section>
        )}

        {/* FAQ */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                COMMON QUESTIONS
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                APPS VS COACHING, ANSWERED
              </h2>
            </ScrollReveal>

            <div className="space-y-4">
              {FAQ.map((item, i) => (
                <ScrollReveal key={item.q} direction="up" delay={i * 0.05}>
                  <details className="group p-6 rounded-lg bg-white/[0.03] border border-white/10 hover:border-coral/30 transition-all">
                    <summary className="cursor-pointer flex items-start justify-between gap-4 list-none">
                      <h3 className="font-heading text-base md:text-lg text-off-white tracking-wide">
                        {item.q.toUpperCase()}
                      </h3>
                      <span className="shrink-0 text-coral text-2xl leading-none transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-4 text-sm text-foreground-muted leading-relaxed">
                      {item.a}
                    </p>
                  </details>
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
              KEEP THE APPS. ADD THE LAYER.
            </h2>
            <p className="text-off-white/85 max-w-lg mx-auto mb-8 text-lg">
              The diagnostic is free and runs in four minutes. It tells
              you whether the fix is in your app stack or in the layer
              above it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/plateau"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md transition-all cursor-pointer active:scale-[0.97] active:duration-75 px-8 md:px-10 py-4 text-lg bg-off-white text-coral hover:bg-off-white/90 shadow-lg"
                style={{ transitionDuration: "var(--duration-fast)" }}
                data-track="apps_vs_coaching_footer_plateau"
              >
                Take the Plateau Diagnostic
              </Link>
              <Link
                href="/community/not-done-yet"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md transition-all cursor-pointer active:scale-[0.97] active:duration-75 px-8 md:px-10 py-4 text-lg bg-transparent border-2 border-off-white/40 text-off-white hover:bg-off-white/10 hover:border-off-white"
                style={{ transitionDuration: "var(--duration-fast)" }}
                data-track="apps_vs_coaching_footer_ndy"
              >
                Not Done Yet Coaching
              </Link>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

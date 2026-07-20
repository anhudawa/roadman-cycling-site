import type { Metadata } from "next";
import { Container, Footer, Header, Section } from "@/components/layout";
import { Button } from "@/components/ui";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 3600;

const SKOOL_URL = "https://www.skool.com/roadmancycling";

export const metadata: Metadata = {
  title: "RideZones — Upload Your Riding History. Train With World Tour Insight. | Roadman Cycling",
  description:
    "RideZones reads your riding history the way a coach would: an eight-system fitness profile, execution scores on every ride, the recipe behind your best form, and a training week built for your goal. Free, in your browser.",
  alternates: {
    canonical: "https://roadmancycling.com/ridezones",
  },
  openGraph: {
    title: "RideZones — Upload Your Riding History. Train With World Tour Insight.",
    description:
      "Your fitness profile across eight systems, execution scoring on every ride, and the recipe behind your best form — built on the coaching logic behind 100M+ podcast downloads.",
    type: "website",
    url: "https://roadmancycling.com/ridezones",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "RideZones by Roadman Cycling",
      },
    ],
  },
};

const FAQS = [
  {
    question: "What data does RideZones need?",
    answer:
      "Your FTP, your weekly training hours, and your ride history. The quickest import is the activities.csv from a Strava bulk export (Settings → My Account → Download or Delete Your Account → Request Your Archive). Rides with power get the most accurate analysis; rides with only heart rate still work if you add your threshold heart rate.",
  },
  {
    question: "Is this an AI coach?",
    answer:
      "No — and that's deliberate. Anthony has been clear on the podcast that AI coaching is one of the biggest mistakes self-coached riders make. RideZones is a fixed library of coaching logic — the patterns Dan Lorang, Professor Stephen Seiler, and John Wakefield have described on the podcast — applied deterministically to your data. Same data in, same analysis out, every time. No chatbot improvising your training.",
  },
  {
    question: "Where does my data go?",
    answer:
      "Nowhere. The entire analysis runs in your browser and your history is stored locally on your device. Nothing is uploaded to a server.",
  },
  {
    question: "What are the eight systems in the fitness profile?",
    answer:
      "Aerobic Base, Zone 2 Engine, Easy Ride Discipline, Tempo Control, Threshold Power, VO2 Engine, Durability, and Execution Quality. Each is scored 0–100 from your last twelve weeks of riding, and your goal decides which weakness matters most.",
  },
  {
    question: "What is an execution score?",
    answer:
      "Every ride is classified by what it actually was — endurance, threshold, VO2, or the grey zone in between — then scored 0–10 on how well it did that job. An easy ride that drifted into Zone 3 scores badly even if it felt like good training. That honesty is the point.",
  },
  {
    question: "How is RideZones different from TrainingPeaks or Strava?",
    answer:
      "Those platforms show you charts and leave the interpretation to you. RideZones interprets: it names the system that's holding you back, tells you whether each ride did its job, and shows you what your best block was made of — then turns that into a week you can ride.",
  },
];

const SYSTEMS = [
  { name: "Aerobic Base", detail: "Is the foundation actually there?" },
  { name: "Zone 2 Engine", detail: "Real Zone 2 hours, not wishful ones" },
  { name: "Easy Ride Discipline", detail: "Do your easy days stay easy?" },
  { name: "Tempo Control", detail: "Deliberate tempo, not accidental" },
  { name: "Threshold Power", detail: "Time at FTP that moves FTP" },
  { name: "VO2 Engine", detail: "The ceiling everything sits under" },
  { name: "Durability", detail: "Power when you're already tired" },
  { name: "Execution Quality", detail: "How well you ride the plan" },
];

const STEPS = [
  {
    number: "01",
    title: "Import your history",
    detail:
      "Drop in your Strava export, or start with demo data. Rides only — power if you have it, heart rate if you don't.",
  },
  {
    number: "02",
    title: "Build your profile",
    detail:
      "Eight physiological systems, scored from your last twelve weeks. Not how it felt — what the data says.",
  },
  {
    number: "03",
    title: "See the gap",
    detail:
      "RideZones finds your best-ever training block, names its ingredients, and shows you exactly what's missing now.",
  },
  {
    number: "04",
    title: "Train with direction",
    detail:
      "A week built for your goal, your hours, and your named weakness — every session with watt targets and a job to do.",
  },
];

export default function RideZonesPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "RideZones",
          applicationCategory: "SportsApplication",
          operatingSystem: "Web",
          url: "https://roadmancycling.com/ridezones",
          description:
            "Cycling training analysis: eight-system fitness profile, per-ride execution scoring, race recipe analysis, and goal-specific training weeks from your riding history.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
          publisher: { "@id": "https://roadmancycling.com/#organization" },
        }}
      />
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
              name: "RideZones",
              item: "https://roadmancycling.com/ridezones",
            },
          ],
        }}
      />
      <FAQSchema faqs={FAQS} />

      <Header />
      <main>
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 md:pt-40">
          <Container>
            <p
              className="mb-4 text-xs font-semibold uppercase tracking-widest text-coral"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              RideZones · New from Roadman
            </p>
            <h1
              className="max-w-4xl font-heading uppercase leading-none text-off-white"
              style={{ fontSize: "var(--text-hero)" }}
            >
              Upload your riding history.
              <br />
              <span className="text-coral">Train with World Tour insight.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground-muted">
              You&apos;ve got years of rides sitting in Strava telling a story nobody has ever read.
              RideZones reads it the way a coach would — built on the training logic Anthony has
              spent 100M+ podcast downloads extracting from the people who coach Pogačar,
              Vingegaard, and the rest of the World Tour.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/ridezones/app" size="lg" dataTrack="ridezones_hero_start">
                Start your analysis
              </Button>
              <Button href="#how-it-works" variant="ghost" size="lg" dataTrack="ridezones_hero_how">
                See how it works
              </Button>
            </div>
            <p className="mt-4 text-sm text-foreground-subtle">
              Free. Runs in your browser. Your data never leaves your device.
            </p>
          </Container>
        </Section>

        {/* How it works */}
        <Section background="charcoal" id="how-it-works">
          <Container>
            <h2
              className="mb-3 font-heading uppercase text-off-white"
              style={{ fontSize: "var(--text-section)" }}
            >
              From a pile of old rides to direction you can train on
            </h2>
            <p className="mb-12 max-w-2xl text-foreground-muted">
              Most riders don&apos;t need more data. They need someone to tell them what the data
              they already have actually means. That&apos;s the whole product.
            </p>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step) => (
                <div key={step.number}>
                  <p
                    className="mb-2 text-sm font-semibold text-coral"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    {step.number}
                  </p>
                  <h3 className="mb-2 font-heading text-2xl uppercase tracking-wide text-off-white">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground-muted">{step.detail}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Why different */}
        <Section background="deep-purple" id="why-different">
          <Container>
            <h2
              className="mb-12 font-heading uppercase text-off-white"
              style={{ fontSize: "var(--text-section)" }}
            >
              What makes RideZones different?
            </h2>
            <div className="grid gap-10 md:grid-cols-3">
              <div>
                <h3 className="mb-3 font-heading text-2xl uppercase tracking-wide text-coral">
                  Dashboards show. This one tells.
                </h3>
                <p className="text-sm leading-relaxed text-foreground-muted">
                  TrainingPeaks and Strava will happily chart your fitness forever without once
                  telling you what&apos;s wrong. RideZones names the weakness, names the fix, and
                  puts it in your week. Clarity is the product.
                </p>
              </div>
              <div>
                <h3 className="mb-3 font-heading text-2xl uppercase tracking-wide text-coral">
                  Coaching logic, not an AI wrapper
                </h3>
                <p className="text-sm leading-relaxed text-foreground-muted">
                  Anthony&apos;s said it on the podcast: don&apos;t hand your training to a chatbot.
                  RideZones is a fixed library of patterns from named coaches — Lorang, Seiler,
                  Wakefield — applied deterministically to your data. Same input, same answer, every
                  time. Nothing improvised.
                </p>
              </div>
              <div>
                <h3 className="mb-3 font-heading text-2xl uppercase tracking-wide text-coral">
                  Your history is the syllabus
                </h3>
                <p className="text-sm leading-relaxed text-foreground-muted">
                  Generic plans start from a template. RideZones starts from the block that made you
                  fastest — what you were actually doing when the form came — and rebuilds the
                  ingredients you&apos;ve let slip.
                </p>
              </div>
            </div>
          </Container>
        </Section>

        {/* Execution */}
        <Section background="charcoal" id="execution">
          <Container>
            <h2
              className="mb-3 font-heading uppercase text-off-white"
              style={{ fontSize: "var(--text-section)" }}
            >
              Not just what to ride. How you rode it.
            </h2>
            <p className="mb-12 max-w-2xl text-foreground-muted">
              Here&apos;s what nobody tells you: most self-coached riders ride their easy days 50%
              too hard and their hard days not hard enough. Every ride in RideZones gets an
              execution score — did it do the job it was supposed to do?
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-3 flex items-baseline justify-between">
                  <h3 className="font-heading text-xl uppercase tracking-wide text-off-white">
                    Threshold 4×8
                  </h3>
                  <span className="font-heading text-3xl text-[#5FD4C8]">8.7</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground-muted">
                  <span className="mr-2 font-semibold uppercase text-[#5FD4C8]">Nailed</span>
                  31 minutes at threshold. That&apos;s the stimulus that moves FTP — repeat it weekly
                  and it compounds.
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-3 flex items-baseline justify-between">
                  <h3 className="font-heading text-xl uppercase tracking-wide text-off-white">
                    &ldquo;Easy&rdquo; lunch loop
                  </h3>
                  <span className="font-heading text-3xl text-[#EFC272]">5.4</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground-muted">
                  <span className="mr-2 font-semibold uppercase text-[#EFC272]">Drifted</span>
                  34% of this ride sat above Zone 2. Too hard to build the base, too easy to count
                  as a session — the grey zone, named.
                </p>
              </div>
            </div>
            <div className="mt-8">
              <Button href="/ridezones/app" variant="outline" dataTrack="ridezones_execution_cta">
                Turn every ride into feedback
              </Button>
            </div>
          </Container>
        </Section>

        {/* Fitness profile */}
        <Section background="deep-purple" id="profile">
          <Container>
            <h2
              className="mb-3 font-heading uppercase text-off-white"
              style={{ fontSize: "var(--text-section)" }}
            >
              Your profile changes with every ride
            </h2>
            <p className="mb-12 max-w-2xl text-foreground-muted">
              Eight systems, scored from what you actually did over the last twelve weeks. Your goal
              decides which weakness matters — and that becomes your focus. The missing ingredient,
              named.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SYSTEMS.map((system) => (
                <div
                  key={system.name}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-5 py-4"
                >
                  <h3 className="font-heading text-xl uppercase tracking-wide text-off-white">
                    {system.name}
                  </h3>
                  <p className="mt-1 text-sm text-foreground-muted">{system.detail}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Race recipe */}
        <Section background="charcoal" id="recipe">
          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2
                  className="mb-3 font-heading uppercase text-off-white"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  Find the recipe behind your best form
                </h2>
                <p className="mb-4 leading-relaxed text-foreground-muted">
                  Somewhere in your history there&apos;s a block where everything clicked — the
                  weeks before your best gran fondo, your breakthrough FTP test, the summer you
                  dropped everyone on the club run. RideZones finds that block and names its
                  ingredients: the hours, the long ride, the key sessions, the easy-day discipline.
                </p>
                <p className="leading-relaxed text-foreground-muted">
                  Then it puts your current riding next to it. Same sessions, same effort,
                  different results? Usually one ingredient went missing. Now you know which one.
                </p>
                <div className="mt-6">
                  <Button href="/ridezones/app" variant="outline" dataTrack="ridezones_recipe_cta">
                    Find your recipe
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground-subtle">
                  Example · best block vs last 6 weeks
                </p>
                <dl className="space-y-3 text-sm">
                  {[
                    { label: "Weekly volume", best: "9.4h", now: "5.8h", state: "Missing" },
                    { label: "Long ride", best: "3.6h avg", now: "2.3h avg", state: "Missing" },
                    { label: "Key sessions / week", best: "2.0", now: "1.1", state: "Slipping" },
                    { label: "Easy riding share", best: "82%", now: "64%", state: "Slipping" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-4 border-b border-white/5 pb-3"
                    >
                      <dt className="text-foreground-muted">{row.label}</dt>
                      <dd className="flex items-center gap-4">
                        <span className="text-off-white">{row.best}</span>
                        <span className="text-foreground-subtle">→</span>
                        <span className="text-off-white">{row.now}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            row.state === "Missing"
                              ? "bg-coral/15 text-coral"
                              : "bg-[#D99A2B]/15 text-[#EFC272]"
                          }`}
                        >
                          {row.state}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Container>
        </Section>

        {/* The intelligence behind it */}
        <Section background="deep-purple" grain id="intelligence">
          <Container width="narrow">
            <h2
              className="mb-6 font-heading uppercase text-off-white"
              style={{ fontSize: "var(--text-section)" }}
            >
              The access powers it. The analysis is about you.
            </h2>
            <p className="mb-4 leading-relaxed text-foreground-muted">
              Anthony Walsh has spent years asking the best coaches in the sport how training
              actually works — Dan Lorang, who coaches Grand Tour winners. Professor Stephen Seiler,
              whose research defined polarised training. John Wakefield, prescribing torque
              intervals at Bora-Hansgrohe before the science caught up. That&apos;s the Roadman
              podcast: 100 million downloads of asking better questions.
            </p>
            <p className="mb-4 leading-relaxed text-foreground-muted">
              RideZones doesn&apos;t give you their riders&apos; training. It uses their patterns to
              read <em>your</em> data — your zones, your history, your goal — and tells you the
              thing a good coach would tell you in the first ten minutes: here&apos;s what&apos;s
              actually going on, and here&apos;s what we do about it.
            </p>
            <p className="leading-relaxed text-off-white">
              You&apos;re not done yet. Your data will prove it.
            </p>
          </Container>
        </Section>

        {/* Pricing */}
        <Section background="charcoal" id="pricing">
          <Container>
            <h2
              className="mb-12 text-center font-heading uppercase text-off-white"
              style={{ fontSize: "var(--text-section)" }}
            >
              Start free. Add the coaching loop when you&apos;re ready.
            </h2>
            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-8">
                <h3 className="font-heading text-3xl uppercase text-off-white">RideZones</h3>
                <p className="mt-1 font-heading text-4xl text-coral">Free</p>
                <ul className="mt-6 space-y-3 text-sm text-foreground-muted">
                  {[
                    "Full analysis dashboard — fitness, fatigue, form",
                    "Power and heart-rate zones from your FTP",
                    "Eight-system fitness profile with your named focus",
                    "Execution score and coach note on every ride",
                    "Race recipe — your best block vs now",
                    "Goal-specific training week with watt targets",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="text-coral" aria-hidden>
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button href="/ridezones/app" size="lg" className="w-full" dataTrack="ridezones_pricing_free">
                    Start your analysis
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-coral/40 bg-coral/[0.05] p-8">
                <h3 className="font-heading text-3xl uppercase text-off-white">
                  The coaching loop
                </h3>
                <p className="mt-1 font-heading text-4xl text-coral">Not Done Yet</p>
                <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                  Software reads the data. Humans close the loop. The Not Done Yet community is
                  where the analysis turns into accountability:
                </p>
                <ul className="mt-4 space-y-3 text-sm text-foreground-muted">
                  {[
                    "Weekly live calls with Anthony — bring your RideZones profile",
                    "Structured training plans, adjusted by real coaches",
                    "Masterclasses from the podcast's expert network",
                    "A community of serious riders holding the line with you",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="text-coral" aria-hidden>
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button
                    href={SKOOL_URL}
                    external
                    variant="outline"
                    size="lg"
                    className="w-full"
                    dataTrack="ridezones_pricing_ndy"
                  >
                    Join Not Done Yet
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* FAQ */}
        <Section background="deep-purple" id="faq">
          <Container width="narrow">
            <h2
              className="mb-10 font-heading uppercase text-off-white"
              style={{ fontSize: "var(--text-section)" }}
            >
              Questions, answered
            </h2>
            <div className="space-y-8">
              {FAQS.map((faq) => (
                <div key={faq.question}>
                  <h3 className="mb-2 font-heading text-2xl uppercase tracking-wide text-off-white">
                    {faq.question}
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground-muted">{faq.answer}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 rounded-lg border border-white/10 bg-white/[0.03] p-8 text-center">
              <h3 className="font-heading text-3xl uppercase text-off-white">
                Your history already knows what&apos;s missing
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-foreground-muted">
                Two minutes to set up. Free. And the honest read on your riding you&apos;ve never
                had.
              </p>
              <div className="mt-6">
                <Button href="/ridezones/app" size="lg" dataTrack="ridezones_footer_start">
                  Start your analysis
                </Button>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

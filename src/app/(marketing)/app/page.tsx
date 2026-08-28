import type { Metadata } from "next";
import Link from "next/link";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { Container, Footer, Header, Section } from "@/components/layout";
import { Card, ScrollReveal } from "@/components/ui";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";

const APP_PATH = "/app";
const APP_URL = `${SITE_ORIGIN}${APP_PATH}`;
const APP_DESCRIPTION =
  "A cyclist-specific strength and recovery app that fits 30, 45 or 60-minute gym work around your real riding week, protects key rides and explains every readiness adjustment.";
const STRUCTURED_IMAGE_URL = `${SITE_ORIGIN}/api/og/blog-hero?title=${encodeURIComponent("Cycling Strength & Recovery App")}&pillar=strength`;

export const metadata: Metadata = {
  title: "Cycling Strength & Recovery App | Roadman Cycling",
  description: APP_DESCRIPTION,
  alternates: { canonical: APP_URL },
  openGraph: {
    title: "Strength That Fits Your Cycling. Recovery That Has a Job.",
    description: APP_DESCRIPTION,
    type: "website",
    url: APP_URL,
    siteName: "Roadman Cycling",
    images: [
      {
        url: STRUCTURED_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Roadman Cycling strength and recovery app",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cycling Strength & Recovery App | Roadman Cycling",
    description: APP_DESCRIPTION,
    images: [STRUCTURED_IMAGE_URL],
  },
};

const FEATURES = [
  {
    number: "01",
    title: "Your riding week comes first",
    body: "Add the rides you already follow, including duration, demand and priority. Roadman uses that context to place strength work without silently rewriting your bike plan.",
  },
  {
    number: "02",
    title: "30, 45 or 60-minute strength",
    body: "Choose a realistic session length and execute a cyclist-specific prescription with previous-performance context, simple set logging and clear next-exposure targets.",
  },
  {
    number: "03",
    title: "Readiness with guardrails",
    body: "A short check-in uses sleep, energy, soreness and recent bike load. It can hold or reduce session volume; it does not use a bad morning to invent a new programme or add load.",
  },
  {
    number: "04",
    title: "Important rides stay protected",
    body: "The calendar identifies key-ride conflicts before the gym session begins. Strength is adjusted around the cycling that matters instead of competing with it by accident.",
  },
  {
    number: "05",
    title: "Progression you can inspect",
    body: "Load, reps, target RIR, soreness, joint comfort and completed cycling context feed versioned rules. Every material change gets a plain-language reason.",
  },
  {
    number: "06",
    title: "Recovery with a specific job",
    body: "Sleep opportunity, guided downshift, mobility and optional recovery modalities are placed only when the week gives them a reason—not as a pile of wellness chores.",
  },
] as const;

const HOW_IT_WORKS = [
  {
    step: "Map",
    title: "Show Roadman the week",
    body: "Add your current rides, priority days, available gym time, equipment and movement constraints.",
  },
  {
    step: "Place",
    title: "Fit strength around cycling",
    body: "The app places a coach-reviewed strength block around the work already on the bike calendar.",
  },
  {
    step: "Check",
    title: "Read the day honestly",
    body: "Sleep, energy, leg soreness, life stress and recent riding determine whether today's volume should hold or reduce.",
  },
  {
    step: "Build",
    title: "Progress without gym debt",
    body: "Log the work, review how it felt and carry the exact decision into the next exposure. Missed work is not stacked as punishment.",
  },
] as const;

const RECOVERY_JOBS = [
  "Protect a sleep opportunity",
  "Downshift after a late hard session",
  "Place mobility around a named restriction",
  "Use naps without ignoring sleep inertia",
  "Separate cold-water relief from strength adaptation",
  "Treat massage, rolling and compression as optional tools",
] as const;

const FAQS = [
  {
    question: "What is Roadman's cycling strength and recovery app?",
    answer:
      "It is an upcoming iPhone app for serious amateur and masters cyclists. It coordinates cyclist-specific strength sessions and recovery work with the riding week the athlete already follows, then explains how readiness and feedback change the next action.",
  },
  {
    question: "Does the app replace my cycling coach or training plan?",
    answer:
      "No. The public app uses your rides as protected context for strength and recovery. It does not silently rewrite an external cycling plan, change FTP or expose Roadman's private cycling-coaching product.",
  },
  {
    question: "How does daily training readiness work?",
    answer:
      "The check-in considers sleep, energy, leg soreness and recent bike load alongside the next important ride. For the current strength prescription it can hold or reduce working-set volume, while load and target RIR remain governed by the reviewed progression rules.",
  },
  {
    question: "Is the app an AI cycling coach?",
    answer:
      "No. Live training decisions come from versioned, testable and coach-reviewed rules. AI may eventually help explain a decision or organise feedback, but it does not invent the strength prescription.",
  },
  {
    question: "Is the app suitable for cyclists over 40?",
    answer:
      "Yes. It is being built for serious amateur and masters cyclists, but age alone does not prescribe the session. Training history, riding load, available time, equipment, soreness and joint comfort all matter.",
  },
  {
    question: "Which recovery methods are included?",
    answer:
      "The recovery system can place or explain sleep opportunity, guided downshift, mobility, naps and optional methods such as heat, cold water, massage, foam rolling and compression. Each method carries a practical boundary so it is not presented as a cure or guaranteed performance boost.",
  },
  {
    question: "When will the Roadman app launch and what will it cost?",
    answer:
      "Roadman is targeting an iPhone launch within the next two months. The final product name, release date and subscription price have not been announced. Early-access subscribers will receive beta and launch updates first.",
  },
] as const;

const AUDIENCES = [
  "You ride four to twelve hours a week and need the gym to support—not flatten—the bike.",
  "You are returning to strength work and want progression without guessing at every load.",
  "You are over 40 and need recovery decisions based on your response, not a blanket age rule.",
  "You already have a cycling plan and want strength and recovery fitted around it.",
] as const;

function EarlyAccessCapture({ source }: { source: string }) {
  return (
    <EmailCapture
      heading="GET EARLY ACCESS"
      subheading="Get beta, launch and product-name updates first. Joining also includes Roadman's Saturday Spin newsletter; one click unsubscribes."
      buttonText="JOIN EARLY ACCESS"
      source={source}
      className="border-coral/20 bg-charcoal/80 text-left shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
    />
  );
}

export default function AppLandingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `${APP_URL}#webpage`,
              url: APP_URL,
              name: "Roadman Cycling strength and recovery app",
              description: APP_DESCRIPTION,
              isPartOf: { "@id": ENTITY_IDS.website },
              about: { "@id": `${APP_URL}#software` },
              primaryImageOfPage: {
                "@type": "ImageObject",
                url: STRUCTURED_IMAGE_URL,
              },
              dateModified: "2026-08-28",
            },
            {
              "@type": ["SoftwareApplication", "MobileApplication"],
              "@id": `${APP_URL}#software`,
              name: "Roadman Cycling strength and recovery app",
              url: APP_URL,
              description: APP_DESCRIPTION,
              applicationCategory: "SportsApplication",
              operatingSystem: "iOS",
              publisher: { "@id": ENTITY_IDS.organization },
              image: STRUCTURED_IMAGE_URL,
              featureList: FEATURES.map((feature) => feature.title),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: SITE_ORIGIN,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Cycling strength and recovery app",
                  item: APP_URL,
                },
              ],
            },
          ],
        }}
      />
      <FAQSchema faqs={[...FAQS]} />
      <Header />

      <main id="main-content">
        <Section
          background="deep-purple"
          grain
          className="min-h-[88vh] pt-32 md:pt-40"
        >
          <div className="pointer-events-none absolute -right-20 top-12 h-80 w-80 rounded-full bg-coral/10 blur-[100px]" />
          <div className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-purple/30 blur-[120px]" />
          <Container className="relative">
            <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
              <div>
                <p className="mb-6 font-heading text-sm tracking-[0.24em] text-coral">
                  COMING TO IPHONE · EARLY ACCESS OPEN
                </p>
                <h1
                  className="max-w-4xl font-heading leading-[0.92] text-off-white"
                  style={{ fontSize: "clamp(3.25rem, 7.2vw, 7.4rem)" }}
                >
                  STRENGTH THAT FITS YOUR CYCLING.
                  <span className="mt-3 block text-coral">
                    RECOVERY THAT HAS A JOB.
                  </span>
                </h1>
                <p className="mt-8 max-w-2xl text-lg leading-relaxed text-foreground-muted md:text-xl">
                  Roadman is building a cyclist-specific strength and recovery
                  app around the week you actually ride. It protects the bike,
                  progresses the gym and tells you why today&apos;s work changed.
                </p>
                <div className="mt-9 max-w-xl">
                  <EarlyAccessCapture source="roadman-app-waitlist-hero" />
                </div>
                <p className="mt-4 max-w-xl text-xs leading-relaxed text-foreground-subtle">
                  The final product name, launch date and subscription price
                  have not been announced. This page will remain the permanent
                  Roadman app address.
                </p>
              </div>

              <div className="relative mx-auto w-full max-w-[500px]">
                <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-coral/20 via-purple/10 to-transparent blur-2xl" />
                <div className="relative rounded-[2.2rem] border border-white/15 bg-charcoal/95 p-3 shadow-[0_35px_100px_rgba(0,0,0,0.55)]">
                  <div className="rounded-[1.7rem] border border-white/10 bg-deep-purple p-5 md:p-7">
                    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                      <div>
                        <p className="text-xs font-semibold tracking-[0.2em] text-coral">
                          TODAY
                        </p>
                        <p className="mt-1 text-sm text-foreground-muted">
                          One clear next action
                        </p>
                      </div>
                      <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                        Key ride protected
                      </span>
                    </div>

                    <div className="mt-5 rounded-2xl border border-coral/25 bg-coral/10 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-heading text-2xl text-off-white">
                          FOUNDATION B
                        </p>
                        <span className="text-sm font-semibold text-coral">
                          45 MIN
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                        Cyclist-specific strength placed around tomorrow&apos;s
                        priority ride.
                      </p>
                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-2/3 rounded-full bg-coral" />
                      </div>
                      <div className="mt-3 flex justify-between text-xs text-foreground-subtle">
                        <span>Previous work visible</span>
                        <span>4 movements</span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                        <p className="text-xs tracking-[0.16em] text-foreground-subtle">
                          READINESS
                        </p>
                        <p className="mt-2 font-heading text-xl text-off-white">
                          CHECK THE DAY
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-foreground-muted">
                          Sleep · energy · soreness · bike load
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                        <p className="text-xs tracking-[0.16em] text-foreground-subtle">
                          RECOVERY
                        </p>
                        <p className="mt-2 font-heading text-xl text-off-white">
                          DOWNSHIFT
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-foreground-muted">
                          One action, with a reason and boundary
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple/40 text-sm font-bold text-off-white">
                        R
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-off-white">
                          Explain every change
                        </p>
                        <p className="text-xs text-foreground-subtle">
                          Reviewed rules, not a black-box score
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="max-w-3xl">
              <p className="font-heading text-sm tracking-[0.2em] text-coral">
                THE PRODUCT PROMISE
              </p>
              <h2
                className="mt-4 font-heading text-off-white"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE BIKE IS THE POINT.
                <span className="block text-coral">THE GYM SUPPORTS IT.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-foreground-muted">
                Most strength apps treat cycling as optional cardio. Most
                cycling apps leave strength and recovery in separate tabs—or
                outside the product entirely. Roadman starts with the complete
                week and makes one coordinated decision.
              </p>
            </ScrollReveal>

            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, index) => (
                <ScrollReveal
                  key={feature.number}
                  direction="up"
                  delay={index * 0.04}
                >
                  <Card className="h-full p-6 md:p-7" hoverable={false}>
                    <p className="font-heading text-sm tracking-[0.18em] text-coral">
                      {feature.number}
                    </p>
                    <h3 className="mt-4 font-heading text-2xl text-off-white">
                      {feature.title}
                    </h3>
                    <p className="mt-3 leading-relaxed text-foreground-muted">
                      {feature.body}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="off-white" id="how-it-works">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
              <div>
                <p className="font-heading text-sm tracking-[0.2em] text-coral">
                  HOW IT WORKS
                </p>
                <h2
                  className="mt-4 font-heading text-charcoal"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  ONE WEEK.
                  <span className="block text-coral">ONE NEXT ACTION.</span>
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-charcoal/70">
                  The app does not reward accumulating sessions. It helps you
                  execute the right amount of work, in the right place, then
                  records enough context to make the next decision better.
                </p>
              </div>

              <div className="space-y-4">
                {HOW_IT_WORKS.map((item, index) => (
                  <div
                    key={item.step}
                    className="grid gap-4 rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm sm:grid-cols-[56px_1fr] sm:p-6"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-deep-purple font-heading text-lg text-coral">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">
                        {item.step}
                      </p>
                      <h3 className="mt-1 font-heading text-2xl text-charcoal">
                        {item.title}
                      </h3>
                      <p className="mt-2 leading-relaxed text-charcoal/65">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        <Section background="deep-purple">
          <Container>
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 md:p-10">
                <p className="font-heading text-sm tracking-[0.2em] text-coral">
                  RECOVERY WITH BOUNDARIES
                </p>
                <h2
                  className="mt-4 font-heading text-off-white"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  NO MAGIC SCORE.
                  <span className="block text-coral">NO WELLNESS CHORE LIST.</span>
                </h2>
                <p className="mt-5 leading-relaxed text-foreground-muted">
                  A recovery tool belongs in the week only when it has a job.
                  Roadman states what a method may help, where the evidence is
                  limited and when the sensible action is simply more sleep or
                  less work.
                </p>
                <ul className="mt-7 space-y-3">
                  {RECOVERY_JOBS.map((job) => (
                    <li
                      key={job}
                      className="flex items-start gap-3 text-foreground-muted"
                    >
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-coral" />
                      <span>{job}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-coral/20 bg-coral/[0.07] p-7 md:p-10">
                <p className="font-heading text-sm tracking-[0.2em] text-coral">
                  NOT A GENERIC AI COACH
                </p>
                <h2
                  className="mt-4 font-heading text-off-white"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  THE RULES ARE REVIEWED.
                  <span className="block text-coral">THE REASON IS VISIBLE.</span>
                </h2>
                <p className="mt-5 leading-relaxed text-foreground-muted">
                  Live prescriptions come from versioned coaching rules. The
                  system records the session, readiness inputs, completed work
                  and the reason for any material change so the decision can be
                  reproduced instead of hidden behind a confidence score.
                </p>
                <div className="mt-7 rounded-2xl border border-white/10 bg-charcoal/50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">
                    The boundary
                  </p>
                  <p className="mt-3 text-lg leading-relaxed text-off-white">
                    AI may explain or organise. It does not invent the training
                    dose, diagnose an injury or silently change the rider&apos;s
                    cycling plan.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              <div>
                <p className="font-heading text-sm tracking-[0.2em] text-coral">
                  BUILT FOR THE SERIOUS AMATEUR
                </p>
                <h2
                  className="mt-4 font-heading text-off-white"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  THIS IS LIKELY FOR YOU IF…
                </h2>
              </div>
              <ul className="grid gap-4">
                {AUDIENCES.map((audience) => (
                  <li
                    key={audience}
                    className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-lg leading-relaxed text-foreground-muted"
                  >
                    <span className="mt-1 font-heading text-coral">✓</span>
                    <span>{audience}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </Section>

        <Section background="off-white" id="faq">
          <Container width="narrow">
            <div className="text-center">
              <p className="font-heading text-sm tracking-[0.2em] text-coral">
                QUESTIONS BEFORE LAUNCH
              </p>
              <h2
                className="mt-4 font-heading text-charcoal"
                style={{ fontSize: "var(--text-section)" }}
              >
                CYCLING STRENGTH &amp; RECOVERY APP FAQ
              </h2>
            </div>
            <div className="mt-10 divide-y divide-charcoal/10 border-y border-charcoal/10">
              {FAQS.map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-xl text-charcoal">
                    {faq.question}
                    <span className="text-coral transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 pr-8 leading-relaxed text-charcoal/70">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" id="early-access">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-heading text-sm tracking-[0.2em] text-coral">
                THE NAME CAN WAIT. THE LIST DOES NOT HAVE TO.
              </p>
              <h2
                className="mt-4 font-heading text-off-white"
                style={{ fontSize: "var(--text-section)" }}
              >
                BE FIRST INTO THE ROADMAN APP.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-foreground-muted">
                Join the early-access list for product-name, beta, launch and
                pricing updates. We will not pretend the final details are set
                before they are.
              </p>
              <div className="mx-auto mt-8 max-w-xl">
                <EarlyAccessCapture source="roadman-app-waitlist-bottom" />
              </div>
            </div>
          </Container>
        </Section>

        <Section background="charcoal" className="py-14 md:py-18">
          <Container>
            <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-foreground-subtle">
              Explore the knowledge behind the product
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-x-7 gap-y-4 text-sm">
              <Link
                href="/topics/cycling-strength-conditioning"
                className="text-foreground-muted transition-colors hover:text-coral"
              >
                Cycling strength research
              </Link>
              <Link
                href="/topics/cycling-recovery"
                className="text-foreground-muted transition-colors hover:text-coral"
              >
                Cycling recovery research
              </Link>
              <Link
                href="/tools/training-readiness"
                className="text-foreground-muted transition-colors hover:text-coral"
              >
                Free readiness check
              </Link>
              <Link
                href="/tools/recovery-screen"
                className="text-foreground-muted transition-colors hover:text-coral"
              >
                Recovery screen
              </Link>
              <Link
                href="/strength-training"
                className="text-foreground-muted transition-colors hover:text-coral"
              >
                Current 12-week strength plan
              </Link>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

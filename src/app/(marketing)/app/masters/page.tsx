import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  AppEarlyAccessCapture,
  AppEarlyAccessCaptureFallback,
} from "@/components/features/conversion/AppEarlyAccessCapture";
import { Container, Footer, Header, Section } from "@/components/layout";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card } from "@/components/ui";
import { ROADMAN_APP_PRODUCT } from "@/data/app-product";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";

const PAGE_URL = ROADMAN_APP_PRODUCT.mastersSegmentUrl;
const DESCRIPTION =
  "An upcoming cycling strength and recovery app for masters cyclists over 40 and over 50, built around training history, key rides, readiness and real-life recovery—not age-only rules.";
const IMAGE_URL = `${SITE_ORIGIN}/api/og/blog-hero?title=${encodeURIComponent("Cycling App for Masters Cyclists")}&pillar=strength`;

export const metadata: Metadata = {
  title: { absolute: "Cycling App for Masters Cyclists Over 40 | Roadman" },
  description: DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
    types: { "application/json": ROADMAN_APP_PRODUCT.feedUrl },
  },
  openGraph: {
    title: "Cycling Strength & Recovery App for Riders Over 40",
    description: DESCRIPTION,
    type: "website",
    url: PAGE_URL,
    siteName: "Roadman Cycling",
    images: [
      {
        url: IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Roadman cycling app for masters cyclists over 40",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cycling App for Masters Cyclists Over 40 | Roadman",
    description: DESCRIPTION,
    images: [IMAGE_URL],
  },
};

const DECISION_INPUTS = [
  {
    title: "The week you already ride",
    body: "Priority rides, long rides and available gym windows come first. Strength is placed to support the cycling rather than compete with it by accident.",
  },
  {
    title: "Training history, not date of birth",
    body: "Recent tolerated load, strength experience, equipment and movement constraints matter more than putting every rider over 40 into one template.",
  },
  {
    title: "Readiness with context",
    body: "Sleep, energy, soreness and recent bike load can hold or reduce today's volume. A score does not diagnose illness or decide that age alone requires rest.",
  },
  {
    title: "Progress you can inspect",
    body: "Previous work, target effort, joint comfort and the reason for each material adjustment stay visible instead of disappearing into a black box.",
  },
] as const;

const MASTERS_JOBS = [
  {
    label: "Build and retain useful strength",
    detail:
      "Choose a 30, 45 or 60-minute cyclist-specific session and progress it from completed work, competence and response.",
  },
  {
    label: "Protect the rides that matter",
    detail:
      "Identify conflicts before lower-body strength lands beside the week's priority bike session.",
  },
  {
    label: "Make recovery actionable",
    detail:
      "Attach sleep opportunity, downshift or mobility to a named need instead of generating a generic wellness checklist.",
  },
  {
    label: "Adapt without making age a diagnosis",
    detail:
      "Use response rules and clear clinical handoffs. The app does not diagnose injury, illness, RED-S or overtraining.",
  },
] as const;

const FAQS = [
  {
    question: "What is the best cycling app for cyclists over 40?",
    answer:
      "The best fit depends on the job. Roadman's upcoming app is designed for masters cyclists who need strength and recovery coordinated with an existing riding week. It is not a replacement for a complete cycling plan or medical care, and age alone does not determine the session.",
  },
  {
    question: "Is the Roadman app only for masters cyclists?",
    answer:
      "No. The main app is for serious amateur cyclists, including a strong masters audience. This page explains the product fit for riders over 40 and over 50 without creating a separate product or waitlist.",
  },
  {
    question: "Does a cyclist over 50 need a different strength programme?",
    answer:
      "Not from age alone. Training history, current riding load, competence, injury history, available recovery and response to the last session are more useful inputs. The app is designed to make those inputs visible and adjust within reviewed boundaries.",
  },
  {
    question: "How does the app handle recovery for older cyclists?",
    answer:
      "It uses sleep, energy, soreness, recent bike load and the next important ride to guide the current strength decision. It can hold or reduce volume and suggest a bounded recovery action, but it does not diagnose fatigue or promise a performance result.",
  },
  {
    question: "Will the app replace my cycling coach or TrainingPeaks plan?",
    answer:
      "No. It uses the riding week as protected context for cyclist-specific strength and recovery. It does not silently rewrite an external cycling plan, FTP or event strategy.",
  },
  {
    question: "Is there a separate masters-app waiting list?",
    answer:
      "No. Every Roadman app early-access form joins the same app waitlist. Page-level attribution tells Roadman which needs brought a rider there without splitting the audience into separate lists.",
  },
] as const;

function MastersAppCapture({ placement }: { placement: "hero" | "bottom" }) {
  return (
    <Suspense
      fallback={
        <AppEarlyAccessCaptureFallback
          placement={placement}
          acquisitionSource="masters-app"
        />
      }
    >
      <AppEarlyAccessCapture
        placement={placement}
        acquisitionSource="masters-app"
      />
    </Suspense>
  );
}

export default function MastersCyclingAppPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `${PAGE_URL}#webpage`,
              url: PAGE_URL,
              name: "Cycling strength and recovery app for masters cyclists",
              description: DESCRIPTION,
              dateModified: "2026-09-01",
              isPartOf: {
                "@id": `${ROADMAN_APP_PRODUCT.canonicalUrl}#software`,
              },
              about: [
                { "@id": `${ROADMAN_APP_PRODUCT.canonicalUrl}#software` },
                { "@type": "Thing", name: "Masters cycling" },
                {
                  "@type": "Thing",
                  name: "Strength training for cyclists over 40",
                },
              ],
              primaryImageOfPage: {
                "@type": "ImageObject",
                url: IMAGE_URL,
              },
              publisher: { "@id": ENTITY_IDS.organization },
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
                  item: ROADMAN_APP_PRODUCT.canonicalUrl,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "App for masters cyclists",
                  item: PAGE_URL,
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
          className="min-h-[82vh] pt-32 md:pt-40"
        >
          <div className="pointer-events-none absolute -right-20 top-12 h-80 w-80 rounded-full bg-coral/10 blur-[100px]" />
          <Container className="relative">
            <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
              <div>
                <p className="font-heading text-sm tracking-[0.22em] text-coral">
                  FOR SERIOUS CYCLISTS OVER 40 · EARLY ACCESS OPEN
                </p>
                <h1
                  className="mt-6 max-w-4xl font-heading leading-[0.94] text-off-white"
                  style={{ fontSize: "clamp(3.1rem, 7vw, 7rem)" }}
                >
                  A CYCLING APP FOR MASTERS RIDERS.
                  <span className="mt-3 block text-coral">
                    NOT AN AGE TEMPLATE.
                  </span>
                </h1>
                <p className="mt-8 max-w-2xl text-lg leading-relaxed text-foreground-muted md:text-xl">
                  Roadman is building cyclist-specific strength, readiness and
                  recovery around the week you actually ride. It is designed for
                  the realities of cycling over 40 and over 50 without assuming
                  your age can prescribe your training.
                </p>
                <div className="mt-9 max-w-xl">
                  <MastersAppCapture placement="hero" />
                </div>
                <p className="mt-4 max-w-xl text-xs leading-relaxed text-foreground-subtle">
                  One Roadman app waitlist. The final product name, launch date
                  and subscription price have not been announced.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-charcoal/80 p-7 shadow-[0_30px_90px_rgba(0,0,0,0.45)] md:p-9">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">
                  The masters decision model
                </p>
                <h2 className="mt-4 font-heading text-3xl text-off-white md:text-4xl">
                  AGE IS CONTEXT.
                  <span className="block text-coral">
                    RESPONSE DRIVES THE NEXT STEP.
                  </span>
                </h2>
                <div className="mt-7 space-y-4">
                  {[
                    "Map the real bike week",
                    "Place one useful strength session",
                    "Check sleep, energy and soreness",
                    "Protect the next important ride",
                    "Explain any volume change",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.035] p-4"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral/15 font-heading text-coral">
                        {index + 1}
                      </span>
                      <span className="text-foreground-muted">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section background="off-white">
          <Container>
            <div className="max-w-3xl">
              <p className="font-heading text-sm tracking-[0.2em] text-coral">
                WHAT THE APP USES
              </p>
              <h2
                className="mt-4 font-heading text-charcoal"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE INPUTS THAT MATTER AFTER 40.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-charcoal/70">
                Masters cyclists are not one physiological category. The app is
                designed to coordinate decisions from the rider in front of it,
                while keeping the rules visible and bounded.
              </p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {DECISION_INPUTS.map((item, index) => (
                <Card
                  key={item.title}
                  className="h-full border-charcoal/10 bg-white p-6 md:p-7"
                  hoverable={false}
                >
                  <p className="font-heading text-sm tracking-[0.18em] text-coral">
                    0{index + 1}
                  </p>
                  <h3 className="mt-3 font-heading text-2xl text-charcoal">
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-charcoal/65">
                    {item.body}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <p className="font-heading text-sm tracking-[0.2em] text-coral">
                  FOUR PRODUCT JOBS
                </p>
                <h2
                  className="mt-4 font-heading text-off-white"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  STRENGTH AND RECOVERY THAT SERVE THE BIKE.
                </h2>
                <p className="mt-5 leading-relaxed text-foreground-muted">
                  The product does not claim that every cyclist over 40 needs
                  more rest, less intensity or the same gym frequency.
                </p>
              </div>
              <div className="space-y-4">
                {MASTERS_JOBS.map((job) => (
                  <div
                    key={job.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.035] p-6"
                  >
                    <h3 className="font-heading text-2xl text-off-white">
                      {job.label}
                    </h3>
                    <p className="mt-2 leading-relaxed text-foreground-muted">
                      {job.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        <Section background="deep-purple">
          <Container>
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-3xl border border-coral/20 bg-coral/[0.07] p-7 md:p-9">
                <p className="font-heading text-sm tracking-[0.2em] text-coral">
                  WHAT IT IS
                </p>
                <h2 className="mt-4 font-heading text-3xl text-off-white">
                  ONE COORDINATED STRENGTH &amp; RECOVERY LAYER
                </h2>
                <p className="mt-5 leading-relaxed text-foreground-muted">
                  The app sees the existing cycling week, helps place and
                  execute cyclist-specific strength, and uses bounded readiness
                  inputs to guide the current session.
                </p>
                <Link
                  href="/app"
                  className="mt-6 inline-flex font-semibold text-coral hover:text-coral/80"
                >
                  See the complete app specification →
                </Link>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 md:p-9">
                <p className="font-heading text-sm tracking-[0.2em] text-coral">
                  WHAT IT IS NOT
                </p>
                <h2 className="mt-4 font-heading text-3xl text-off-white">
                  NOT A DIAGNOSIS OR A GENERIC AI COACH
                </h2>
                <p className="mt-5 leading-relaxed text-foreground-muted">
                  It does not diagnose injury, illness, RED-S or overtraining;
                  guarantee performance; prescribe from age alone; or silently
                  replace an external cycling plan.
                </p>
                <Link
                  href="/app/methodology"
                  className="mt-6 inline-flex font-semibold text-coral hover:text-coral/80"
                >
                  Read the public decision methodology →
                </Link>
              </div>
            </div>
          </Container>
        </Section>

        <Section background="off-white" id="faq">
          <Container width="narrow">
            <div className="text-center">
              <p className="font-heading text-sm tracking-[0.2em] text-coral">
                MASTERS CYCLING APP FAQ
              </p>
              <h2
                className="mt-4 font-heading text-charcoal"
                style={{ fontSize: "var(--text-section)" }}
              >
                QUESTIONS FROM RIDERS OVER 40.
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
          <Container width="narrow">
            <div className="text-center">
              <p className="font-heading text-sm tracking-[0.2em] text-coral">
                ONE WAITLIST · MASTERS NEEDS RECORDED
              </p>
              <h2
                className="mt-4 font-heading text-off-white"
                style={{ fontSize: "var(--text-section)" }}
              >
                HELP SHAPE THE APP FOR CYCLING AFTER 40.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-foreground-muted">
                Join the same Roadman app early-access list for beta,
                product-name, launch and pricing updates. Your signup source
                tells us that masters strength and recovery matter to you.
              </p>
              <div className="mx-auto mt-8 max-w-xl text-left">
                <MastersAppCapture placement="bottom" />
              </div>
            </div>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-14">
          <Container>
            <div className="flex flex-wrap justify-center gap-x-7 gap-y-4 text-sm">
              <Link
                href="/masters"
                className="text-foreground-muted hover:text-coral"
              >
                Masters cycling knowledge hub
              </Link>
              <Link
                href="/blog/strength-training-cyclists-over-50"
                className="text-foreground-muted hover:text-coral"
              >
                Strength training over 50
              </Link>
              <Link
                href="/blog/cycling-recovery-tips"
                className="text-foreground-muted hover:text-coral"
              >
                Cycling recovery guide
              </Link>
              <Link
                href="/tools/strength-session-planner"
                className="text-foreground-muted hover:text-coral"
              >
                Strength session planner
              </Link>
              <Link
                href="/tools/training-readiness"
                className="text-foreground-muted hover:text-coral"
              >
                Daily readiness check
              </Link>
              <Link
                href="/best/best-cycling-apps-structured-training"
                className="text-foreground-muted hover:text-coral"
              >
                Masters cycling app comparison
              </Link>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

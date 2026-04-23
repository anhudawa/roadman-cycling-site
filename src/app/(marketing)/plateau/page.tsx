import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { diagnosticSubmissions } from "@/lib/db/schema";
import { Container, Footer, Header, Section } from "@/components/layout";
import { GradientText, ScrollReveal } from "@/components/ui";
import { JsonLd, FAQPageJsonLd } from "@/components/seo/JsonLd";
import { DiagnosticFlow } from "@/components/features/diagnostic/DiagnosticFlow";
import { HeroAgePicker } from "@/components/features/diagnostic/HeroAgePicker";
import { MetaPixel } from "@/components/features/diagnostic/MetaPixel";
import { StickyCta } from "@/components/features/diagnostic/StickyCta";
import { PROFILE_LABELS } from "@/lib/diagnostic/profiles";
import type { Profile } from "@/lib/diagnostic/types";

/**
 * /plateau — stripped-down cold-traffic landing. The ad does the
 * selling; this page's only job is to get the user into the quiz.
 *
 * Page shape: hero (with embedded Q1) → four profile teasers →
 * diagnostic → compact FAQ → footer. Previous version had 10
 * sections; this has 4. Sub-2-scroll reach to the quiz on mobile.
 */

export const metadata: Metadata = {
  title: "FTP Stuck for a Year? The Masters Plateau Diagnostic",
  description:
    "A 4-minute diagnostic for cyclists 35+. Tap your age and find out which of four specific reasons is why your FTP has stalled — and the exact fix.",
  alternates: { canonical: "https://roadmancycling.com/plateau" },
  openGraph: {
    title: "FTP Stuck for a Year? Find Out Which of Four Reasons Is You.",
    description:
      "A 4-minute diagnostic for cyclists 35+. One specific answer for why your progress has stalled — and the exact fix.",
    type: "website",
    url: "https://roadmancycling.com/plateau",
  },
  robots: { index: true, follow: true },
};

export const revalidate = 3600;

const PROFILE_TEASERS: Array<{ profile: Profile; teaser: string }> = [
  {
    profile: "underRecovered",
    teaser:
      "Your training is fine. Your recovery isn't. First one to check if life is loud right now.",
  },
  {
    profile: "polarisation",
    teaser:
      "You live in the grey zone. Not easy enough to recover, not hard enough to drive adaptation.",
  },
  {
    profile: "strengthGap",
    teaser:
      "The engine's fine. The chassis isn't. Almost universal after 40 if you're not lifting.",
  },
  {
    profile: "fuelingDeficit",
    teaser:
      "You're training hungry. The body can't build power when it's managing a shortage.",
  },
];

const FAQS = [
  {
    q: "How long does it take?",
    a: "Four minutes. Twelve single-tap questions and a quick demographics round.",
  },
  {
    q: "Is it free?",
    a: "Yes, completely. No card, no trial, no paywall.",
  },
  {
    q: "Will I be added to a list?",
    a: "Yes — so we can email your diagnosis. One-click unsubscribe, honoured within the hour.",
  },
  {
    q: "What if my diagnosis doesn't sound like me?",
    a: "Reply to the email and I'll personally re-run it. The diagnostic is only useful if it's right. — Anthony",
  },
];

function DiagnosticSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[640px]">
      <div className="h-1 w-full bg-white/10 rounded-full" />
      <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-6 md:p-10 min-h-[340px]" />
    </div>
  );
}

async function recentSubmissionCount(): Promise<number | null> {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [row] = await db
      .select({ cnt: sql<number>`count(*)` })
      .from(diagnosticSubmissions)
      .where(sql`${diagnosticSubmissions.createdAt} >= ${since}`);
    const count = Number(row?.cnt ?? 0);
    return count >= 10 ? count : null;
  } catch (err) {
    console.error("[Plateau] recentSubmissionCount failed:", err);
    return null;
  }
}

export default async function PlateauPage() {
  const recentCount = await recentSubmissionCount();

  return (
    <>
      <MetaPixel />
      <StickyCta
        href="#start"
        label="Start the diagnostic"
        ctaTag="plateau-sticky"
        hideWhenInView="#start"
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "The Masters Plateau Diagnostic — Roadman Cycling",
          description:
            "A 12-question interactive diagnostic for cyclists over 35 whose FTP has stalled. Returns one of four personalised plateau profiles.",
          url: "https://roadmancycling.com/plateau",
          isPartOf: {
            "@type": "WebSite",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
          },
          publisher: {
            "@type": "Organization",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
          },
        }}
      />
      <FAQPageJsonLd
        questions={FAQS.map((f) => ({ question: f.q, answer: f.a }))}
      />
      <Header />
      <main id="main-content">
        {/* ═══ Hero ═════════════════════════════════════════
            Full viewport on mobile. Everything the cold user
            needs to commit: what it is, why they'd do it, and
            the first question as a single tap. All proof and
            trust signals are inline — no separate "convince
            them" sections. ────────────────────────────────── */}
        <section className="relative overflow-hidden pt-24 pb-16 min-h-[92svh] flex items-center">
          <Image
            src="/images/cycling/gravel-desert-road-epic.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "center 35%" }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-charcoal/55 via-charcoal/80 to-charcoal"
          />
          <div
            aria-hidden="true"
            className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-coral to-purple z-10"
          />
          <Container width="narrow" className="relative z-10 text-center">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-xs md:text-sm tracking-widest mb-5 flex items-center justify-center gap-2">
                <span aria-hidden="true" className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-coral" />
                </span>
                THE MASTERS PLATEAU DIAGNOSTIC
              </p>
              <h1
                className="font-heading text-off-white mb-5 leading-[0.95] drop-shadow-lg"
                style={{ fontSize: "var(--text-hero)" }}
              >
                FOUR REASONS YOUR FTP IS STUCK.
                <GradientText as="span" className="block mt-2">
                  WHICH ONE IS YOU?
                </GradientText>
              </h1>
              <p className="text-off-white/90 text-lg md:text-xl leading-relaxed max-w-xl mx-auto">
                A 4-minute diagnostic for cyclists 35+. Tap your age and
                we start.
              </p>

              <HeroAgePicker />

              {/* Inline trust. One line, three signals — no separate
                  authority section needed. The ad already pre-sold; this
                  just confirms you're in the right place. */}
              <p className="text-off-white/70 text-xs md:text-sm mt-6 max-w-xl mx-auto">
                1,400+ podcast conversations · Methods used by the coaches
                behind Pogačar and Froome · 1M+ monthly listeners
              </p>
              {recentCount !== null && (
                <p className="text-off-white/70 text-xs mt-2">
                  <span className="text-coral">●</span>{" "}
                  <strong className="text-off-white">
                    {recentCount.toLocaleString()}
                  </strong>{" "}
                  cyclists took it this week
                </p>
              )}
            </ScrollReveal>
          </Container>
        </section>

        {/* ═══ Four profiles ════════════════════════════════
            One scroll below hero. Curiosity hook for users
            who scrolled past the age picker without tapping.
            Each card is self-contained — tap any age on the
            way back up to start. ───────────────────────── */}
        <Section background="charcoal" className="py-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-xs tracking-widest text-center mb-3">
                THE FOUR PROFILES
              </p>
              <h2
                className="font-heading text-off-white text-center mb-10"
                style={{ fontSize: "var(--text-section)" }}
              >
                YOU&rsquo;LL BE ONE OF THESE FOUR.
              </h2>
            </ScrollReveal>
            <ul className="grid sm:grid-cols-2 gap-4 list-none p-0">
              {PROFILE_TEASERS.map(({ profile, teaser }, i) => (
                <li key={profile}>
                  <ScrollReveal direction="up" delay={i * 0.08}>
                    <div className="h-full rounded-xl border border-white/10 bg-background-elevated p-6 hover:border-coral/40 transition-colors">
                      <p className="font-heading text-xs tracking-widest text-coral mb-2">
                        PROFILE 0{i + 1}
                      </p>
                      <h3 className="font-heading text-xl text-off-white mb-3">
                        {PROFILE_LABELS[profile].toUpperCase()}
                      </h3>
                      <p className="text-foreground-muted leading-relaxed">
                        {teaser}
                      </p>
                    </div>
                  </ScrollReveal>
                </li>
              ))}
            </ul>
            <ScrollReveal direction="up" delay={0.2}>
              <p className="text-center mt-8 text-foreground-muted">
                <a
                  href="#start"
                  data-cta="profiles-section"
                  className="text-coral hover:underline font-semibold"
                >
                  Start the diagnostic to find out which →
                </a>
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ═══ Diagnostic ═══════════════════════════════════
            The actual product. Suspense wraps the flow because
            useSearchParams() forces CSR bailout in static
            generation. ────────────────────────────────────── */}
        <Section background="deep-purple" grain id="start">
          <Container width="narrow">
            <Suspense fallback={<DiagnosticSkeleton />}>
              <DiagnosticFlow />
            </Suspense>
          </Container>
        </Section>

        {/* ═══ FAQ — compact ═════════════════════════════════
            4 practical questions. Kept minimal because this
            page only needs to answer logistical objections,
            not convince. ──────────────────────────────────── */}
        <Section background="charcoal" className="py-14">
          <Container width="narrow">
            <h2
              className="font-heading text-off-white text-center mb-8"
              style={{ fontSize: "var(--text-section)" }}
            >
              QUICK QUESTIONS
            </h2>
            <dl className="space-y-3">
              {FAQS.map((faq, i) => (
                <ScrollReveal key={faq.q} direction="up" delay={i * 0.05}>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                    <dt className="font-heading text-base text-off-white mb-1">
                      {faq.q}
                    </dt>
                    <dd className="text-foreground-muted text-sm leading-relaxed">
                      {faq.a}
                    </dd>
                  </div>
                </ScrollReveal>
              ))}
            </dl>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

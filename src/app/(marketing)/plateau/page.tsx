import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { diagnosticSubmissions } from "@/lib/db/schema";
import { Container, Footer, Header, Section } from "@/components/layout";
import {
  AnimatedCounter,
  GradientText,
  GuestMarquee,
  ParallaxImage,
  ScrollReveal,
} from "@/components/ui";
import { JsonLd, FAQPageJsonLd } from "@/components/seo/JsonLd";
import { DiagnosticFlow } from "@/components/features/diagnostic/DiagnosticFlow";
import { HeroAgePicker } from "@/components/features/diagnostic/HeroAgePicker";
import { MetaPixel } from "@/components/features/diagnostic/MetaPixel";
import { StickyCta } from "@/components/features/diagnostic/StickyCta";
import { PROFILE_LABELS } from "@/lib/diagnostic/profiles";
import { MARQUEE_GUESTS } from "@/lib/guests-marquee";
import type { Profile } from "@/lib/diagnostic/types";

/**
 * /plateau — the Masters Plateau Diagnostic landing page. Built for
 * cold Facebook traffic: the primary conversion path is a single
 * age-button tap in the hero, which drops the user straight into
 * the diagnostic flow mid-stream.
 *
 * Copy and section order are tuned for sub-2-second comprehension
 * on a 375px-wide viewport. Every section below the hero earns its
 * place by closing a specific objection — see the comments on each.
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

// ── Content ─────────────────────────────────────────────────
// One-line descriptions for each profile. These turn the pills from
// jargon ("Polarisation Failure") into a curiosity hook the user
// can actually self-diagnose against. Kept short enough to scan.
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

const BENEFITS = [
  {
    kicker: "01",
    title: "One of four profiles",
    body: "Named, explained in plain language. Not a generic plan — the specific reason your FTP has stalled.",
  },
  {
    kicker: "02",
    title: "Three concrete steps",
    body: "With actual numbers. Seven-and-a-half hours of sleep, not \"recover better.\" Eighty grams of carbs an hour, not \"fuel properly.\"",
  },
  {
    kicker: "03",
    title: "A clear next move",
    body: "Call, community, or go solo — we'll tell you which fits your profile. No hard-sell sequence afterwards.",
  },
];

const FAQS = [
  {
    q: "How long does it take?",
    a: "Four minutes. Twelve single-tap questions and a short demographics round.",
  },
  {
    q: "Is it free?",
    a: "Yes, completely. No card, no trial, no paywall.",
  },
  {
    q: "Will I be added to a list?",
    a: "Yes — so we can email your diagnosis. One-click unsubscribe, honoured within the hour. We never sell your email.",
  },
];

// ── Loading skeleton ───────────────────────────────────────
function DiagnosticSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[640px]">
      <div className="h-1 w-full bg-white/10 rounded-full" />
      <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-6 md:p-10 min-h-[340px]" />
    </div>
  );
}

/**
 * Live 7-day submission counter. Pulled live on each page
 * revalidation (hourly). Minimum threshold of 10 so we never render
 * "1 cyclist took it this week" which reads as "nobody else is
 * doing this" and hurts trust more than it helps.
 */
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
      {/* Sticky mobile CTA. Hides when the diagnostic is in view
          so it doesn't overlap the active form. */}
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
            FB-traffic entry point. Must:
              1. Confirm the ad promise in <1s ("yes, this is it")
              2. Present the first question as the primary CTA
              3. Be comprehensible on a 375×667 viewport

            Full-bleed cycling photo behind a dark gradient — the
            page reads as "serious masters cycling" before any text
            is processed. The age picker IS the start; no redundant
            "Start the diagnostic" button. ────────────────────── */}
        <section className="relative overflow-hidden pt-28 pb-16 min-h-[78svh] flex items-center">
          {/* Background image. `priority` so it's in the LCP budget;
              sizes hint tells next/image which resolution to serve. */}
          <Image
            src="/images/cycling/gravel-desert-road-epic.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "center 35%" }}
          />
          {/* Dark overlay — top-to-bottom gradient gives text strong
              contrast at the bottom (where the CTA sits) while
              keeping the landscape visible at the top. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-charcoal/55 via-charcoal/75 to-charcoal"
          />
          {/* Coral → purple stripe at the top — picks up the brand
              system already used on the OG images. */}
          <div
            aria-hidden="true"
            className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-coral to-purple z-10"
          />
          <Container width="narrow" className="relative z-10 text-center">
            <ScrollReveal direction="up" eager>
              {/* Kicker with a live-pulse dot. The pulse signals
                  "this is an active, running thing" — lifts the
                  static kicker into something that feels alive. */}
              <p className="text-coral font-heading text-xs md:text-sm tracking-widest mb-5 flex items-center justify-center gap-2">
                <span
                  aria-hidden="true"
                  className="relative flex h-2 w-2"
                >
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

              {recentCount !== null && (
                <p className="text-off-white/70 text-xs mt-6">
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

        {/* ═══ Risk reversal ════════════════════════════════
            Pulled out of the FAQ into high-visibility position.
            Closes the "what if it's wrong / what if this is a
            pitch" objection before the user has to ask. ───── */}
        <Section background="deep-purple" className="py-10">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <figure className="text-center">
                <blockquote className="font-heading text-xl md:text-2xl text-off-white leading-snug">
                  &ldquo;If your diagnosis doesn&rsquo;t sound like you, reply
                  to the email it lands in. I&rsquo;ll personally re-run it.
                  The diagnostic is only useful if it&rsquo;s right.&rdquo;
                </blockquote>
                <figcaption className="text-coral font-heading text-sm tracking-widest mt-4">
                  — ANTHONY WALSH, ROADMAN CYCLING
                </figcaption>
              </figure>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ═══ Authority strip ══════════════════════════════
            Three big stats that count up on scroll. Proof points
            that read as specific, not marketing. The scroll-in
            counters give the section kinetic energy so it doesn't
            feel like a static bullet list. ─────────────────── */}
        <Section background="charcoal" className="py-14 border-y border-white/5">
          <Container width="wide">
            <ul className="grid md:grid-cols-3 gap-8 md:gap-6 text-center md:text-left">
              <li>
                <ScrollReveal direction="up">
                  <p className="font-heading text-coral leading-none mb-2" style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}>
                    <AnimatedCounter value="1,400+" />
                  </p>
                  <p className="text-off-white font-heading text-sm md:text-base tracking-wide mb-1">
                    PODCAST CONVERSATIONS
                  </p>
                  <p className="text-foreground-muted text-sm">
                    With World Tour coaches, sports scientists, and pro
                    riders — the source material for every profile.
                  </p>
                </ScrollReveal>
              </li>
              <li>
                <ScrollReveal direction="up" delay={0.1}>
                  <p className="font-heading text-coral leading-none mb-2" style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}>
                    <AnimatedCounter value="3" />
                  </p>
                  <p className="text-off-white font-heading text-sm md:text-base tracking-wide mb-1">
                    TOUR DE FRANCE WINNERS
                  </p>
                  <p className="text-foreground-muted text-sm">
                    Methods used by the coaches behind Pogačar, Froome,
                    and Bernal, translated for riders with a life.
                  </p>
                </ScrollReveal>
              </li>
              <li>
                <ScrollReveal direction="up" delay={0.2}>
                  <p className="font-heading text-coral leading-none mb-2" style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}>
                    <AnimatedCounter value="1M+" />
                  </p>
                  <p className="text-off-white font-heading text-sm md:text-base tracking-wide mb-1">
                    MONTHLY LISTENERS
                  </p>
                  <p className="text-foreground-muted text-sm">
                    The largest cycling performance podcast on the
                    planet. If the answer exists, we&rsquo;ve aired it.
                  </p>
                </ScrollReveal>
              </li>
            </ul>
          </Container>
        </Section>

        {/* ═══ Guest marquee ════════════════════════════════
            Names do the heavy lifting here — each one is a
            category-defining expert. Two rows scrolling in
            opposite directions (existing GuestMarquee uses
            CSS animation for 60fps on low-end phones). ────── */}
        <Section background="deep-purple" grain className="py-12 overflow-hidden">
          <Container>
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-xs tracking-widest text-center mb-2">
                WHO WE&rsquo;VE LEARNED FROM
              </p>
              <p className="text-off-white font-heading text-center mb-8" style={{ fontSize: "var(--text-section)" }}>
                EVERY PROFILE IS BUILT ON THESE CONVERSATIONS.
              </p>
            </ScrollReveal>
          </Container>
          {/* Full-bleed marquee — breaks out of Container for
              edge-to-edge scroll (homepage does the same pattern). */}
          <GuestMarquee guests={MARQUEE_GUESTS} fadeColor="deep-purple" />
        </Section>

        {/* ═══ The four profiles ════════════════════════════
            Was a row of pills with no context. Now four cards
            with one-line descriptions — the same curiosity
            mechanism, but the user can actually self-diagnose
            before committing to the quiz. ─────────────────── */}
        <Section background="charcoal" className="pt-14 pb-4">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-xs tracking-widest text-center mb-3">
                THE FOUR PROFILES
              </p>
              <h2
                className="font-heading text-off-white text-center mb-3"
                style={{ fontSize: "var(--text-section)" }}
              >
                YOU&rsquo;LL BE ONE OF THESE FOUR.
              </h2>
              <p className="text-foreground-muted text-center max-w-xl mx-auto mb-10">
                Four patterns. Every plateaued masters cyclist fits one of
                them cleanly. The diagnostic tells you which.
              </p>
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
                Don&rsquo;t guess. Take the diagnostic and know for sure.{" "}
                <a
                  href="#start"
                  data-cta="profiles-section"
                  className="text-coral hover:underline font-semibold"
                >
                  Start with your age →
                </a>
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ═══ How it works — condensed ══════════════════════
            Was three cards + titles. Now one line + inline
            step markers. Paid traffic doesn't read three-card
            explainers; they want the shape of the commitment
            in one glance. ─────────────────────────────────── */}
        <Section background="charcoal" className="pt-6 pb-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="text-center text-foreground-muted text-sm md:text-base">
                <span className="font-heading text-coral mr-2">1.</span>
                Tap your age
                <span className="mx-2 text-foreground-subtle">→</span>
                <span className="font-heading text-coral mr-2">2.</span>
                Answer 12 quick questions
                <span className="mx-2 text-foreground-subtle">→</span>
                <span className="font-heading text-coral mr-2">3.</span>
                Get your profile + the three fixes
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ═══ The diagnostic itself ═════════════════════════
            Suspense wraps the flow because useSearchParams()
            forces a CSR bailout during static generation. The
            hero's HeroAgePicker scrolls to #start and fires the
            prefill-age event; this flow resumes mid-stream. ── */}
        <Section background="deep-purple" grain id="start">
          <Container width="narrow">
            <Suspense fallback={<DiagnosticSkeleton />}>
              <DiagnosticFlow />
            </Suspense>
          </Container>
        </Section>

        {/* ═══ What you'll get ═══════════════════════════════
            Was three vague "you'll get a breakdown" cards.
            Rewritten so every card makes a specific promise
            the diagnostic actually delivers on — concrete
            numbers, no abstractions. ──────────────────────── */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-xs tracking-widest text-center mb-3">
                WHAT YOU GET
              </p>
              <h2
                className="font-heading text-off-white text-center mb-12"
                style={{ fontSize: "var(--text-section)" }}
              >
                SPECIFICS. NOT GENERIC ADVICE.
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-4">
              {BENEFITS.map((b, i) => (
                <ScrollReveal key={b.kicker} direction="up" delay={i * 0.08}>
                  <div className="h-full rounded-xl border border-white/10 bg-background-elevated p-6">
                    <p className="font-heading text-coral text-sm tracking-widest mb-3">
                      {b.kicker}
                    </p>
                    <h3 className="font-heading text-lg text-off-white mb-3 leading-snug">
                      {b.title}
                    </h3>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      {b.body}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ═══ Parallax break ═══════════════════════════════
            Emotional beat between the cerebral benefits cards
            and the practical FAQ. "Real riders, real rides" —
            grounds the page so the diagnostic doesn't feel
            like just another AI gimmick. ──────────────────── */}
        <ParallaxImage
          src="/images/cycling/anthony-podcast-studio.jpg"
          alt="Two masters cyclists resting against a wall mid-ride"
          className="h-[35vh] md:h-[50vh]"
          objectPosition="center 40%"
          speed={0.25}
          overlayColor="from-charcoal/60 via-charcoal/30 to-deep-purple/70"
        />

        {/* ═══ FAQ — condensed ═══════════════════════════════
            Three questions, not five. The "is this a sale" and
            "what if it's wrong" answers were promoted — one
            into the risk-reversal quote, the other into the
            hero subhead. What's left are the practical "how
            long / cost / list" questions. ────────────────── */}
        <Section background="deep-purple" grain className="py-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white text-center mb-10"
                style={{ fontSize: "var(--text-section)" }}
              >
                QUICK QUESTIONS
              </h2>
            </ScrollReveal>
            <dl className="space-y-4">
              {FAQS.map((faq, i) => (
                <ScrollReveal key={faq.q} direction="up" delay={i * 0.06}>
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

        {/* ═══ Final CTA ═════════════════════════════════════
            Anyone who scrolled this far is high-intent.
            One last chance without a scroll-back to the hero.
            Time-bound framing ("four minutes from now you'll
            know") outperforms a generic "start" button. ──── */}
        <Section background="charcoal" className="py-16">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white mb-5 leading-[0.95]"
                style={{ fontSize: "var(--text-section)" }}
              >
                FOUR MINUTES FROM NOW YOU&rsquo;LL KNOW
                <span className="text-coral block mt-1">WHICH ONE YOU ARE.</span>
              </h2>
              <p className="text-foreground-muted mb-8 max-w-md mx-auto">
                Or you can keep guessing. Your call.
              </p>
              <Link
                href="#start"
                data-cta="bottom"
                className="inline-block font-heading tracking-wider bg-coral hover:bg-coral-hover text-off-white px-10 py-4 rounded-md transition-colors cursor-pointer text-lg shadow-lg shadow-coral/20"
              >
                START THE DIAGNOSTIC
              </Link>
              <p className="text-foreground-subtle text-xs mt-4">
                No email needed to start · 4 minutes · Free
              </p>
            </ScrollReveal>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Footer, Header, Section } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { JsonLd, FAQPageJsonLd } from "@/components/seo/JsonLd";
import { DiagnosticFlow } from "@/components/features/diagnostic/DiagnosticFlow";
import { MetaPixel } from "@/components/features/diagnostic/MetaPixel";

/**
 * /plateau — landing page for the Masters Plateau Diagnostic. Copy
 * and design follow §6 of the spec. The diagnostic component is
 * embedded below the fold so the user can scroll straight into the
 * flow without a route change — keeps session state intact and removes
 * a click from the ad → start funnel.
 */

export const metadata: Metadata = {
  title: "The Masters Plateau Diagnostic — Roadman Cycling",
  description:
    "Twelve questions. Four minutes. A specific answer for why your FTP has stalled — and the exact fix, written for riders who train 6 to 12 hours a week around a real life.",
  alternates: {
    canonical: "https://roadmancycling.com/plateau",
  },
  openGraph: {
    title: "The Masters Plateau Diagnostic",
    description:
      "If you're over 40 and your FTP hasn't moved in 18 months, it's almost always one of four things. Find out which one in four minutes.",
    type: "website",
    url: "https://roadmancycling.com/plateau",
  },
  // The results pages are personal and shouldn't leak to search.
  // The landing page itself is fine.
  robots: { index: true, follow: true },
};

export const revalidate = 3600;

const SOCIAL_PROOF = [
  "Built from 1,400+ podcast conversations with World Tour coaches, sports scientists and pro riders.",
  "Based on methods used by the coaches behind Tadej Pogačar, Chris Froome and Egan Bernal.",
  "Trusted by 113 members inside Not Done Yet.",
];

const CARDS = [
  {
    title: "Your specific profile",
    body: "One of four reasons your FTP has stalled, named and explained in plain language.",
  },
  {
    title: "A two-page breakdown",
    body: "What's actually happening, what it's costing you, and the three steps to fix it.",
  },
  {
    title: "Your next move",
    body: "A clear recommendation, not a generic plan. Built for riders with a life.",
  },
];

const FAQS = [
  {
    q: "How long does it take?",
    a: "Four minutes, give or take.",
  },
  {
    q: "Is it free?",
    a: "Yes, completely. No card, no trial.",
  },
  {
    q: "Will I be added to a list?",
    a: "Yes, so we can send your diagnosis. You can unsubscribe any time with one click.",
  },
  {
    q: "Is this just going to sell me something?",
    a: "At the end you'll see whether Not Done Yet is the right fit. If it's not, the diagnosis is yours to keep — we don't run a hard-sell sequence.",
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

export default function PlateauPage() {
  return (
    <>
      <MetaPixel />
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
      {/* FAQPage schema lets Google render the FAQ as rich snippets
          on SERPs that index the landing — bonus organic surface on
          top of the paid traffic. */}
      <FAQPageJsonLd
        questions={FAQS.map((f) => ({ question: f.q, answer: f.a }))}
      />
      <Header />
      <main id="main-content">
        {/* ── Hero — built for paid traffic, sub-2-second comprehension ── */}
        <Section background="charcoal" grain className="pt-28 pb-8">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                THE MASTERS PLATEAU DIAGNOSTIC
              </p>
              <h1
                className="font-heading text-off-white mb-5"
                style={{ fontSize: "var(--text-hero)" }}
              >
                FTP STUCK FOR A YEAR? IT&rsquo;S ALMOST ALWAYS ONE OF FOUR
                THINGS.
              </h1>
              <p className="text-foreground-muted text-lg md:text-xl leading-relaxed mb-7 max-w-xl mx-auto">
                Twelve questions. Four minutes. A specific answer for why your
                progress has stalled &mdash; and the exact fix.
              </p>
              <a
                href="#start"
                className="inline-block font-heading tracking-wider bg-coral hover:bg-coral-hover text-off-white px-10 py-4 rounded-md transition-colors cursor-pointer text-lg shadow-lg shadow-coral/20"
              >
                START THE DIAGNOSTIC
              </a>
              <p className="text-foreground-subtle text-xs mt-4">
                No email needed to start &middot; 4 minutes &middot; Free
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ── Social proof strip ──────────────────────── */}
        {/* Below the hero so it pre-qualifies the diagnostic without
            adding to first-paint reading load. */}
        <Section background="deep-purple" className="py-8">
          <Container width="wide">
            <ul className="grid md:grid-cols-3 gap-6 text-foreground-muted text-sm">
              {SOCIAL_PROOF.map((line, i) => (
                <li key={line}>
                  <ScrollReveal direction="up" delay={i * 0.1}>
                    <div className="border-l-2 border-coral/40 pl-4 leading-relaxed">
                      {line}
                    </div>
                  </ScrollReveal>
                </li>
              ))}
            </ul>
          </Container>
        </Section>

        {/* ── The diagnostic itself ───────────────────── */}
        {/* Moved up the page (was below "What you'll get"). For paid
            traffic the diagnostic IS the page — every section between
            the hero and Q1 sheds clicks. The cards are still below
            for users scrolling to research before committing.
            Suspense wraps the flow because useSearchParams() forces a
            CSR bailout during static generation otherwise. */}
        <Section background="deep-purple" grain id="start">
          <Container width="narrow">
            <Suspense fallback={<DiagnosticSkeleton />}>
              <DiagnosticFlow />
            </Suspense>
          </Container>
        </Section>

        {/* ── What you'll get ─────────────────────────── */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white text-center mb-12"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT YOU&rsquo;LL GET
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-6">
              {CARDS.map((card, i) => (
                <ScrollReveal key={card.title} direction="up" delay={i * 0.1}>
                  <div className="bg-background-elevated rounded-xl border border-white/5 p-6 h-full">
                    <h3 className="font-heading text-xl text-off-white mb-3">
                      {card.title.toUpperCase()}
                    </h3>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      {card.body}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ── FAQ ─────────────────────────────────────── */}
        <Section background="charcoal">
          <Container width="narrow">
            <h2
              className="font-heading text-off-white text-center mb-10"
              style={{ fontSize: "var(--text-section)" }}
            >
              COMMON QUESTIONS
            </h2>
            <dl className="space-y-6">
              {FAQS.map((faq) => (
                <div
                  key={faq.q}
                  className="bg-background-elevated rounded-lg border border-white/5 p-6"
                >
                  <dt className="font-heading text-lg text-off-white mb-2">
                    {faq.q}
                  </dt>
                  <dd className="text-foreground-muted leading-relaxed">
                    {faq.a}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

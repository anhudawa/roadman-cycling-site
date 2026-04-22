import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Footer, Header, Section } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
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
      <Header />
      <main id="main-content">
        {/* ── Hero ─────────────────────────────────────── */}
        <Section background="charcoal" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral font-heading text-sm tracking-widest mb-4">
              THE MASTERS PLATEAU DIAGNOSTIC
            </p>
            <h1
              className="font-heading text-off-white mb-6"
              style={{ fontSize: "var(--text-hero)" }}
            >
              IF YOU&rsquo;RE OVER 40 AND YOUR FTP HASN&rsquo;T MOVED IN 18
              MONTHS, IT&rsquo;S ALMOST ALWAYS ONE OF FOUR THINGS.
            </h1>
            <p className="text-foreground-muted text-xl leading-relaxed mb-8">
              Twelve questions. Four minutes. A specific answer for why your
              progress has stalled &mdash; and the exact fix, written for
              riders who train 6 to 12 hours a week around a real life.
            </p>
            <a
              href="#start"
              className="inline-block font-heading tracking-wider bg-coral hover:bg-coral-hover text-off-white px-10 py-4 rounded-md transition-colors cursor-pointer text-lg"
            >
              START THE DIAGNOSTIC
            </a>
          </Container>
        </Section>

        {/* ── Social proof strip ──────────────────────── */}
        <Section background="deep-purple" className="py-10">
          <Container width="wide">
            <ul className="grid md:grid-cols-3 gap-6 text-foreground-muted text-sm">
              {SOCIAL_PROOF.map((line) => (
                <li
                  key={line}
                  className="border-l-2 border-coral/40 pl-4 leading-relaxed"
                >
                  {line}
                </li>
              ))}
            </ul>
          </Container>
        </Section>

        {/* ── What you'll get ─────────────────────────── */}
        <Section background="charcoal">
          <Container width="narrow">
            <h2
              className="font-heading text-off-white text-center mb-12"
              style={{ fontSize: "var(--text-section)" }}
            >
              WHAT YOU&rsquo;LL GET
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {CARDS.map((card) => (
                <div
                  key={card.title}
                  className="bg-background-elevated rounded-xl border border-white/5 p-6"
                >
                  <h3 className="font-heading text-xl text-off-white mb-3">
                    {card.title.toUpperCase()}
                  </h3>
                  <p className="text-foreground-muted text-sm leading-relaxed">
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* ── The diagnostic itself ───────────────────── */}
        {/* Suspense wraps the flow because useSearchParams() forces a
            CSR bailout during static generation otherwise. */}
        <Section background="deep-purple" grain id="start">
          <Container width="narrow">
            <Suspense fallback={<DiagnosticSkeleton />}>
              <DiagnosticFlow />
            </Suspense>
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

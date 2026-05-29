import type { Metadata } from "next";
import { Section, Container } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import { WaitlistForm } from "./WaitlistForm";
import { MedicalDisclaimer } from "../MedicalDisclaimer";

export const metadata: Metadata = {
  title: "Blood Engine — Coming soon: decode your bloodwork like a pro cyclist",
  description:
    "Cycling-specific bloodwork interpretation for masters cyclists. Launching soon — join the waiting list to be first in.",
  alternates: { canonical: "https://roadmancycling.com/blood-engine" },
  openGraph: {
    title: "Blood Engine — Coming soon",
    description:
      "Cycling-specific bloodwork interpretation for masters cyclists. Athlete-optimal ranges, not generic lab norms. Join the waiting list.",
    type: "website",
    url: "https://roadmancycling.com/blood-engine",
    siteName: "Roadman Cycling",
  },
};

const FAQ = [
  {
    q: "What is Blood Engine?",
    a: "A cycling-specific bloodwork interpretation tool. You bring a blood test from any provider. We read it through the lens of a masters endurance athlete — using athlete-optimal ranges, not the standard lab ranges your GP reads from — and hand back a plain-English report with a three-step action plan.",
  },
  {
    q: "Why not just ask my GP?",
    a: "GPs read bloodwork against ranges built for the general population. A masters cyclist with a ferritin of 35 will be told 'all normal' when that's the reason their FTP has been stalled for six months. Blood Engine encodes the interpretation logic endurance sports medicine uses but general practice doesn't.",
  },
  {
    q: "When does it launch?",
    a: "Closed beta with a group of Not Done Yet members first. Full launch follows once the prompt has been validated alongside our sports medicine contacts. Join the list and you'll be first to hear.",
  },
  {
    q: "How much will it cost?",
    a: "€97 for lifetime access. One payment, every retest decoded forever. No subscription.",
  },
  {
    q: "Is this medical advice?",
    a: "No. Blood Engine is educational. It reads your results through an endurance-sports lens so you can have a sharper conversation with your GP or sports medicine doctor. Anything flagged sends you to a professional every time.",
  },
];

export default function BloodEngineWaitingList() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Blood Engine",
          description:
            "Cycling-specific bloodwork interpretation tool for masters cyclists. Launching soon.",
          brand: { "@type": "Brand", name: "Roadman Cycling" },
          category: "Health and fitness software",
          url: "https://roadmancycling.com/blood-engine",
          offers: {
            "@type": "Offer",
            availability: "https://schema.org/PreOrder",
            priceCurrency: "EUR",
            price: "97",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      {/* ── Hero + signup ────────────────────────────────────── */}
      <Section background="deep-purple" fullHeight grain>
        <Container width="narrow" className="relative z-10 text-center">
          <p className="font-heading tracking-[0.3em] text-coral text-sm md:text-base mb-6">
            Blood Engine · Coming soon
          </p>
          <h1 className="font-heading text-off-white leading-[0.9] text-[var(--text-hero)] uppercase">
            Decode your bloodwork like a pro cyclist
          </h1>
          <p className="mt-8 text-body-lg text-foreground-muted max-w-xl mx-auto">
            Standard lab ranges are set for sedentary adults. Blood Engine
            reads your results through the lens of a masters cyclist — so you
            find out why your FTP is stalled before your GP tells you
            everything looks normal.
          </p>

          <div className="mt-10 max-w-md mx-auto">
            <WaitlistForm />
          </div>
          <p className="mt-4 text-xs text-foreground-subtle">
            Join a small group of masters cyclists who&apos;ll be first in
            when we launch. No spam, one email at launch, unsubscribe in one click.
          </p>
        </Container>
      </Section>

      {/* ── Why standard ranges fail cyclists ────────────────── */}
      <Section background="charcoal">
        <Container width="narrow">
          <h2 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white mb-8">
            Why your GP keeps saying everything is normal
          </h2>
          <p className="text-body-lg text-foreground-muted mb-6">
            A ferritin of 35 will come back &quot;within range&quot; from any clinic
            in the country. For a masters cyclist training ten-plus hours a week,
            it&apos;s the reason you&apos;re gassed on climbs you used to float over.
            Standard lab ranges are built around the general population, not
            endurance athletes with heavy iron turnover.
          </p>
          <p className="text-body-lg text-foreground-muted mb-6">
            Blood Engine uses athlete-optimal ranges drawn from endurance sports
            medicine — Stanford FASTR, the Gatorade Sports Science Institute,
            Athlete Blood Test. The same frame your GP would use if your GP was
            Sam Impey.
          </p>
          <p className="text-body-lg text-foreground-muted">
            You bring the bloodwork. We translate it into cycling performance
            language, flag the patterns that matter — under-fuelling signature,
            overtraining triad, iron deficiency masked by inflammation — and
            tell you exactly what to do next.
          </p>
        </Container>
      </Section>

      {/* ── How it works ──────────────────────────────────────── */}
      <Section background="deep-purple">
        <Container>
          <h2 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white mb-12 text-center">
            How it will work
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: "01",
                t: "Get your bloods",
                b: "Use any private provider — Medichecks, Forth, Thriva, Randox, your GP. We&apos;ll tell you which 17 markers to ask for.",
              },
              {
                n: "02",
                t: "Upload or type",
                b: "Upload the PDF and we&apos;ll pull the numbers out, or enter them by hand. Either way takes under five minutes.",
              },
              {
                n: "03",
                t: "Get decoded",
                b: "Cycling-specific interpretation. Traffic-light status per marker, detected patterns, a three-step action plan, retest date.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-lg border border-white/5 bg-background-elevated p-8"
              >
                <p className="font-heading text-coral text-4xl mb-4">{s.n}</p>
                <h3 className="font-heading uppercase text-off-white text-2xl mb-3 leading-tight">
                  {s.t}
                </h3>
                <p
                  className="text-foreground-muted"
                  dangerouslySetInnerHTML={{ __html: s.b }}
                />
              </div>
            ))}
          </div>
          <p className="mt-12 text-center">
            <a
              href="/blood-engine/markers"
              className="font-heading tracking-wider uppercase text-coral hover:text-coral-hover text-sm"
            >
              See the 17-marker panel →
            </a>
          </p>
        </Container>
      </Section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <Section background="charcoal">
        <Container width="narrow" className="text-center">
          <h2 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white mb-6">
            €97. One time. Forever.
          </h2>
          <p className="text-body-lg text-foreground-muted mb-8">
            One payment will buy lifetime access. Every retest you run — every
            three months, every six months, every time you change something — gets
            decoded in here. Launch pricing is locked in for everyone on the
            waiting list.
          </p>
          <div className="max-w-md mx-auto">
            <WaitlistForm variant="secondary" />
          </div>
        </Container>
      </Section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <Section background="deep-purple">
        <Container width="narrow">
          <h2 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white mb-10">
            Questions
          </h2>
          <div className="space-y-8">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="font-heading uppercase text-off-white text-2xl mb-2">
                  {f.q}
                </h3>
                <p className="text-foreground-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── Disclaimer ───────────────────────────────────────── */}
      <Section background="charcoal">
        <Container width="narrow">
          <MedicalDisclaimer variant="muted" />
        </Container>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import { Section, Container } from "@/components/layout";
import { Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { CheckoutCta } from "./CheckoutCta";
import { MedicalDisclaimer } from "./MedicalDisclaimer";
import { MARKERS } from "@/lib/blood-engine/markers";

export const metadata: Metadata = {
  title: "Blood Engine — Decode your bloodwork like a pro cyclist",
  description:
    "Cycling-specific bloodwork interpretation for masters cyclists. €97 lifetime access. Upload your results, get a report tuned to athlete-optimal ranges.",
};

export default function BloodEngineLanding() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Blood Engine",
          description:
            "Cycling-specific bloodwork interpretation tool for masters cyclists. Reads any blood test through the lens of athlete-optimal reference ranges, not the standard lab ranges that miss endurance-athlete patterns.",
          brand: { "@type": "Brand", name: "Roadman Cycling" },
          category: "Health and fitness software",
          url: "https://roadmancycling.com/blood-engine",
          offers: {
            "@type": "Offer",
            price: "97",
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            url: "https://roadmancycling.com/blood-engine",
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
      {/* ── Hero ─────────────────────────────────────────────── */}
      <Section background="deep-purple" fullHeight grain>
        <Container width="narrow" className="relative z-10 text-center">
          <p className="font-heading tracking-[0.3em] text-coral text-sm md:text-base mb-6">
            Blood Engine
          </p>
          <h1 className="font-heading text-off-white leading-[0.9] text-[var(--text-hero)] uppercase">
            Decode your bloodwork like a pro cyclist
          </h1>
          <p className="mt-8 text-body-lg text-foreground-muted max-w-xl mx-auto">
            Standard lab ranges are set for sedentary adults. Blood Engine reads your results through the
            lens of a masters cyclist — so you find out why your FTP is stalled before your GP tells you
            everything looks normal.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <CheckoutCta />
            <a
              href="#how-it-works"
              className="font-heading tracking-wider uppercase text-off-white/70 hover:text-off-white text-sm"
            >
              How it works →
            </a>
          </div>
          <p className="mt-6 text-sm text-foreground-subtle">
            €97 one-off · Lifetime access · Every retest, forever
          </p>
        </Container>
      </Section>

      {/* ── Why standard ranges fail cyclists ───────────────── */}
      <Section background="charcoal">
        <Container width="narrow">
          <ScrollReveal>
            <h2 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white mb-8">
              Why your GP keeps saying everything is normal
            </h2>
            <p className="text-body-lg text-foreground-muted mb-6">
              A ferritin of 35 will come back &quot;within range&quot; from any clinic in the country. For a masters
              cyclist training ten-plus hours a week, it&apos;s the reason you&apos;re gassed on climbs you used to
              float over. Standard lab ranges are built around the general population, not endurance
              athletes with heavy iron turnover.
            </p>
            <p className="text-body-lg text-foreground-muted mb-6">
              Blood Engine uses athlete-optimal ranges drawn from endurance sports medicine — Stanford
              FASTR, the Gatorade Sports Science Institute, Athlete Blood Test. The same frame your GP
              would use if your GP was Sam Impey.
            </p>
            <p className="text-body-lg text-foreground-muted">
              You bring the bloodwork. We translate it into cycling performance language, flag the
              patterns that matter — under-fuelling signature, overtraining triad, iron deficiency
              masked by inflammation — and tell you exactly what to do next.
            </p>
          </ScrollReveal>
        </Container>
      </Section>

      {/* ── How it works ────────────────────────────────────── */}
      <Section background="deep-purple" id="how-it-works">
        <Container>
          <h2 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white mb-12 text-center">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                number: "01",
                title: "Get your bloods",
                body: "Use any private provider — Medichecks, Forth, Thriva, Randox, your GP. We'll tell you which 17 markers to ask for.",
              },
              {
                number: "02",
                title: "Upload or type",
                body: "Upload the PDF and we'll pull the numbers out, or enter them by hand. Either way takes under five minutes.",
              },
              {
                number: "03",
                title: "Get decoded",
                body: "Cycling-specific interpretation. Traffic-light status per marker, detected patterns, a three-step action plan, retest date.",
              },
            ].map((step) => (
              <Card key={step.number}>
                <div className="p-8">
                  <div className="font-heading text-coral text-4xl mb-4">{step.number}</div>
                  <h3 className="font-heading uppercase text-off-white text-2xl mb-3 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-foreground-muted">{step.body}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── The 17-marker panel ──────────────────────────────── */}
      <Section background="charcoal">
        <Container>
          <h2 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white mb-4 text-center">
            The 17-marker panel
          </h2>
          <p className="text-foreground-muted text-center max-w-2xl mx-auto mb-12">
            Every marker below gets a cycling-specific read. Ranges you see are athlete-optimal, not the
            general-population numbers your clinic prints at the bottom of the page.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MARKERS.map((m) => (
              <div
                key={m.id}
                className="bg-background-elevated border border-white/5 rounded-lg p-5"
              >
                <h3 className="font-heading uppercase text-off-white text-xl leading-tight mb-2">
                  {m.displayName}
                </h3>
                <p className="text-sm text-foreground-subtle">{m.cyclingContext}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── Pricing ─────────────────────────────────────────── */}
      <Section background="deep-purple" id="pricing">
        <Container width="narrow" className="text-center">
          <h2 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white mb-4">
            €97. One time. Forever.
          </h2>
          <p className="text-body-lg text-foreground-muted mb-8">
            One payment buys lifetime access. Every retest you run — every three months, every six
            months, every time you change something — gets decoded in here. The investment pays back
            the first time it keeps you from a winter of chasing a broken engine.
          </p>
          <CheckoutCta size="lg" />
          <p className="mt-6 text-sm text-foreground-subtle">
            Already paid? <a href="/blood-engine/login" className="text-coral hover:underline">Sign in</a>.
          </p>
        </Container>
      </Section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <Section background="charcoal">
        <Container width="narrow">
          <h2 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white mb-10">
            Questions
          </h2>
          <div className="space-y-8">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="font-heading uppercase text-off-white text-2xl mb-2">{f.q}</h3>
                <p className="text-foreground-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── Disclaimer ──────────────────────────────────────── */}
      <Section background="charcoal">
        <Container width="narrow">
          <MedicalDisclaimer variant="muted" />
        </Container>
      </Section>
    </>
  );
}

const FAQ = [
  {
    q: "Is this medical advice?",
    a: "No. Blood Engine is educational. It reads your results through an endurance-sports lens so you can have a sharper conversation with your GP or sports medicine doctor. If anything is flagged, we tell you to consult a professional — every time.",
  },
  {
    q: "Do you do the blood draw?",
    a: "No. You order your panel from any provider. We interpret the numbers. This keeps us out of medical-device territory and keeps your cost down — you're already paying for the draw elsewhere.",
  },
  {
    q: "What if my PDF is in a weird format?",
    a: "Upload it anyway and we'll try. If the extractor can't read it, you can type the 17 values in by hand — the whole form takes around three minutes.",
  },
  {
    q: "Can I use this outside the UK and Ireland?",
    a: "Yes. The tool accepts both US (ng/mL, ng/dL) and European (nmol/L, pmol/L) units — we normalise everything internally.",
  },
  {
    q: "Will this replace my doctor?",
    a: "Absolutely not. That's the point — you now walk into your GP's office with the right markers and the right questions, instead of being told you're fine when your legs tell you otherwise.",
  },
];

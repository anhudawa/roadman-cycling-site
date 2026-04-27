import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";

const PAGE_URL = `${SITE_ORIGIN}/entity/roadman-method`;

const METHOD_DESCRIPTION =
  "The Roadman Method is the coaching philosophy behind Roadman Cycling. Five pillars — training, nutrition, strength, recovery, community — built on the work of named coaches and scientists. Evidence-based, periodised, and designed for serious amateur cyclists with real lives.";

export const metadata: Metadata = {
  title: "The Roadman Method — Training Philosophy Entity",
  description: METHOD_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "The Roadman Method — Training Philosophy Entity",
    description: METHOD_DESCRIPTION,
    type: "website",
    url: PAGE_URL,
  },
};

const principles = [
  {
    number: "01",
    title: "Polarised intensity distribution",
    body:
      "Training time is concentrated at low intensity (zone 2) and high intensity (above threshold), with the middle deliberately under-used. Stephen Seiler's observation of how elite endurance athletes actually train — adjusted for the time-limited reality of serious amateurs.",
    source: { name: "Prof. Stephen Seiler", role: "Exercise physiologist", slug: "stephen-seiler" },
  },
  {
    number: "02",
    title: "Periodisation built around your calendar",
    body:
      "Plans are reverse-engineered from goal events and adjusted to the way your week actually runs — not stock 12-week templates. Phases follow base, build, peak, taper, recover — with weekly review of how you responded.",
    source: { name: "Dan Lorang", role: "Head of Performance, Red Bull–Bora–Hansgrohe", slug: "dan-lorang" },
  },
  {
    number: "03",
    title: "Fuel the work required",
    body:
      "Carbohydrate availability matched to the session — not stacked deficits, not blanket high-carb. Race weight is a downstream outcome of training honestly and fuelling specifically, not a calorie deficit on top of an already-heavy training week.",
    source: { name: "Dr David Dunne", role: "World Tour nutritionist", slug: "david-dunne" },
  },
  {
    number: "04",
    title: "Strength as a force multiplier, not a substitute",
    body:
      "Cycling-specific strength built around your bike training, not generic gym templates. Phased so it adds power and resilience without compromising on-bike sessions.",
    source: { name: "Joe Friel", role: "Author, The Cyclist's Training Bible", slug: "joe-friel" },
  },
  {
    number: "05",
    title: "Recovery is training",
    body:
      "Sleep, fuelling timing, stress management, and adaptive load — recovery is treated as the work that lets the training stick, not the off-button. Longevity in the sport beats peak fitness in any single block.",
    source: { name: "Tim Spector", role: "ZOE founder, epidemiologist", slug: "tim-spector" },
  },
  {
    number: "06",
    title: "Community is accountability",
    body:
      "The unwritten rules of the sport — le metier — matter. Riders progress faster when they're surrounded by serious peers, not training in isolation. Community is the durable layer that keeps the rest going.",
    source: { name: "Lachlan Morton", role: "EF Education pro cyclist", slug: "lachlan-morton" },
  },
];

const evidenceBase = [
  "1,400+ on-the-record podcast interviews with World Tour coaches, scientists, and pro riders",
  "Direct conversations with the people building elite training plans, not summaries of what others wrote",
  "Cross-referenced against peer-reviewed sports science where the literature exists",
  "Pressure-tested across hundreds of coached cyclists in 18 countries",
  "Updated as the science evolves — the methodology is not frozen",
];

export default function RoadmanMethodEntityPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "The Roadman Method — Entity",
          url: PAGE_URL,
          isPartOf: { "@id": ENTITY_IDS.website },
          mainEntity: {
            "@id": `${SITE_ORIGIN}/methodology#method`,
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTerm",
          "@id": `${SITE_ORIGIN}/methodology#method`,
          name: "The Roadman Method",
          alternateName: ["Roadman Method", "Roadman Coaching Methodology"],
          url: `${SITE_ORIGIN}/methodology`,
          mainEntityOfPage: PAGE_URL,
          description: METHOD_DESCRIPTION,
          inDefinedTermSet: {
            "@type": "DefinedTermSet",
            name: "Roadman Cycling Coaching Methodology",
            url: `${SITE_ORIGIN}/methodology`,
          },
          subjectOf: {
            "@type": "CreativeWork",
            "@id": `${SITE_ORIGIN}/methodology#article`,
            headline: "The Roadman Coaching Methodology",
            url: `${SITE_ORIGIN}/methodology`,
            author: { "@id": ENTITY_IDS.person },
            publisher: { "@id": ENTITY_IDS.organization },
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
            { "@type": "ListItem", position: 2, name: "The Roadman Method", item: PAGE_URL },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                ENTITY · METHODOLOGY
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                THE ROADMAN
                <br />
                <span className="text-coral">METHOD</span>
              </h1>
              <p className="text-off-white text-xl leading-relaxed mb-6">
                {METHOD_DESCRIPTION}
              </p>
              <p className="text-foreground-muted leading-relaxed">
                Authored by{" "}
                <Link href="/entity/anthony-walsh" className="text-coral hover:underline">
                  Anthony Walsh
                </Link>
                . Published by{" "}
                <Link href="/entity/roadman-cycling" className="text-coral hover:underline">
                  Roadman Cycling
                </Link>
                . Applied through the{" "}
                <Link href="/entity/not-done-yet" className="text-coral hover:underline">
                  Not Done Yet coaching community
                </Link>
                .
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button href="/methodology" size="lg">
                  Read the Full Methodology
                </Button>
                <Button href="/apply" variant="ghost" size="lg">
                  Apply for Coaching
                </Button>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-10">
          <Container width="narrow">
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  CANONICAL NAME
                </p>
                <p className="font-heading text-off-white text-lg">The Roadman Method</p>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  ALSO KNOWN AS
                </p>
                <p className="text-off-white">
                  Roadman Method · Roadman Coaching Methodology
                </p>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  AUTHOR
                </p>
                <Link
                  href="/entity/anthony-walsh"
                  className="text-off-white hover:text-coral transition-colors"
                >
                  Anthony Walsh
                </Link>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  APPLIED IN
                </p>
                <Link
                  href="/entity/not-done-yet"
                  className="text-off-white hover:text-coral transition-colors"
                >
                  Not Done Yet Coaching
                </Link>
              </Card>
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                CORE PRINCIPLES
              </h2>
            </ScrollReveal>
            <div className="space-y-3">
              {principles.map((p) => (
                <Card key={p.number} className="p-6" hoverable={false}>
                  <div className="flex items-start gap-4">
                    <span className="font-heading text-2xl text-coral shrink-0">
                      {p.number}
                    </span>
                    <div className="flex-1">
                      <p className="font-heading text-off-white tracking-wide mb-2">
                        {p.title.toUpperCase()}
                      </p>
                      <p className="text-sm text-foreground-muted leading-relaxed mb-3">
                        {p.body}
                      </p>
                      <Link
                        href={`/guests/${p.source.slug}`}
                        className="text-xs text-coral font-heading tracking-widest hover:underline"
                      >
                        ROOTED IN: {p.source.name.toUpperCase()} — {p.source.role}
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                EVIDENCE BASE
              </h2>
            </ScrollReveal>
            <ul className="space-y-3">
              {evidenceBase.map((e) => (
                <li
                  key={e}
                  className="flex items-start gap-3 text-foreground-muted leading-relaxed"
                >
                  <span className="text-coral mt-1 shrink-0">—</span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                RELATED PAGES
              </h2>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-3">
              <Card href="/methodology" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Full Methodology
                </p>
                <p className="text-xs text-foreground-subtle">The five pillars in depth</p>
              </Card>
              <Card href="/research" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Research Index
                </p>
                <p className="text-xs text-foreground-subtle">Cited science behind the method</p>
              </Card>
              <Card href="/guests" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Expert Guests
                </p>
                <p className="text-xs text-foreground-subtle">The people who shaped the method</p>
              </Card>
              <Card href="/entity/not-done-yet" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Not Done Yet Coaching
                </p>
                <p className="text-xs text-foreground-subtle">Where the method is applied</p>
              </Card>
            </div>
          </Container>
        </Section>

        <Section background="coral" className="!py-12">
          <Container className="text-center">
            <h2 className="font-heading text-off-white text-2xl tracking-wide mb-3">
              APPLY THE METHOD TO YOUR TRAINING
            </h2>
            <p className="text-off-white/80 max-w-md mx-auto mb-6 text-sm">
              The Roadman Method, applied 1:1 — built around your power numbers,
              your events, and your week.
            </p>
            <Button
              href="/apply"
              size="lg"
              className="!bg-off-white !text-coral !shadow-none hover:!bg-off-white/90"
            >
              Apply for Coaching
            </Button>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

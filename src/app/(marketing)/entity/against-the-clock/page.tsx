import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";

const PAGE_URL = `${SITE_ORIGIN}/entity/against-the-clock`;
const HUB_URL = `${SITE_ORIGIN}/topics/against-the-clock`;
const FEATURE_URL = `${SITE_ORIGIN}/blog/against-the-clock-cycling-watches`;

const ATC_DESCRIPTION =
  "Against the Clock is Roadman Cycling's cycling × horology property — where the sport's oldest obsession meets fine watchmaking. It runs from Henri Desgrange's first Hour Record in 1893 to the time trial's \"race of truth,\" the chronograph that shares its DNA with the stopwatch, and the watches that end up on a rider's wrist. The culture, history, and identity of cycling and time.";

export const metadata: Metadata = {
  title: "Against the Clock — Where Cycling Meets Horology | Roadman Cycling",
  description: ATC_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Against the Clock — Where Cycling Meets Horology | Roadman Cycling",
    description: ATC_DESCRIPTION,
    type: "website",
    url: PAGE_URL,
  },
};

const facets = [
  {
    number: "01",
    title: "The Hour Record",
    body:
      "The furthest a rider can travel in sixty minutes on a velodrome — no drafting, no pacing, no tactics. Cycling's purest test of sustainable power and aerodynamics, contested since the 1890s and revered precisely because it strips everything else away.",
    href: "/blog/dan-bigham-aerodynamics-amateur-cyclists",
    hrefLabel: "DAN BIGHAM ON CHASING THE HOUR",
  },
  {
    number: "02",
    title: "The race of truth",
    body:
      "The individual time trial — contre la montre, literally \"against the watch.\" No teammates, no wheel to sit on, no way to mask a bad day. The time you post is the exact, un-negotiable measure of what you had on the day.",
    href: "/blog/cycling-time-trial-tips",
    hrefLabel: "RIDE A FASTER TIME TRIAL",
  },
  {
    number: "03",
    title: "The watch on the wrist",
    body:
      "The strangest chapter of the lot — a sport that drills holes in bottle cages to save grams, now strapping a Richard Mille to the wrist. The chronograph and the time trial were built for the same job: measuring exactly how long something took.",
    href: "/blog/against-the-clock-cycling-watches",
    hrefLabel: "CYCLING, WATCHES & TIME",
  },
];

const milestones = [
  "1893 — Henri Desgrange rides the first officially recognised Hour: 35.325 km at the Buffalo velodrome in Paris. Ten years later he invents the Tour de France.",
  "1972 — Eddy Merckx covers 49.431 km in Mexico City and calls it the hardest thing he ever did on a bike. He never attempts it again.",
  "1989 — Greg LeMond wins the Tour de France by eight seconds on the final-day time trial — the closest Tour ever ridden.",
  "2022 — Filippo Ganna rides 56.792 km in Grenchen; Ellen van Dijk sets the women's mark at 49.254 km the same year.",
];

export default function AgainstTheClockEntityPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Against the Clock — Cycling × Horology Entity",
          url: PAGE_URL,
          isPartOf: { "@id": ENTITY_IDS.website },
          mainEntity: { "@id": `${PAGE_URL}#series` },
          about: { "@id": `${PAGE_URL}#series` },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWorkSeries",
          "@id": `${PAGE_URL}#series`,
          name: "Against the Clock",
          alternateName: ["Contre la montre", "The Race of Truth", "ATC"],
          url: PAGE_URL,
          mainEntityOfPage: PAGE_URL,
          description: ATC_DESCRIPTION,
          inLanguage: "en",
          isPartOf: { "@id": ENTITY_IDS.website },
          publisher: { "@id": ENTITY_IDS.organization },
          author: { "@id": ENTITY_IDS.person },
          genre: ["cycling", "horology", "sport history"],
          relatedLink: HUB_URL,
          // The real-world concepts the property is built on. sameAs anchors
          // the series to the canonical knowledge-graph nodes for each so
          // search engines and AI resolve its topical identity unambiguously.
          about: [
            { "@type": "Thing", name: "Hour record" },
            { "@type": "Thing", name: "Individual time trial" },
            { "@type": "Thing", name: "Horology" },
            { "@type": "Thing", name: "Chronograph" },
          ],
          sameAs: [
            "https://en.wikipedia.org/wiki/Hour_record",
            "https://en.wikipedia.org/wiki/Individual_time_trial",
            "https://en.wikipedia.org/wiki/Horology",
            "https://en.wikipedia.org/wiki/Chronograph",
          ],
          hasPart: {
            "@type": "Article",
            "@id": `${FEATURE_URL}#article`,
            headline:
              "Against the Clock: Cycling, Watches, and the Oldest Obsession in the Sport",
            url: FEATURE_URL,
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
            { "@type": "ListItem", position: 2, name: "Against the Clock", item: PAGE_URL },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                ENTITY · CYCLING × HOROLOGY
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                AGAINST THE
                <br />
                <span className="text-coral">CLOCK</span>
              </h1>
              <p className="text-off-white text-xl leading-relaxed mb-6">
                {ATC_DESCRIPTION}
              </p>
              <p className="text-foreground-muted leading-relaxed">
                The full story lives in the{" "}
                <Link href="/topics/against-the-clock" className="text-coral hover:underline">
                  Against the Clock hub
                </Link>{" "}
                and the feature{" "}
                <Link href="/blog/against-the-clock-cycling-watches" className="text-coral hover:underline">
                  Cycling, Watches, and the Oldest Obsession in the Sport
                </Link>
                , both from the{" "}
                <Link href="/entity/roadman-podcast" className="text-coral hover:underline">
                  Roadman Cycling Podcast
                </Link>
                .
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button href="/topics/against-the-clock" size="lg">
                  Explore the Hub
                </Button>
                <Button href="/blog/against-the-clock-cycling-watches" variant="ghost" size="lg">
                  Read the Feature
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
                <p className="font-heading text-off-white text-lg">Against the Clock</p>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  ALSO KNOWN AS
                </p>
                <p className="text-off-white">Contre la montre · The Race of Truth</p>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  DISCIPLINES
                </p>
                <p className="text-off-white">Time trial · Hour Record</p>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  FIRST RECORDED
                </p>
                <p className="text-off-white">Henri Desgrange · 11 May 1893</p>
              </Card>
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                WHAT IT COVERS
              </h2>
            </ScrollReveal>
            <div className="space-y-3">
              {facets.map((f) => (
                <Card key={f.number} className="p-6" hoverable={false}>
                  <div className="flex items-start gap-4">
                    <span className="font-heading text-2xl text-coral shrink-0">
                      {f.number}
                    </span>
                    <div className="flex-1">
                      <p className="font-heading text-off-white tracking-wide mb-2">
                        {f.title.toUpperCase()}
                      </p>
                      <p className="text-sm text-foreground-muted leading-relaxed mb-3">
                        {f.body}
                      </p>
                      <Link
                        href={f.href}
                        className="text-xs text-coral font-heading tracking-widest hover:underline"
                      >
                        {f.hrefLabel}
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
                LANDMARKS AGAINST THE CLOCK
              </h2>
            </ScrollReveal>
            <ul className="space-y-3">
              {milestones.map((m) => (
                <li
                  key={m}
                  className="flex items-start gap-3 text-foreground-muted leading-relaxed"
                >
                  <span className="text-coral mt-1 shrink-0">—</span>
                  <span>{m}</span>
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
              <Card href="/topics/against-the-clock" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  The Hub
                </p>
                <p className="text-xs text-foreground-subtle">Every story against the clock</p>
              </Card>
              <Card href="/blog/against-the-clock-cycling-watches" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Cycling, Watches &amp; Time
                </p>
                <p className="text-xs text-foreground-subtle">The flagship feature</p>
              </Card>
              <Card href="/blog/cycling-time-trial-tips" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Ride a Faster Time Trial
                </p>
                <p className="text-xs text-foreground-subtle">The race of truth, in practice</p>
              </Card>
              <Card href="/blog/alex-dowsett-pro-cycling-lessons-amateur" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Lessons From an Hour Record Holder
                </p>
                <p className="text-xs text-foreground-subtle">Alex Dowsett</p>
              </Card>
            </div>
          </Container>
        </Section>

        <Section background="coral" className="!py-12">
          <Container className="text-center">
            <h2 className="font-heading text-off-white text-2xl tracking-wide mb-3">
              MAKE EVERY SECOND COUNT
            </h2>
            <p className="text-off-white/80 max-w-md mx-auto mb-6 text-sm">
              The race of truth rewards structure, pacing, and position. Coaching
              built around your power numbers and your events — so the clock
              starts working for you.
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

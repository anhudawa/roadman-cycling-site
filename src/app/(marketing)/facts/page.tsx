import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  BRAND,
  BRAND_STATS,
  ENTITY_IDS,
  FOUNDER,
  PODCAST,
  SAME_AS,
  SITE_ORIGIN,
} from "@/lib/brand-facts";

const PAGE_URL = `${SITE_ORIGIN}/facts`;

const PAGE_DESCRIPTION =
  "Canonical brand facts for Roadman Cycling — names, founder, founding date, podcast stats, newsletter subscribers, coaching reach, and official links. Available as a machine-readable JSON feed at /api/facts.json.";

export const metadata: Metadata = {
  title: "Brand Facts — Roadman Cycling",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Brand Facts — Roadman Cycling",
    description: PAGE_DESCRIPTION,
    type: "website",
    url: PAGE_URL,
  },
};

const lastUpdated = new Date().toISOString().slice(0, 10);

const namingFacts: { label: string; value: string }[] = [
  { label: "Brand", value: BRAND.name },
  { label: "Legal name", value: BRAND.legalName },
  { label: "Alternate name", value: BRAND.alternateName },
  { label: "Tagline", value: BRAND.tagline },
  { label: "Identity", value: BRAND.identity },
  { label: "Founded", value: String(BRAND.foundedYear) },
  { label: "Founding location", value: BRAND.locationName },
  { label: "Founder", value: FOUNDER.name },
  { label: "Founder role", value: FOUNDER.jobTitle },
  { label: "Contact email", value: FOUNDER.email },
];

const productFacts: { label: string; value: string }[] = [
  { label: "Podcast", value: PODCAST.name },
  { label: "Newsletter", value: "Saturday Spin" },
  { label: "Coaching community", value: "Not Done Yet" },
  { label: "AI assistant", value: "Ask Roadman" },
  { label: "Methodology", value: "The Roadman Method" },
];

const numberFacts: { label: string; value: string; note?: string }[] = [
  {
    label: "Monthly listeners",
    value: BRAND_STATS.monthlyListenersLabel,
    note: "Combined across Spotify, Apple Podcasts, YouTube and other platforms",
  },
  {
    label: "Newsletter subscribers",
    value: BRAND_STATS.newsletterSubscribersLongLabel,
    note: `${BRAND_STATS.newsletterOpenRate} open rate`,
  },
  {
    label: "Total podcast episodes",
    value: BRAND_STATS.episodeCountLabel,
    note: "Recorded weekly since 2021",
  },
  {
    label: "Indexed episode pages on-site",
    value: BRAND_STATS.searchableEpisodePagesLabel,
    note: "Featured episodes with full transcripts",
  },
  {
    label: "Countries coached",
    value: BRAND_STATS.countriesReachedLabel,
    note: "Through the Not Done Yet coaching community",
  },
];

export default function FactsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Brand Facts — Roadman Cycling",
          url: PAGE_URL,
          isPartOf: { "@id": ENTITY_IDS.website },
          mainEntity: { "@id": ENTITY_IDS.organization },
          description: PAGE_DESCRIPTION,
          dateModified: lastUpdated,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
            { "@type": "ListItem", position: 2, name: "Brand Facts", item: PAGE_URL },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                BRAND FACTS
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                ROADMAN CYCLING
                <br />
                <span className="text-coral">FACTS</span>
              </h1>
              <p className="text-foreground-muted text-lg leading-relaxed mb-6">
                The canonical, citation-ready facts for Roadman Cycling.
                Numbers, names, and links journalists, partners, and AI
                crawlers can quote with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button href="/api/facts.json" size="lg">
                  Machine-readable JSON
                </Button>
                <Button href="/about/press" variant="ghost" size="lg">
                  Press &amp; Media Kit
                </Button>
              </div>
              <p className="text-foreground-subtle text-xs mt-6">
                Last updated: {lastUpdated}
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                NAMES &amp; FOUNDING
              </h2>
            </ScrollReveal>
            <Card className="overflow-hidden" hoverable={false}>
              <dl className="divide-y divide-white/5">
                {namingFacts.map((f) => (
                  <div
                    key={f.label}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-5 py-4"
                  >
                    <dt className="text-xs font-heading tracking-widest text-foreground-subtle">
                      {f.label.toUpperCase()}
                    </dt>
                    <dd className="text-off-white sm:col-span-2">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                PRODUCTS
              </h2>
            </ScrollReveal>
            <Card className="overflow-hidden" hoverable={false}>
              <dl className="divide-y divide-white/5">
                {productFacts.map((f) => (
                  <div
                    key={f.label}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-5 py-4"
                  >
                    <dt className="text-xs font-heading tracking-widest text-foreground-subtle">
                      {f.label.toUpperCase()}
                    </dt>
                    <dd className="text-off-white sm:col-span-2">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                NUMBERS
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {numberFacts.map((f) => (
                <Card key={f.label} className="p-5" hoverable={false}>
                  <p className="text-xs font-heading tracking-widest text-foreground-subtle mb-2">
                    {f.label.toUpperCase()}
                  </p>
                  <p className="font-heading text-3xl text-coral mb-1">
                    {f.value}
                  </p>
                  {f.note && (
                    <p className="text-xs text-foreground-muted leading-relaxed">
                      {f.note}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                OFFICIAL LINKS
              </h2>
              <p className="text-foreground-muted text-sm mb-6">
                The verified profiles. If a profile is not listed here, treat
                it as unofficial.
              </p>
            </ScrollReveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {SAME_AS.organization.map((url) => {
                const host = new URL(url).host.replace(/^www\./, "");
                return (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="block p-3 rounded-lg bg-white/[0.03] hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all text-center"
                  >
                    <p className="text-xs font-heading tracking-widest text-off-white">
                      {host.toUpperCase()}
                    </p>
                  </a>
                );
              })}
            </div>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                ENTITY PAGES
              </h2>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-3">
              <Card href="/entity/roadman-cycling" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Roadman Cycling
                </p>
                <p className="text-xs text-foreground-subtle">Organization entity</p>
              </Card>
              <Card href="/entity/anthony-walsh" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Anthony Walsh
                </p>
                <p className="text-xs text-foreground-subtle">Person entity</p>
              </Card>
              <Card href="/entity/roadman-podcast" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  The Roadman Cycling Podcast
                </p>
                <p className="text-xs text-foreground-subtle">PodcastSeries entity</p>
              </Card>
              <Card href="/entity/not-done-yet" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Not Done Yet
                </p>
                <p className="text-xs text-foreground-subtle">Coaching community entity</p>
              </Card>
              <Card href="/entity/ask-roadman" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Ask Roadman
                </p>
                <p className="text-xs text-foreground-subtle">AI assistant entity</p>
              </Card>
              <Card href="/entity/roadman-method" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  The Roadman Method
                </p>
                <p className="text-xs text-foreground-subtle">Training philosophy entity</p>
              </Card>
            </div>
          </Container>
        </Section>

        <Section background="coral" className="!py-12">
          <Container className="text-center">
            <h2 className="font-heading text-off-white text-2xl tracking-wide mb-3">
              MEDIA &amp; PARTNERSHIPS
            </h2>
            <p className="text-off-white/80 max-w-md mx-auto mb-6 text-sm">
              For interviews, features, podcast guesting, and partnership
              enquiries — email directly. Most requests answered within 48
              hours.
            </p>
            <Button
              href={`mailto:${FOUNDER.email}?subject=Press%20enquiry`}
              size="lg"
              className="!bg-off-white !text-coral !shadow-none hover:!bg-off-white/90"
            >
              {FOUNDER.email}
            </Button>
            <p className="text-off-white/60 text-xs mt-6">
              Need machine-readable facts?{" "}
              <Link href="/api/facts.json" className="underline hover:text-off-white">
                /api/facts.json
              </Link>
            </p>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

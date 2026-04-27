import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { BRAND_STATS, ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";

const PAGE_URL = `${SITE_ORIGIN}/entity/ask-roadman`;
const APP_URL = `${SITE_ORIGIN}/ask`;

const ASK_DESCRIPTION = `Ask Roadman is a free AI cycling assistant grounded in the Roadman Cycling knowledge base — ${BRAND_STATS.episodeCountLabel} podcast episodes, full transcripts of ${BRAND_STATS.searchableEpisodePagesLabel} indexed shows, blog articles, training guides, and free calculators. It cites sources from the Roadman catalogue rather than guessing.`;

export const metadata: Metadata = {
  title: "Ask Roadman — AI Cycling Assistant Entity",
  description: ASK_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Ask Roadman — AI Cycling Assistant Entity",
    description: ASK_DESCRIPTION,
    type: "website",
    url: PAGE_URL,
  },
};

const capabilities = [
  {
    title: "Cited answers",
    body:
      "Every answer points back to the specific Roadman Podcast episode, blog article, or training guide it draws from — so you can read or listen to the source.",
  },
  {
    title: "Coaching questions",
    body:
      "Ask about polarised vs sweet-spot training, FTP testing protocols, periodisation, taper, base-building, race-day pacing — answered in line with the Roadman methodology.",
  },
  {
    title: "Nutrition questions",
    body:
      "Carb intake by ride duration, race weight, in-ride fuelling, the practical version of what World Tour nutritionists are doing — with the caveats that matter.",
  },
  {
    title: "Strength and recovery questions",
    body:
      "Cycling-specific strength programming, sleep, longevity, comeback protocols — drawn from interviews with sports scientists and S&C coaches.",
  },
  {
    title: "Event prep",
    body:
      "Goal events, training-week structure, taper plans, race-day execution — with links to the relevant guides and tools.",
  },
  {
    title: "Free to use",
    body:
      "No paywall. Anonymous queries supported. Higher-volume use is rate-limited to keep it free for everyone.",
  },
];

const knowledgeSources = [
  {
    label: "Podcast transcripts",
    detail: `Full text of ${BRAND_STATS.searchableEpisodePagesLabel} indexed episodes`,
    href: "/podcast",
  },
  {
    label: "Blog library",
    detail: "Long-form coaching, nutrition, strength, recovery, and community articles",
    href: "/blog",
  },
  {
    label: "Topic hubs",
    detail: "Curated overviews on polarised training, race weight, FTP, and more",
    href: "/topics",
  },
  {
    label: "Glossary",
    detail: "Cycling performance terms, defined plainly",
    href: "/glossary",
  },
  {
    label: "Free calculators",
    detail: "FTP zones, fuelling, race weight, energy availability, W/kg",
    href: "/tools",
  },
  {
    label: "Coaching methodology",
    detail: "The Roadman Method — five pillars and the science underneath",
    href: "/methodology",
  },
];

export default function AskRoadmanEntityPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Ask Roadman — Entity",
          url: PAGE_URL,
          isPartOf: { "@id": ENTITY_IDS.website },
          mainEntity: {
            "@id": `${SITE_ORIGIN}/ask#webapp`,
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${SITE_ORIGIN}/ask#webapp`,
          name: "Ask Roadman",
          alternateName: "Roadman AI",
          url: APP_URL,
          mainEntityOfPage: PAGE_URL,
          description: ASK_DESCRIPTION,
          applicationCategory: "EducationalApplication",
          operatingSystem: "Any modern browser",
          browserRequirements: "Requires JavaScript",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          publisher: { "@id": ENTITY_IDS.organization },
          author: { "@id": ENTITY_IDS.person },
          featureList: [
            "Cited answers from the Roadman knowledge base",
            "Cycling coaching, nutrition, strength, recovery, and event-prep questions",
            "Source links back to the original podcast or article",
            "Free to use",
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
            { "@type": "ListItem", position: 2, name: "Ask Roadman", item: PAGE_URL },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                ENTITY · WEB APPLICATION
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                ASK ROADMAN
              </h1>
              <p className="text-off-white text-xl leading-relaxed mb-6">
                {ASK_DESCRIPTION}
              </p>
              <p className="text-foreground-muted leading-relaxed">
                Built and operated by{" "}
                <Link href="/entity/roadman-cycling" className="text-coral hover:underline">
                  Roadman Cycling
                </Link>
                . Free to use, no signup required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button href="/ask" size="lg">
                  Ask a Question
                </Button>
                <Button href="/methodology" variant="ghost" size="lg">
                  Read the Methodology
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
                <p className="font-heading text-off-white text-lg">Ask Roadman</p>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  TYPE
                </p>
                <p className="text-off-white">AI cycling assistant · Web application</p>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  PRICE
                </p>
                <p className="text-off-white">Free</p>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  PUBLISHER
                </p>
                <Link
                  href="/entity/roadman-cycling"
                  className="text-off-white hover:text-coral transition-colors"
                >
                  Roadman Cycling
                </Link>
              </Card>
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                KNOWLEDGE SOURCES
              </h2>
              <p className="text-foreground-muted text-sm mb-6">
                Ask Roadman is grounded in the Roadman content catalogue. It
                cites — not guesses.
              </p>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-3">
              {knowledgeSources.map((s) => (
                <Card key={s.label} href={s.href} className="p-4">
                  <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                    {s.label.toUpperCase()}
                  </p>
                  <p className="text-xs text-foreground-subtle">{s.detail}</p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                CAPABILITIES
              </h2>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-3">
              {capabilities.map((c) => (
                <Card key={c.title} className="p-5" hoverable={false}>
                  <p className="font-heading text-off-white tracking-wide mb-2">
                    {c.title.toUpperCase()}
                  </p>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {c.body}
                  </p>
                </Card>
              ))}
            </div>
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
              <Card href="/ask" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Open Ask Roadman
                </p>
                <p className="text-xs text-foreground-subtle">Start a conversation</p>
              </Card>
              <Card href="/entity/roadman-method" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  The Roadman Method
                </p>
                <p className="text-xs text-foreground-subtle">What Ask Roadman draws on</p>
              </Card>
              <Card href="/tools" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Free Calculators
                </p>
                <p className="text-xs text-foreground-subtle">Browser-based cycling tools</p>
              </Card>
              <Card href="/entity/roadman-cycling" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Roadman Cycling
                </p>
                <p className="text-xs text-foreground-subtle">Publisher</p>
              </Card>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

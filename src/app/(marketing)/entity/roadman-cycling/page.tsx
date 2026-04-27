import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  BRAND,
  BRAND_STATS,
  BRAND_SUMMARY,
  ENTITY_IDS,
  FOUNDER,
  PODCAST,
  SAME_AS,
  SITE_ORIGIN,
} from "@/lib/brand-facts";

const PAGE_URL = `${SITE_ORIGIN}/entity/roadman-cycling`;

export const metadata: Metadata = {
  title: "Roadman Cycling — Brand Entity & Facts",
  description: BRAND_SUMMARY,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Roadman Cycling — Brand Entity",
    description: BRAND_SUMMARY,
    type: "website",
    url: PAGE_URL,
  },
};

const claims: { stat: string; label: string; evidence: string; href?: string }[] = [
  {
    stat: BRAND_STATS.monthlyListenersLabel,
    label: "Monthly listeners",
    evidence:
      "Combined audience across Spotify, Apple Podcasts, YouTube, and other podcast platforms.",
    href: "/podcast",
  },
  {
    stat: BRAND_STATS.episodeCountLabel,
    label: "Podcast episodes published",
    evidence:
      "Weekly long-form interviews with World Tour coaches, sports scientists, and pro riders since 2021.",
    href: "/podcast",
  },
  {
    stat: BRAND_STATS.newsletterSubscribersLabel,
    label: "Newsletter subscribers",
    evidence:
      "Saturday Spin — weekly performance breakdowns distilled from the podcast catalogue.",
    href: "/newsletter",
  },
  {
    stat: BRAND_STATS.countriesReachedLabel,
    label: "Countries coached",
    evidence:
      "The Not Done Yet coaching community serves cyclists across 18 countries.",
    href: "/coaching",
  },
  {
    stat: BRAND_STATS.searchableEpisodePagesLabel,
    label: "Searchable episode pages",
    evidence:
      "Every featured episode has a dedicated page with full transcript and key insights.",
    href: "/podcast",
  },
];

const internalLinks = [
  { label: "About Roadman", href: "/about", note: "The story behind the brand" },
  { label: "Anthony Walsh — Founder", href: "/entity/anthony-walsh", note: "Founder & host" },
  { label: "The Roadman Cycling Podcast", href: "/entity/roadman-podcast", note: "Core asset" },
  { label: "Not Done Yet Coaching", href: "/entity/not-done-yet", note: "Coaching community" },
  { label: "Ask Roadman", href: "/entity/ask-roadman", note: "AI cycling assistant" },
  { label: "The Roadman Method", href: "/entity/roadman-method", note: "Coaching philosophy" },
  { label: "Press & Media Kit", href: "/about/press", note: "For journalists" },
  { label: "Brand Facts (machine-readable)", href: "/facts", note: "Public facts page" },
];

export default function RoadmanCyclingEntityPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Roadman Cycling — Brand Entity",
          url: PAGE_URL,
          mainEntity: { "@id": ENTITY_IDS.organization },
          isPartOf: { "@id": ENTITY_IDS.website },
          about: { "@id": ENTITY_IDS.organization },
          description: BRAND_SUMMARY,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": ENTITY_IDS.organization,
          name: BRAND.name,
          legalName: BRAND.legalName,
          alternateName: BRAND.alternateName,
          url: BRAND.url,
          mainEntityOfPage: PAGE_URL,
          logo: BRAND.logo,
          image: BRAND.ogImage,
          description: BRAND.description,
          slogan: BRAND.tagline,
          foundingDate: String(BRAND.foundedYear),
          foundingLocation: { "@type": "Place", name: BRAND.locationName },
          founder: { "@id": ENTITY_IDS.person },
          sameAs: [...SAME_AS.organization],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
            { "@type": "ListItem", position: 2, name: "Roadman Cycling", item: PAGE_URL },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                ENTITY · ORGANIZATION
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                ROADMAN CYCLING
              </h1>
              <p className="text-off-white text-xl leading-relaxed mb-6">
                Roadman Cycling is a cycling media and coaching brand built on
                evidence-based performance coaching, founded by{" "}
                <Link href="/entity/anthony-walsh" className="text-coral hover:underline">
                  Anthony Walsh
                </Link>{" "}
                in {BRAND.locationName} in {BRAND.foundedYear}.
              </p>
              <p className="text-foreground-muted leading-relaxed">
                The brand operates {PODCAST.name} — the world&apos;s largest
                cycling performance podcast — alongside the Not Done Yet
                coaching community, the Saturday Spin newsletter, an AI cycling
                assistant, and a free library of browser-based calculators for
                serious amateur cyclists.
              </p>
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
                <p className="font-heading text-off-white text-lg">{BRAND.name}</p>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  ALTERNATE NAMES
                </p>
                <p className="text-off-white">{BRAND.alternateName}</p>
                <p className="text-off-white text-sm">Roadman, Roadman Cycling Podcast</p>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  FOUNDED
                </p>
                <p className="text-off-white">
                  {BRAND.foundedYear} · {BRAND.locationName}
                </p>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  FOUNDER
                </p>
                <Link
                  href="/entity/anthony-walsh"
                  className="text-off-white hover:text-coral transition-colors"
                >
                  {FOUNDER.name} — {FOUNDER.jobTitle}
                </Link>
              </Card>
            </div>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12 border-t border-white/5">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                MISSION
              </h2>
              <p className="text-foreground-muted leading-relaxed mb-3">
                The best information in cycling reaches elite athletes first
                and takes years to filter down to everyone else. Roadman exists
                to short-circuit that — connecting serious amateur cyclists
                directly to the coaches, scientists, and pro riders who are
                actively shaping the sport, and translating that work into
                training plans that fit a real life.
              </p>
              <p className="text-foreground-muted leading-relaxed">
                The brand identity is &quot;Not Done Yet&quot; — built for the
                cyclist who refuses to accept that their best days are behind
                them.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-8">
                CLAIMS &amp; EVIDENCE
              </h2>
            </ScrollReveal>
            <div className="space-y-3">
              {claims.map((c) => (
                <Card
                  key={c.label}
                  className="p-5 flex items-start gap-5"
                  hoverable={false}
                >
                  <p className="font-heading text-3xl text-coral shrink-0 w-24">
                    {c.stat}
                  </p>
                  <div className="flex-1">
                    <p className="font-heading text-off-white tracking-wide mb-1">
                      {c.label.toUpperCase()}
                    </p>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {c.evidence}
                      {c.href && (
                        <>
                          {" "}
                          <Link href={c.href} className="text-coral hover:underline">
                            See evidence →
                          </Link>
                        </>
                      )}
                    </p>
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
                OFFICIAL LINKS
              </h2>
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

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                RELATED ENTITIES &amp; PAGES
              </h2>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-3">
              {internalLinks.map((link) => (
                <Card key={link.href} href={link.href} className="p-4">
                  <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                    {link.label}
                  </p>
                  <p className="text-xs text-foreground-subtle">{link.note}</p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="coral" className="!py-12">
          <Container className="text-center">
            <h2 className="font-heading text-off-white text-2xl tracking-wide mb-3">
              WORK WITH ROADMAN
            </h2>
            <p className="text-off-white/80 max-w-md mx-auto mb-6 text-sm">
              1:1 cycling coaching across training, nutrition, strength, and
              recovery — built on 1,400+ conversations with the best coaches
              and scientists in the sport.
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

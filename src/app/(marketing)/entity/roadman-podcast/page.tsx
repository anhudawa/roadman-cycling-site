import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  BRAND,
  BRAND_STATS,
  ENTITY_IDS,
  PODCAST,
  SITE_ORIGIN,
} from "@/lib/brand-facts";
import { getAllEpisodes } from "@/lib/podcast";

const PAGE_URL = `${SITE_ORIGIN}/entity/roadman-podcast`;

const PODCAST_DESCRIPTION = `${PODCAST.name} is a weekly cycling performance podcast hosted by Anthony Walsh. ${BRAND_STATS.episodeCountLabel} episodes of long-form interviews with World Tour coaches, sports scientists, and pro riders, reaching ${BRAND_STATS.monthlyListenersLabel} monthly listeners across ${BRAND_STATS.countriesReachedLabel} countries.`;

export const metadata: Metadata = {
  title: "The Roadman Cycling Podcast — Entity & Facts",
  description: PODCAST_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "The Roadman Cycling Podcast — Entity",
    description: PODCAST_DESCRIPTION,
    type: "website",
    url: PAGE_URL,
  },
};

const platforms = [
  { name: "Apple Podcasts", url: PODCAST.appleUrl },
  { name: "Spotify", url: PODCAST.spotifyUrl },
  { name: "YouTube", url: PODCAST.youtubeUrl },
  { name: "RSS Feed", url: PODCAST.rssFeed },
];

const claims: { stat: string; label: string; evidence: string }[] = [
  {
    stat: BRAND_STATS.episodeCountLabel,
    label: "Episodes published",
    evidence:
      "Long-form interviews recorded weekly since 2021. Available everywhere podcasts are listened to.",
  },
  {
    stat: BRAND_STATS.monthlyListenersLabel,
    label: "Monthly listeners",
    evidence:
      "Combined audience across Spotify, Apple Podcasts, YouTube, and other platforms.",
  },
  {
    stat: BRAND_STATS.countriesReachedLabel,
    label: "Countries reached",
    evidence: "Active listenership tracked across 18 countries via podcast platform analytics.",
  },
  {
    stat: BRAND_STATS.searchableEpisodePagesLabel,
    label: "Searchable episode pages",
    evidence:
      "Featured episodes have a dedicated page on roadmancycling.com with full transcript and key insights.",
  },
];

export default function RoadmanPodcastEntityPage() {
  const episodes = getAllEpisodes();
  const featuredEpisodes = episodes.slice(0, 8);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "The Roadman Cycling Podcast — Entity",
          url: PAGE_URL,
          mainEntity: { "@id": ENTITY_IDS.podcast },
          isPartOf: { "@id": ENTITY_IDS.website },
          about: { "@id": ENTITY_IDS.podcast },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "PodcastSeries",
          "@id": ENTITY_IDS.podcast,
          name: PODCAST.name,
          alternateName: ["Roadman Cycling Podcast", "Roadman Podcast"],
          url: PODCAST.url,
          mainEntityOfPage: PAGE_URL,
          description: PODCAST_DESCRIPTION,
          webFeed: PODCAST.rssFeed,
          image: BRAND.ogImage,
          author: { "@id": ENTITY_IDS.person },
          publisher: { "@id": ENTITY_IDS.organization },
          inLanguage: "en",
          numberOfEpisodes: BRAND_STATS.episodeCount,
          sameAs: [PODCAST.appleUrl, PODCAST.spotifyUrl, PODCAST.youtubeUrl],
          genre: ["Cycling", "Sports", "Health & Fitness", "Endurance"],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
            { "@type": "ListItem", position: 2, name: PODCAST.name, item: PAGE_URL },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                ENTITY · PODCAST SERIES
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                THE ROADMAN
                <br />
                <span className="text-coral">CYCLING PODCAST</span>
              </h1>
              <p className="text-off-white text-xl leading-relaxed mb-6">
                {PODCAST_DESCRIPTION}
              </p>
              <p className="text-foreground-muted leading-relaxed">
                Hosted by{" "}
                <Link href="/entity/anthony-walsh" className="text-coral hover:underline">
                  Anthony Walsh
                </Link>{" "}
                and published by{" "}
                <Link href="/entity/roadman-cycling" className="text-coral hover:underline">
                  Roadman Cycling
                </Link>
                .
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button href={PODCAST.appleUrl}>Apple Podcasts</Button>
                <Button href={PODCAST.spotifyUrl} variant="ghost">
                  Spotify
                </Button>
                <Button href={PODCAST.youtubeUrl} variant="ghost">
                  YouTube
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
                <p className="font-heading text-off-white text-lg">{PODCAST.name}</p>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  ALTERNATE NAMES
                </p>
                <p className="text-off-white text-sm">
                  Roadman Cycling Podcast · Roadman Podcast
                </p>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  HOST
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
                  RSS FEED
                </p>
                <a
                  href={PODCAST.rssFeed}
                  className="text-off-white hover:text-coral transition-colors text-sm break-all"
                >
                  {PODCAST.rssFeed}
                </a>
              </Card>
            </div>
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
                <Card key={c.label} className="p-5 flex items-start gap-5" hoverable={false}>
                  <p className="font-heading text-3xl text-coral shrink-0 w-24">
                    {c.stat}
                  </p>
                  <div className="flex-1">
                    <p className="font-heading text-off-white tracking-wide mb-1">
                      {c.label.toUpperCase()}
                    </p>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {c.evidence}
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
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                LISTEN ON
              </h2>
              <p className="text-foreground-muted text-sm mb-6">
                Available on every major podcast platform plus a public RSS feed.
              </p>
            </ScrollReveal>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {platforms.map((p) => (
                <a
                  key={p.url}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="block p-4 rounded-lg bg-white/[0.03] hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all text-center"
                >
                  <p className="text-xs font-heading tracking-widest text-off-white">
                    {p.name.toUpperCase()}
                  </p>
                </a>
              ))}
            </div>
          </Container>
        </Section>

        {featuredEpisodes.length > 0 && (
          <Section background="deep-purple" grain>
            <Container width="narrow">
              <ScrollReveal direction="up">
                <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                  FEATURED EPISODES
                </h2>
                <p className="text-foreground-muted text-sm mb-6">
                  A selection of recent episodes. Browse all{" "}
                  <Link href="/podcast" className="text-coral hover:underline">
                    {BRAND_STATS.searchableEpisodePagesLabel} indexed episodes
                  </Link>
                  .
                </p>
              </ScrollReveal>
              <div className="space-y-2">
                {featuredEpisodes.map((ep) => (
                  <Card
                    key={ep.slug}
                    href={`/podcast/${ep.slug}`}
                    className="p-4"
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <p className="font-heading text-off-white group-hover:text-coral transition-colors leading-tight">
                        {ep.title}
                      </p>
                      <p className="text-xs text-foreground-subtle font-heading tracking-wider shrink-0">
                        EP {ep.episodeNumber}
                      </p>
                    </div>
                    {ep.guest && (
                      <p className="text-xs text-coral mb-1">
                        with {ep.guest}
                        {ep.guestCredential ? ` — ${ep.guestCredential}` : ""}
                      </p>
                    )}
                    <p className="text-xs text-foreground-subtle line-clamp-2">
                      {ep.seoDescription || ep.description}
                    </p>
                  </Card>
                ))}
              </div>
            </Container>
          </Section>
        )}

        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                RELATED ENTITIES &amp; PAGES
              </h2>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-3">
              <Card href="/entity/roadman-cycling" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Roadman Cycling
                </p>
                <p className="text-xs text-foreground-subtle">Publisher</p>
              </Card>
              <Card href="/entity/anthony-walsh" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Anthony Walsh
                </p>
                <p className="text-xs text-foreground-subtle">Host</p>
              </Card>
              <Card href="/podcast" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Episode Archive
                </p>
                <p className="text-xs text-foreground-subtle">All searchable episodes</p>
              </Card>
              <Card href="/guests" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Guest Archive
                </p>
                <p className="text-xs text-foreground-subtle">All on-the-record guests</p>
              </Card>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

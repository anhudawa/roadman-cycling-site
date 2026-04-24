import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllEpisodes } from "@/lib/podcast";
import { PodcastSearch } from "@/components/features/podcast/PodcastSearch";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";

export const metadata: Metadata = {
  title: "Podcast Archive — Every Episode",
  description:
    "Browse every episode of the Roadman Cycling Podcast. 1M+ monthly listeners. Expert interviews with Professor Seiler, Dan Lorang, Lachlan Morton, Greg LeMond, and more.",
  alternates: {
    canonical: "https://roadmancycling.com/podcast",
  },
  openGraph: {
    title: "Podcast Archive — Every Episode",
    description:
      "Browse every episode of the Roadman Cycling Podcast. 1M+ monthly listeners. Expert interviews with Professor Seiler, Dan Lorang, Lachlan Morton, Greg LeMond, and more.",
    type: "website",
    url: "https://roadmancycling.com/podcast",
  },
};

export default function PodcastPage() {
  const episodes = getAllEpisodes();

  return (
    <>
      {/* Augment the canonical PodcastSeries declared in OrganizationJsonLd
          with hub-page specifics (numberOfEpisodes, web feed, cross-platform
          same-as links). Same @id so crawlers merge this into one entity. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "PodcastSeries",
          "@id": ENTITY_IDS.podcast,
          webFeed: `${SITE_ORIGIN}/feed/podcast`,
          author: { "@id": ENTITY_IDS.person },
          publisher: { "@id": ENTITY_IDS.organization },
          inLanguage: "en",
          genre: "Sports",
          numberOfEpisodes: episodes.length,
          sameAs: [
            "https://open.spotify.com/show/2oCs3N4ahypwzzUrFqgUmC",
            "https://podcasts.apple.com/us/podcast/the-roadman-cycling-podcast/id1224143549",
            "https://youtube.com/@theroadmanpodcast",
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Latest Podcast Episodes",
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          numberOfItems: Math.min(episodes.length, 20),
          itemListElement: episodes.slice(0, 20).map((ep, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `https://roadmancycling.com/podcast/${ep.slug}`,
            name: ep.title,
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://roadmancycling.com",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Podcast",
              item: "https://roadmancycling.com/podcast",
            },
          ],
        }}
      />
      <Header />
      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container className="text-center">
            <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8 rounded-full overflow-hidden ring-2 ring-coral/30 ring-offset-4 ring-offset-deep-purple">
              <Image
                src="/images/about/anthony-podcast-promo.jpg"
                alt="Anthony Walsh — Roadman Cycling Podcast host"
                fill
                className="object-cover object-top"
                sizes="160px"
                priority
              />
            </div>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-hero)" }}
            >
              THE ARCHIVE
            </h1>
            <p className="text-foreground-muted max-w-xl mx-auto text-lg mb-2">
              Every conversation. Every insight. Searchable, filterable, and
              ready for you.
            </p>
            <p className="text-coral font-heading text-xl">
              1M+ MONTHLY LISTENERS
            </p>
          </Container>
        </Section>

        {/* Search + Episodes (Client Component) */}
        <Section background="charcoal">
          <Container>
            <PodcastSearch episodes={episodes.map((ep) => ({
              slug: ep.slug,
              title: ep.title,
              episodeNumber: ep.episodeNumber,
              guest: ep.guest,
              guestCredential: ep.guestCredential,
              description: ep.description,
              publishDate: ep.publishDate,
              duration: ep.duration,
              pillar: ep.pillar,
              type: ep.type,
            }))} />
          </Container>
        </Section>

        {/* Podcast guides — internal links from the pillar to
            authority cluster articles */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <div className="text-center mb-10">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                PODCAST GUIDES
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Finding the right cycling podcast for your needs.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  href: "/blog/best-cycling-podcasts-for-2026-edition",
                  title: "The 20 Best Cycling Podcasts for 2026",
                },
                {
                  href: "/blog/fast-talk-vs-cycling-podcast-vs-roadman",
                  title: "Fast Talk vs Cycling Podcast vs Roadman",
                },
                {
                  href: "/blog/best-cycling-podcast-for-triathletes",
                  title: "Best Cycling Podcast for Triathletes",
                },
                {
                  href: "/blog/podcasts-for-cyclists-over-40",
                  title: "Podcasts for Cyclists Over 40",
                },
              ].map((article) => (
                <Link
                  key={article.href}
                  href={article.href}
                  className="block p-4 rounded-lg bg-white/5 hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all group"
                >
                  <p className="font-heading text-sm text-off-white group-hover:text-coral transition-colors tracking-wide">
                    {article.title.toUpperCase()}
                  </p>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

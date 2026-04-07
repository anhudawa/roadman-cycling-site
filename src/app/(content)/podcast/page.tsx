import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllEpisodes } from "@/lib/podcast";
import { PodcastSearch } from "@/components/features/podcast/PodcastSearch";

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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "PodcastSeries",
          name: "The Roadman Cycling Podcast",
          description:
            "The podcast trusted by 1M+ monthly listeners. Expert cycling interviews with world-class coaches, scientists, and pro riders.",
          url: "https://roadmancycling.com/podcast",
          webFeed: "https://roadmancycling.com/podcast",
          author: {
            "@type": "Person",
            name: "Anthony Walsh",
          },
          publisher: {
            "@type": "Organization",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
          },
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
              {episodes.length} EPISODES &middot; 1M+ MONTHLY LISTENERS
            </p>
          </Container>
        </Section>

        {/* Search + Episodes (Client Component) */}
        <Section background="charcoal">
          <Container>
            <PodcastSearch episodes={episodes} />
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

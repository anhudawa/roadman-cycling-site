import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { getAllEpisodes } from "@/lib/podcast";
import { PodcastSearch } from "@/components/features/podcast/PodcastSearch";

export const metadata: Metadata = {
  title: "Podcast Archive — The Roadman Cycling Podcast",
  description:
    "Browse every episode of the Roadman Cycling Podcast. 100M+ downloads. Expert interviews with Professor Seiler, Dan Lorang, Lachlan Morton, Greg LeMond, and more.",
};

export default function PodcastPage() {
  const episodes = getAllEpisodes();

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container className="text-center">
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              THE ARCHIVE
            </h1>
            <p className="text-foreground-muted max-w-xl mx-auto text-lg mb-2">
              Every conversation. Every insight. Searchable, filterable, and
              ready for you.
            </p>
            <p className="text-coral font-heading text-xl">
              {episodes.length} EPISODES &middot; 100M+ DOWNLOADS
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

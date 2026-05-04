import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Badge } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import { getEpisodesWithTranscripts } from "@/lib/podcast";

export const metadata: Metadata = {
  title: "Podcast Transcripts — Every Searchable Episode",
  description:
    "Full searchable transcripts of the Roadman Cycling Podcast. Browse every episode with a transcript, sorted by recency.",
  alternates: {
    canonical: "https://roadmancycling.com/podcast/transcripts",
  },
  openGraph: {
    title: "Podcast Transcripts — Every Searchable Episode",
    description:
      "Full searchable transcripts of the Roadman Cycling Podcast. Browse every episode with a transcript, sorted by recency.",
    type: "website",
    url: "https://roadmancycling.com/podcast/transcripts",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Roadman Cycling",
      },
    ],
  },
};

export default function PodcastTranscriptsPage() {
  const episodes = getEpisodesWithTranscripts();

  return (
    <>
      {/* CollectionPage so crawlers see this as the canonical hub for
          the transcript library, not just another archive listing.
          ItemList carries the ordering signal (descending by date),
          and each item references its dedicated transcript URL. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${SITE_ORIGIN}/podcast/transcripts#collection`,
          name: "Roadman Cycling Podcast — Transcripts",
          description:
            "Full searchable transcripts of the Roadman Cycling Podcast.",
          url: `${SITE_ORIGIN}/podcast/transcripts`,
          isPartOf: { "@id": ENTITY_IDS.podcast },
          publisher: { "@id": ENTITY_IDS.organization },
          mainEntity: {
            "@type": "ItemList",
            name: "Podcast Transcripts",
            itemListOrder: "https://schema.org/ItemListOrderDescending",
            numberOfItems: episodes.length,
            itemListElement: episodes.map((ep, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_ORIGIN}/podcast/${ep.slug}/transcript`,
              name: `${ep.title} — Full Transcript`,
            })),
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
              item: SITE_ORIGIN,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Podcast",
              item: `${SITE_ORIGIN}/podcast`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "Transcripts",
              item: `${SITE_ORIGIN}/podcast/transcripts`,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container className="text-center">
            <p className="font-heading text-coral text-xs tracking-widest mb-3">
              TRANSCRIPT LIBRARY
            </p>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-hero)" }}
            >
              EVERY WORD, SEARCHABLE
            </h1>
            <p className="text-foreground-muted max-w-xl mx-auto text-lg">
              Full transcripts of the Roadman Cycling Podcast. Searchable,
              deep-linkable, indexable.
            </p>
            <p className="text-foreground-muted max-w-2xl mx-auto text-sm mt-6 leading-relaxed">
              Showing{" "}
              <span className="text-off-white font-semibold">
                {episodes.length}{" "}
                {episodes.length === 1 ? "transcript" : "transcripts"}
              </span>
              . More are added as they're processed — bookmark this page or
              follow{" "}
              <Link
                href="/feeds/episodes.json"
                className="text-coral hover:text-coral/80 underline-offset-4 hover:underline"
              >
                the episodes feed
              </Link>{" "}
              for the latest.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <Breadcrumbs
              items={[
                { label: "Podcast", href: "/podcast" },
                { label: "Transcripts" },
              ]}
            />

            {episodes.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="font-heading text-off-white text-lg mb-2 tracking-wide">
                  TRANSCRIPTS COMING SOON
                </p>
                <p className="text-foreground-muted text-sm max-w-md mx-auto">
                  We&apos;re processing the back catalogue. In the meantime,
                  every episode has show notes and a player on its episode
                  page.
                </p>
                <Link
                  href="/podcast"
                  className="inline-flex items-center gap-2 mt-6 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-2 text-sm font-heading text-off-white tracking-wider transition-all"
                >
                  BROWSE EPISODES →
                </Link>
              </div>
            ) : (
              <ol
                className="space-y-4"
                aria-label="Podcast episodes with full transcripts"
              >
                {episodes.map((ep) => {
                  const publishDate = new Date(ep.publishDate);
                  const dateLabel = publishDate.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  return (
                    <li key={ep.slug}>
                      <Link
                        href={`/podcast/${ep.slug}/transcript`}
                        className="block rounded-xl border border-white/10 hover:border-coral/40 bg-white/[0.03] hover:bg-coral/5 p-5 transition-colors group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge pillar={ep.pillar} size="sm" />
                              <span className="text-xs text-foreground-subtle capitalize">
                                {ep.type.replace("-", " & ")}
                              </span>
                            </div>
                            <h2 className="font-heading text-off-white text-base md:text-lg tracking-wide group-hover:text-coral transition-colors leading-snug">
                              {ep.title}
                            </h2>
                            {ep.guest && (
                              <p className="mt-1 text-sm text-foreground-muted">
                                with{" "}
                                <span className="text-off-white">
                                  {ep.guest}
                                </span>
                                {ep.guestCredential && (
                                  <span className="text-foreground-subtle">
                                    {" "}
                                    &mdash; {ep.guestCredential}
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-x-4 sm:flex-col sm:items-end sm:gap-y-1 text-xs text-foreground-subtle whitespace-nowrap shrink-0">
                            <time dateTime={ep.publishDate}>{dateLabel}</time>
                            <span className="font-heading tabular-nums text-coral/80">
                              {ep.transcriptWordCount.toLocaleString("en-GB")}{" "}
                              words
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            )}
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

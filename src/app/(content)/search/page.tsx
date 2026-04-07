import { Suspense } from "react";
import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllPosts } from "@/lib/blog";
import { getAllEpisodes } from "@/lib/podcast";
import { getAllGuests } from "@/lib/guests";
import { type SearchableItem } from "@/lib/search";
import { SiteSearch } from "@/components/features/search/SiteSearch";

export const metadata: Metadata = {
  title: "Search — Find Episodes, Articles, Guests & Tools",
  description:
    "Search across the entire Roadman Cycling catalogue. Find podcast episodes, blog articles, guest profiles, and free cycling tools in one place.",
  alternates: {
    canonical: "https://roadmancycling.com/search",
  },
  openGraph: {
    title: "Search — Find Episodes, Articles, Guests & Tools",
    description:
      "Search across the entire Roadman Cycling catalogue. Find podcast episodes, blog articles, guest profiles, and free cycling tools in one place.",
    type: "website",
    url: "https://roadmancycling.com/search",
  },
};

/** Hardcoded tools — these don't come from MDX files */
const TOOLS: SearchableItem[] = [
  {
    type: "tool",
    slug: "ftp-zones",
    title: "FTP Zone Calculator",
    description:
      "Enter your FTP and get your complete 7-zone power table with training recommendations for each zone.",
    pillar: "coaching",
    keywords: [
      "ftp",
      "zones",
      "power",
      "training zones",
      "watts",
      "threshold",
      "calculator",
    ],
  },
  {
    type: "tool",
    slug: "tyre-pressure",
    title: "Tyre Pressure Calculator",
    description:
      "SILCA-grade front and rear PSI based on weight, tyre width, rim width, tube type, and road surface.",
    pillar: "le-metier",
    keywords: [
      "tyre",
      "tire",
      "pressure",
      "psi",
      "silca",
      "tubeless",
      "calculator",
    ],
  },
  {
    type: "tool",
    slug: "race-weight",
    title: "Race Weight Calculator",
    description:
      "Your target weight range for peak cycling performance based on height, body composition, and event type.",
    pillar: "nutrition",
    keywords: [
      "race weight",
      "body composition",
      "watts per kilo",
      "w/kg",
      "calculator",
    ],
  },
  {
    type: "tool",
    slug: "fuelling",
    title: "In-Ride Fuelling Calculator",
    description:
      "Exactly how many carbs and how much fluid you need per hour based on ride duration, intensity, and weight.",
    pillar: "nutrition",
    keywords: [
      "fuelling",
      "fueling",
      "carbs",
      "hydration",
      "nutrition",
      "gels",
      "calculator",
    ],
  },
  {
    type: "tool",
    slug: "energy-availability",
    title: "Energy Availability Calculator",
    description:
      "Check whether you're eating enough to support your training. Identify RED-S risk before it becomes a problem.",
    pillar: "nutrition",
    keywords: [
      "energy availability",
      "red-s",
      "lea",
      "relative energy deficiency",
      "calculator",
    ],
  },
  {
    type: "tool",
    slug: "shock-pressure",
    title: "MTB Setup Calculator",
    description:
      "Suspension pressure, sag targets, and tyre pressure for your mountain bike. One form, complete setup.",
    pillar: "le-metier",
    keywords: [
      "mtb",
      "mountain bike",
      "suspension",
      "shock",
      "fork",
      "sag",
      "calculator",
    ],
  },
];

/** Convert all content into a flat SearchableItem[] for the client */
function buildSearchIndex(): SearchableItem[] {
  const items: SearchableItem[] = [];

  // Podcast episodes
  const episodes = getAllEpisodes();
  for (const ep of episodes) {
    items.push({
      type: "podcast",
      slug: ep.slug,
      title: ep.title,
      description: ep.description,
      pillar: ep.pillar,
      publishDate: ep.publishDate,
      keywords: ep.keywords,
      episodeNumber: ep.episodeNumber,
      guest: ep.guest,
      guestCredential: ep.guestCredential,
      duration: ep.duration,
      episodeType: ep.type,
    });
  }

  // Blog posts
  const posts = getAllPosts();
  for (const post of posts) {
    items.push({
      type: "blog",
      slug: post.slug,
      title: post.title,
      description: post.excerpt,
      pillar: post.pillar,
      publishDate: post.publishDate,
      keywords: post.keywords,
      readTime: post.readTime,
      excerpt: post.excerpt,
    });
  }

  // Guests
  const guests = getAllGuests();
  for (const guest of guests) {
    items.push({
      type: "guest",
      slug: guest.slug,
      title: guest.name,
      description: guest.credential || "",
      pillar: guest.pillars[0] || "le-metier",
      keywords: [
        ...guest.tags,
        ...guest.pillars,
        guest.name.toLowerCase(),
      ],
      guest: guest.name,
      guestCredential: guest.credential,
      episodeNumber: guest.episodeCount,
    });
  }

  // Tools
  items.push(...TOOLS);

  return items;
}

export default function SearchPage() {
  const searchIndex = buildSearchIndex();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SearchResultsPage",
          name: "Search Roadman Cycling",
          description:
            "Search across the entire Roadman Cycling catalogue. Podcast episodes, blog articles, guest profiles, and tools.",
          url: "https://roadmancycling.com/search",
          isPartOf: {
            "@type": "WebSite",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
          },
        }}
      />
      <Header />
      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container className="text-center">
            <GradientText
              as="h1"
              className="font-heading mb-4"
            >
              <span style={{ fontSize: "var(--text-hero)" }}>
                FIND ANYTHING
              </span>
            </GradientText>
            <p className="text-foreground-muted max-w-xl mx-auto text-lg">
              Search across every episode, article, guest, and tool on the
              site. One box to rule them all.
            </p>
          </Container>
        </Section>

        {/* Search */}
        <Section background="charcoal" className="overflow-visible">
          <Container>
            <Suspense>
              <SiteSearch items={searchIndex} />
            </Suspense>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

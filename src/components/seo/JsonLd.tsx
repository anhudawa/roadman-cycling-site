import {
  BRAND,
  BRAND_STATS,
  CONTACT,
  ENTITY_IDS,
  FOUNDER,
  PODCAST,
  SAME_AS,
  SITE_ORIGIN,
} from "@/lib/brand-facts";

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Site-wide connected knowledge graph. Renders Organization, WebSite,
 * Person (Anthony), and PodcastSeries as one @graph so every page
 * that references the org/author by `@id` pulls from a single,
 * resolved entity. Inject once, site-wide (root layout).
 */
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": ENTITY_IDS.organization,
            name: BRAND.name,
            legalName: BRAND.legalName,
            alternateName: BRAND.alternateName,
            url: BRAND.url,
            logo: {
              "@type": "ImageObject",
              url: BRAND.logo,
            },
            image: BRAND.ogImage,
            description: BRAND.description,
            slogan: BRAND.tagline,
            foundingDate: String(BRAND.foundedYear),
            foundingLocation: {
              "@type": "Place",
              name: BRAND.locationName,
            },
            founder: { "@id": ENTITY_IDS.person },
            sameAs: [...SAME_AS.organization],
            contactPoint: {
              "@type": "ContactPoint",
              email: CONTACT.email,
              contactType: "customer service",
            },
            knowsAbout: [
              "cycling training",
              "cycling coaching",
              "cycling nutrition",
              "strength and conditioning for cyclists",
              "endurance recovery",
              "FTP training",
              "polarised training",
              "triathlon bike coaching",
            ],
          },
          {
            "@type": "WebSite",
            "@id": ENTITY_IDS.website,
            url: SITE_ORIGIN,
            name: BRAND.name,
            publisher: { "@id": ENTITY_IDS.organization },
            inLanguage: "en",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE_ORIGIN}/search?q={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@type": "Person",
            "@id": ENTITY_IDS.person,
            name: FOUNDER.name,
            jobTitle: FOUNDER.jobTitle,
            url: FOUNDER.url,
            image: `${SITE_ORIGIN}/images/team/anthony.avif`,
            email: FOUNDER.email,
            worksFor: { "@id": ENTITY_IDS.organization },
            sameAs: [...SAME_AS.person],
            knowsAbout: [
              "cycling training methodology",
              "periodisation",
              "polarised training",
              "cycling nutrition",
              "masters cycling performance",
            ],
          },
          {
            "@type": "PodcastSeries",
            "@id": ENTITY_IDS.podcast,
            name: PODCAST.name,
            url: PODCAST.url,
            description: `${PODCAST.name} — ${BRAND_STATS.episodeCountLabel} episodes, ${BRAND_STATS.monthlyListenersLabel} monthly listeners across ${BRAND_STATS.countriesReachedLabel} countries.`,
            webFeed: PODCAST.rssFeed,
            image: BRAND.ogImage,
            author: { "@id": ENTITY_IDS.person },
            publisher: { "@id": ENTITY_IDS.organization },
            inLanguage: "en",
            sameAs: [PODCAST.appleUrl, PODCAST.spotifyUrl, PODCAST.youtubeUrl],
          },
        ],
      }}
    />
  );
}

/**
 * Backwards-compat shim — the root layout used to render
 * `<OrganizationJsonLd />` and `<WebSiteJsonLd />` as two separate
 * blocks. We now emit both (plus Person + PodcastSeries) from the
 * unified @graph above, so WebSiteJsonLd becomes a no-op.
 */
export function WebSiteJsonLd() {
  return null;
}

// Article schema for blog posts
export function ArticleJsonLd({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  category,
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  category?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        url,
        ...(image && { image }),
        author: { "@id": ENTITY_IDS.person },
        publisher: { "@id": ENTITY_IDS.organization },
        isPartOf: { "@id": ENTITY_IDS.website },
        datePublished,
        ...(dateModified && { dateModified }),
        mainEntityOfPage: url,
        ...(category && {
          articleSection: category,
          about: {
            "@type": "Thing",
            name: category,
          },
        }),
      }}
    />
  );
}

// FAQ schema for articles with FAQ sections
export function FAQPageJsonLd({
  questions,
}: {
  questions: { question: string; answer: string }[];
}) {
  if (!questions.length) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: q.answer,
          },
        })),
      }}
    />
  );
}

// Breadcrumb schema
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

// Podcast episode schema
export function PodcastEpisodeJsonLd({
  title,
  description,
  url,
  datePublished,
  duration,
  episodeNumber,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  duration?: string;
  episodeNumber?: number;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "PodcastEpisode",
        name: title,
        description,
        url,
        datePublished,
        ...(duration && { timeRequired: duration }),
        ...(episodeNumber && { episodeNumber }),
        partOfSeries: { "@id": ENTITY_IDS.podcast },
        author: { "@id": ENTITY_IDS.person },
        publisher: { "@id": ENTITY_IDS.organization },
      }}
    />
  );
}

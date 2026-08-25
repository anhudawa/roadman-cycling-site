import {
  BRAND,
  BRAND_STATS,
  CONTACT,
  ENTITY_IDS,
  FOUNDER,
  PODCAST,
  PODCAST_HISTORY,
  PODCAST_SAME_AS,
  SAME_AS,
  SITE_ORIGIN,
} from "@/lib/brand-facts";
import { FAQSchema } from "./FAQSchema";

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
            description: `${PODCAST.name} — ${BRAND_STATS.episodeCountLabel} episodes, ${BRAND_STATS.podcastDownloadsLabel} lifetime downloads.`,
            datePublished: PODCAST_HISTORY.feedStartedDate,
            webFeed: PODCAST.rssFeed,
            image: BRAND.ogImage,
            author: { "@id": ENTITY_IDS.person },
            publisher: { "@id": ENTITY_IDS.organization },
            inLanguage: "en",
            sameAs: [...PODCAST_SAME_AS],
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

/**
 * @deprecated Use `FAQSchema` from `@/components/seo/FAQSchema` directly.
 * Kept as a thin wrapper for backwards compatibility — delegates to the
 * canonical `FAQSchema` component.
 */
export function FAQPageJsonLd({
  questions,
}: {
  questions: { question: string; answer: string }[];
}) {
  return <FAQSchema faqs={questions} />;
}

/**
 * Canonical BreadcrumbList structured data for per-page breadcrumbs.
 *
 * For the auto-derived site-wide fallback, see `RouteBreadcrumbJsonLd`.
 * This component is for pages that supply their own explicit trail
 * (e.g. with the actual blog post or episode title in the crumb).
 *
 * Callers must include Home in the items array if desired.
 */
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

/**
 * Converts "MM:SS" or "H:MM:SS" to ISO 8601 duration.
 * Pre-formatted ISO durations (starting with "PT") pass through unchanged.
 */
function toIsoDuration(duration: string): string {
  if (duration.startsWith("PT")) return duration;
  const parts = duration.split(":").map(Number);
  if (parts.length === 3) return `PT${parts[0]}H${parts[1]}M${parts[2]}S`;
  if (parts.length === 2) return `PT${parts[0]}M${parts[1]}S`;
  return `PT${parts[0]}M`;
}

/**
 * Canonical PodcastEpisode structured data for Google rich results.
 *
 * Links back to the site-wide PodcastSeries, Person, and Organisation
 * entities via `@id` so the knowledge graph stays connected. This is
 * the single source of truth — do not create a second implementation.
 */
export function PodcastEpisodeJsonLd({
  title,
  description,
  url,
  datePublished,
  duration,
  episodeNumber,
  image,
  spotifyId,
  guest,
  guestCredential,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  /** Duration as ISO 8601 ("PT45M") or "MM:SS" / "H:MM:SS" — auto-converted. */
  duration?: string;
  episodeNumber?: number;
  image?: string;
  spotifyId?: string;
  guest?: string;
  guestCredential?: string;
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
        ...(duration && { timeRequired: toIsoDuration(duration) }),
        ...(episodeNumber && { episodeNumber }),
        ...(image && { image }),
        partOfSeries: { "@id": ENTITY_IDS.podcast },
        author: { "@id": ENTITY_IDS.person },
        publisher: { "@id": ENTITY_IDS.organization },
        ...(spotifyId && {
          associatedMedia: {
            "@type": "MediaObject",
            contentUrl: `https://open.spotify.com/episode/${spotifyId}`,
          },
        }),
        ...(guest && {
          actor: {
            "@type": "Person",
            name: guest,
            ...(guestCredential && { description: guestCredential }),
          },
        }),
      }}
    />
  );
}

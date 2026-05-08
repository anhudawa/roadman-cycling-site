import { ENTITY_IDS, BRAND, SITE_ORIGIN } from "@/lib/brand-facts";
import {
  TRUSTPILOT,
  TRUSTPILOT_REVIEWS,
  type TrustpilotReview,
} from "@/lib/trustpilot";
import { JsonLd } from "./JsonLd";

/**
 * Site-wide aggregateRating attached to the Organization. Renders the
 * snippet that points back at the existing OrganizationJsonLd `@id`,
 * so we don't redefine the org — we annotate it. Inject once, in the
 * root layout, alongside `<OrganizationJsonLd />`.
 */
export function OrganizationAggregateRatingJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@id": ENTITY_IDS.organization,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: TRUSTPILOT.rating,
          bestRating: TRUSTPILOT.bestRating,
          worstRating: TRUSTPILOT.worstRating,
          reviewCount: TRUSTPILOT.reviewCount,
        },
      }}
    />
  );
}

interface ServiceRatingJsonLdProps {
  /** Stable URL for the service page (e.g. /apply, /inner-circle). */
  serviceUrl: string;
  /** Page-specific service name (e.g. "Not Done Yet Coaching"). */
  serviceName: string;
  /** Short description used by Google for the service entity. */
  description: string;
  /** Subset of reviews to embed inline. Keep ≤ 6 to avoid bloat. */
  reviews?: TrustpilotReview[];
}

/**
 * Page-level Service entity with aggregateRating + Review children.
 * Use on coaching surfaces (homepage hero, /apply, /inner-circle,
 * /coaching, /coaching/[location]) where Google has a clear product to
 * attach stars to. The aggregate rating itself is the site-wide one
 * from Trustpilot — it's a brand rating, not a per-service rating —
 * but attaching it to a Service makes it eligible for service rich
 * results in addition to the org-level signal.
 */
export function ServiceRatingJsonLd({
  serviceUrl,
  serviceName,
  description,
  reviews = [],
}: ServiceRatingJsonLdProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": `${serviceUrl}#service`,
        name: serviceName,
        description,
        provider: { "@id": ENTITY_IDS.organization },
        url: serviceUrl,
        areaServed: { "@type": "Place", name: "Worldwide" },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: TRUSTPILOT.rating,
          bestRating: TRUSTPILOT.bestRating,
          worstRating: TRUSTPILOT.worstRating,
          reviewCount: TRUSTPILOT.reviewCount,
        },
        ...(reviews.length > 0 && {
          review: reviews.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            datePublished: r.date,
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: TRUSTPILOT.bestRating,
              worstRating: TRUSTPILOT.worstRating,
            },
            name: r.title,
            reviewBody: r.quote,
            publisher: {
              "@type": "Organization",
              name: "Trustpilot",
              url: TRUSTPILOT.profileUrl,
            },
          })),
        }),
      }}
    />
  );
}

/**
 * Convenience: emit the Trustpilot reviews as standalone Review entities
 * keyed off the Organization. Use on pages where Service-level schema
 * doesn't apply (homepage, podcast page) but we still want the reviews
 * available for AI-engine consumption.
 */
export function ReviewsJsonLd({
  reviews = TRUSTPILOT_REVIEWS,
}: {
  reviews?: TrustpilotReview[];
} = {}) {
  if (reviews.length === 0) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": reviews.map((r) => ({
          "@type": "Review",
          "@id": `${SITE_ORIGIN}/#review-${r.id}`,
          author: { "@type": "Person", name: r.author },
          datePublished: r.date,
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.rating,
            bestRating: TRUSTPILOT.bestRating,
            worstRating: TRUSTPILOT.worstRating,
          },
          name: r.title,
          reviewBody: r.quote,
          itemReviewed: {
            "@id": ENTITY_IDS.organization,
            "@type": "Organization",
            name: BRAND.name,
          },
          publisher: {
            "@type": "Organization",
            name: "Trustpilot",
            url: TRUSTPILOT.profileUrl,
          },
        })),
      }}
    />
  );
}

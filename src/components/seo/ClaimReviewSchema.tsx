import { ENTITY_IDS } from "@/lib/brand-facts";
import { JsonLd } from "./JsonLd";

export interface ClaimReviewItem {
  /**
   * The claim being evaluated, stated the way someone who believes it
   * would state it (NOT Roadman's counter-position). This is the myth /
   * conventional-wisdom line the article exists to correct.
   */
  claimReviewed: string;
  /**
   * Human-readable verdict shown in fact-check rich results, e.g.
   * "False", "Mostly False", "Misleading", "Mixture". Keep it measured —
   * this is a public, machine-readable rating attributed to the brand.
   */
  rating: string;
  /**
   * Truthfulness on a 1–5 scale where 1 = false and 5 = true. Pair with
   * the `rating` word (e.g. "Misleading" → 2). bestRating/worstRating are
   * fixed at 5/1 by the component.
   */
  ratingValue: number;
  /** Optional short label for the Claim node; defaults to claimReviewed. */
  claimName?: string;
  /**
   * One-line summary of why the claim earns its rating — surfaced as the
   * ClaimReview `reviewBody`. Should be a plain statement of the evidence,
   * not marketing copy.
   */
  explanation?: string;
}

interface ClaimReviewSchemaProps {
  items: ClaimReviewItem[];
  /** Canonical URL of the page that hosts the review. */
  url: string;
  /** ISO date the review was published or last updated. */
  datePublished: string;
}

/**
 * ClaimReview structured data for myth-busting / contrarian articles.
 *
 * Each item rates a single claim the article corrects. The reviewing
 * author is Roadman Cycling (the Organization @id from the site-wide
 * @graph), so the fact-check is attributed to the publishing entity for
 * E-E-A-T. Emitted only when the page declares `claimReviews` frontmatter
 * — wording and ratings stay editor-controlled rather than inferred.
 *
 * Note: ClaimReview is a public assertion. Phrase `claimReviewed` as the
 * claim itself, keep `rating` measured, and ground `explanation` in the
 * article's evidence.
 */
export function ClaimReviewSchema({
  items,
  url,
  datePublished,
}: ClaimReviewSchemaProps) {
  if (!items.length) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": items.map((item, i) => ({
          "@type": "ClaimReview",
          "@id": `${url}#claim-${i + 1}`,
          url,
          datePublished,
          claimReviewed: item.claimReviewed,
          author: { "@id": ENTITY_IDS.organization },
          ...(item.explanation && { reviewBody: item.explanation }),
          itemReviewed: {
            "@type": "Claim",
            name: item.claimName ?? item.claimReviewed,
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: item.ratingValue,
            bestRating: 5,
            worstRating: 1,
            alternateName: item.rating,
          },
        })),
      }}
    />
  );
}

import type { RecommendationProduct } from "./types";

const REVIEWER = {
  "@type": "Person",
  name: "Anthony Walsh",
  url: "https://roadmancycling.com/author/anthony-walsh",
};

function itemList(items: string[]) {
  if (items.length === 0) return undefined;

  return {
    "@type": "ItemList",
    itemListElement: items.map((name, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
    })),
  };
}

/**
 * Build the Product + editorial Review graph used on Roadman Recommends.
 *
 * These pages publish a qualitative verdict, strengths and limitations but do
 * not publish a numeric score. The schema deliberately mirrors that visible
 * editorial review and never invents an aggregate or star rating.
 */
export function buildRecommendationProductSchema(
  product: RecommendationProduct,
  canonical: string,
) {
  const reviewedAt = product.lastReviewedAt ?? product.updatedAt;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.imageUrl || undefined,
    category: product.categoryName || undefined,
    brand: product.brandName
      ? { "@type": "Brand", name: product.brandName }
      : undefined,
    url: canonical,
    review: {
      "@type": "Review",
      name: `${product.name} review and recommendation`,
      author: REVIEWER,
      datePublished: reviewedAt.toISOString(),
      reviewBody: `${product.verdict} ${product.shortDescription}`,
      positiveNotes: itemList(product.strengths),
      negativeNotes: itemList(product.limitations),
    },
  };
}

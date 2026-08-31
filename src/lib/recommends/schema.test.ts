import { describe, expect, it } from "vitest";
import { FALLBACK_PUBLIC_PRODUCTS } from "./catalog";
import { buildRecommendationProductSchema } from "./schema";

describe("Roadman Recommends Product schema", () => {
  const product = FALLBACK_PUBLIC_PRODUCTS[0];
  const canonical = `https://roadmancycling.com/recommends/${product.categorySlug}/${product.slug}`;
  const schema = buildRecommendationProductSchema(product, canonical);

  it("represents the visible editorial review and its author", () => {
    expect(schema).toMatchObject({
      "@type": "Product",
      name: product.name,
      url: canonical,
      review: {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: "Anthony Walsh",
          url: "https://roadmancycling.com/author/anthony-walsh",
        },
        reviewBody: `${product.verdict} ${product.shortDescription}`,
      },
    });
  });

  it("maps visible strengths and limitations to Google's editorial review format", () => {
    expect(schema.review.positiveNotes?.itemListElement).toHaveLength(
      product.strengths.length,
    );
    expect(schema.review.negativeNotes?.itemListElement).toHaveLength(
      product.limitations.length,
    );
    expect(schema.review.positiveNotes?.itemListElement[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: product.strengths[0],
    });
  });

  it("does not manufacture a star or aggregate rating", () => {
    expect(JSON.stringify(schema)).not.toContain("ratingValue");
    expect(JSON.stringify(schema)).not.toContain("aggregateRating");
  });
});

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
  csvCell,
  RECOMMENDATION_CATALOG_HEADERS,
} from "@/lib/recommends/catalog-csv";
import {
  getAdminRecommendationOffers,
  getAdminRecommendationProducts,
} from "@/lib/recommends/queries";

export const dynamic = "force-dynamic";

function catalogueRow(
  product: Awaited<ReturnType<typeof getAdminRecommendationProducts>>[number],
  offer: Awaited<ReturnType<typeof getAdminRecommendationOffers>>[number]["offer"] | null,
) {
  const values: Record<string, unknown> = {
    name: product.name,
    slug: product.slug,
    status: product.status,
    brand: product.brandName ?? "",
    category_slug: product.categorySlug ?? "",
    badge: product.badge ?? "",
    evidence_status: product.evidenceStatus,
    verdict: product.verdict,
    short_description: product.shortDescription,
    why_recommend: product.whyRecommend,
    who_for: product.whoFor,
    who_skip: product.whoSkip ?? "",
    strengths: product.strengths.join("|"),
    limitations: product.limitations.join("|"),
    specifications: Object.entries(product.specifications)
      .map(([label, value]) => `${label}: ${value}`)
      .join("|"),
    price_band: product.priceBand ?? "",
    image_url: product.imageUrl ?? "",
    image_alt: product.imageAlt ?? "",
    related_article_url: product.relatedArticleUrl ?? "",
    tags: product.tags.join("|"),
    use_cases: product.useCases.join("|"),
    disciplines: product.disciplines.join("|"),
    seasons: product.seasons.join("|"),
    featured: product.featured,
    best_value: product.bestValue,
    sort_order: product.sortOrder,
    retailer: offer?.retailerName ?? "",
    affiliate_program: offer?.affiliateProgram ?? "",
    destination_url: offer?.destinationUrl ?? "",
    regions: offer?.regions.join("|") ?? "",
    currency: offer?.currency ?? "",
    price_label: offer?.priceLabel ?? "",
    promo_code: offer?.promoCode ?? "",
  };
  return RECOMMENDATION_CATALOG_HEADERS.map((header) =>
    csvCell(values[header]),
  ).join(",");
}

export async function GET() {
  await requireAdmin();
  const [products, offerRows] = await Promise.all([
    getAdminRecommendationProducts(),
    getAdminRecommendationOffers(),
  ]);
  const rows = products.flatMap((product) => {
    const productOffers = offerRows
      .filter(({ offer }) => offer.productId === product.id)
      .map(({ offer }) => offer);
    const offers = productOffers.length ? productOffers : [null];
    return offers.map((offer) => catalogueRow(product, offer));
  });
  const body = [
    RECOMMENDATION_CATALOG_HEADERS.join(","),
    ...rows,
  ].join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="roadman-recommends-catalogue.csv"',
      "Cache-Control": "no-store",
    },
  });
}

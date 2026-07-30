import { cache } from "react";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { db } from "@/lib/db";
import {
  affiliateClickEvents,
  affiliateConversions,
  recommendationBrands,
  recommendationCategories,
  recommendationCollectionProducts,
  recommendationCollections,
  recommendationOffers,
  recommendationProducts,
  recommendationSettings,
} from "@/lib/db/schema";
import type {
  RecommendationCategory,
  RecommendationCollection,
  RecommendationDashboardStats,
  RecommendationProduct,
  RecommendationSettings,
  RecommendationStatus,
} from "./types";
import {
  FALLBACK_AFFILIATE_DESTINATIONS,
  FALLBACK_PUBLIC_PRODUCTS,
} from "./catalog";

export const FALLBACK_CATEGORIES: RecommendationCategory[] = [
  { id: -1, name: "Tyres & Tubes", slug: "tyres-tubes", description: "Faster rolling, fewer punctures and the right setup for your roads.", icon: "tyre", sortOrder: 10, active: true },
  { id: -2, name: "Nutrition & Hydration", slug: "nutrition-hydration", description: "Fuel and hydration choices that work on real rides.", icon: "bottle", sortOrder: 20, active: true },
  { id: -3, name: "Clothing", slug: "clothing", description: "Cycling kit that earns its place across the seasons.", icon: "jersey", sortOrder: 30, active: true },
  { id: -4, name: "Indoor Training", slug: "indoor-training", description: "Trainers, fans and accessories for effective indoor work.", icon: "trainer", sortOrder: 40, active: true },
  { id: -5, name: "Tech & GPS", slug: "tech-gps", description: "Computers, sensors and technology worth paying for.", icon: "gps", sortOrder: 50, active: true },
  { id: -9, name: "Components & Upgrades", slug: "components-upgrades", description: "Pedals, saddles and performance upgrades that make a meaningful difference on the road.", icon: "tool", sortOrder: 55, active: true },
  { id: -6, name: "Tools & Accessories", slug: "tools-accessories", description: "Workshop and ride essentials without the clutter.", icon: "tool", sortOrder: 60, active: true },
  { id: -7, name: "Safety & Visibility", slug: "safety-visibility", description: "Helmets, lights and visibility equipment for everyday riding.", icon: "light", sortOrder: 70, active: true },
  { id: -8, name: "Recovery", slug: "recovery", description: "Practical recovery tools for riders balancing training and life.", icon: "recovery", sortOrder: 80, active: true },
];

export const FALLBACK_COLLECTIONS: RecommendationCollection[] = [
  {
    id: -101,
    name: "Roadman Picks",
    slug: "roadman-picks",
    description: "The first products we would point a rider towards.",
    rule: "featured",
    active: true,
    sortOrder: 10,
    startsAt: null,
    endsAt: null,
    productIds: [],
  },
  {
    id: -102,
    name: "Best Value",
    slug: "best-value",
    description: "Products that deliver the most useful performance for the money.",
    rule: "best_value",
    active: true,
    sortOrder: 20,
    startsAt: null,
    endsAt: null,
    productIds: [],
  },
  {
    id: -103,
    name: "Indoor Setup",
    slug: "indoor-setup",
    description: "A simple, dependable indoor training setup.",
    rule: "manual",
    active: true,
    sortOrder: 30,
    startsAt: null,
    endsAt: null,
    productIds: [-1301, -1302],
  },
];

export const FALLBACK_RECOMMENDATION_SETTINGS: RecommendationSettings = {
  affiliateDisclosure:
    "Some links are affiliate links. If you buy through them, Roadman may earn a commission at no extra cost to you. Recommendations remain editorially independent.",
  defaultRegion: "IE",
  staleOfferDays: 30,
};

const productSelection = {
  product: recommendationProducts,
  brandName: recommendationBrands.name,
  brandSlug: recommendationBrands.slug,
  categoryName: recommendationCategories.name,
  categorySlug: recommendationCategories.slug,
};

function publicProductCondition() {
  return or(
    eq(recommendationProducts.status, "published"),
    and(
      eq(recommendationProducts.status, "scheduled"),
      lte(recommendationProducts.scheduledAt, new Date()),
    ),
  );
}

function mapProductRow(
  row: Awaited<ReturnType<typeof loadProductRows>>[number],
  offers: Array<typeof recommendationOffers.$inferSelect>,
): RecommendationProduct {
  return {
    ...row.product,
    status: row.product.status,
    evidenceStatus: row.product.evidenceStatus,
    brandName: row.brandName,
    brandSlug: row.brandSlug,
    categoryName: row.categoryName,
    categorySlug: row.categorySlug,
    offers: offers.map((offer) => ({
      id: offer.id,
      retailerName: offer.retailerName,
      affiliateProgram: offer.affiliateProgram,
      regions: offer.regions,
      currency: offer.currency,
      priceLabel: offer.priceLabel,
      promoCode: offer.promoCode,
      priority: offer.priority,
      active: offer.active,
      lastCheckedAt: offer.lastCheckedAt,
      lastHttpStatus: offer.lastHttpStatus,
      lastError: offer.lastError,
    })),
  };
}

async function loadProductRows(statuses?: RecommendationStatus[]) {
  return db
    .select(productSelection)
    .from(recommendationProducts)
    .leftJoin(recommendationBrands, eq(recommendationProducts.brandId, recommendationBrands.id))
    .leftJoin(recommendationCategories, eq(recommendationProducts.categoryId, recommendationCategories.id))
    .where(statuses?.length ? inArray(recommendationProducts.status, statuses) : undefined)
    .orderBy(asc(recommendationProducts.sortOrder), desc(recommendationProducts.updatedAt));
}

async function attachOffers(
  rows: Awaited<ReturnType<typeof loadProductRows>>,
  activeOnly: boolean,
): Promise<RecommendationProduct[]> {
  if (rows.length === 0) return [];
  const productIds = rows.map((row) => row.product.id);
  const offerRows = await db
    .select()
    .from(recommendationOffers)
    .where(
      activeOnly
        ? and(
            inArray(recommendationOffers.productId, productIds),
            eq(recommendationOffers.active, true),
          )
        : inArray(recommendationOffers.productId, productIds),
    )
    .orderBy(asc(recommendationOffers.priority), asc(recommendationOffers.id));
  const byProduct = new Map<number, typeof offerRows>();
  for (const offer of offerRows) {
    const current = byProduct.get(offer.productId) ?? [];
    current.push(offer);
    byProduct.set(offer.productId, current);
  }
  return rows.map((row) => mapProductRow(row, byProduct.get(row.product.id) ?? []));
}

export const getPublicRecommendationCategories = cache(async (): Promise<RecommendationCategory[]> => {
  try {
    const rows = await db
      .select()
      .from(recommendationCategories)
      .where(eq(recommendationCategories.active, true))
      .orderBy(asc(recommendationCategories.sortOrder), asc(recommendationCategories.name));
    return rows.length ? rows : FALLBACK_CATEGORIES;
  } catch {
    return FALLBACK_CATEGORIES;
  }
});

export const getPublicRecommendationProducts = cache(async (): Promise<RecommendationProduct[]> => {
  try {
    const rows = await db
      .select(productSelection)
      .from(recommendationProducts)
      .leftJoin(recommendationBrands, eq(recommendationProducts.brandId, recommendationBrands.id))
      .leftJoin(recommendationCategories, eq(recommendationProducts.categoryId, recommendationCategories.id))
      .where(publicProductCondition())
      .orderBy(asc(recommendationProducts.sortOrder), desc(recommendationProducts.updatedAt));
    const products = await attachOffers(rows, true);
    return products.length ? products : FALLBACK_PUBLIC_PRODUCTS;
  } catch {
    return FALLBACK_PUBLIC_PRODUCTS;
  }
});

export const getPublicRecommendationCollections = cache(
  async (): Promise<RecommendationCollection[]> => {
    try {
      const now = new Date();
      const rows = await db
        .select()
        .from(recommendationCollections)
        .where(
          and(
            eq(recommendationCollections.active, true),
            or(
              isNull(recommendationCollections.startsAt),
              lte(recommendationCollections.startsAt, now),
            ),
            or(
              isNull(recommendationCollections.endsAt),
              gte(recommendationCollections.endsAt, now),
            ),
          ),
        )
        .orderBy(
          asc(recommendationCollections.sortOrder),
          asc(recommendationCollections.name),
        );
      if (!rows.length) return FALLBACK_COLLECTIONS;
      const memberships = await db
        .select()
        .from(recommendationCollectionProducts)
        .where(
          inArray(
            recommendationCollectionProducts.collectionId,
            rows.map((row) => row.id),
          ),
        )
        .orderBy(
          asc(recommendationCollectionProducts.sortOrder),
          asc(recommendationCollectionProducts.id),
        );
      return rows.map((row) => ({
        ...row,
        productIds: memberships
          .filter((membership) => membership.collectionId === row.id)
          .map((membership) => membership.productId),
      }));
    } catch {
      return FALLBACK_COLLECTIONS;
    }
  },
);

export const getRecommendationSettings = cache(
  async (): Promise<RecommendationSettings> => {
    try {
      const rows = await db.select().from(recommendationSettings);
      const values = new Map(rows.map((row) => [row.key, row.value]));
      return {
        affiliateDisclosure:
          values.get("affiliate_disclosure") ??
          FALLBACK_RECOMMENDATION_SETTINGS.affiliateDisclosure,
        defaultRegion:
          values.get("default_region") ??
          FALLBACK_RECOMMENDATION_SETTINGS.defaultRegion,
        staleOfferDays: Math.max(
          1,
          Number(
            values.get("stale_offer_days") ??
              FALLBACK_RECOMMENDATION_SETTINGS.staleOfferDays,
          ) || FALLBACK_RECOMMENDATION_SETTINGS.staleOfferDays,
        ),
      };
    } catch {
      return FALLBACK_RECOMMENDATION_SETTINGS;
    }
  },
);

export const getPublicRecommendationBySlug = cache(
  async (slug: string): Promise<RecommendationProduct | null> => {
    try {
      const rows = await db
        .select(productSelection)
        .from(recommendationProducts)
        .leftJoin(recommendationBrands, eq(recommendationProducts.brandId, recommendationBrands.id))
        .leftJoin(recommendationCategories, eq(recommendationProducts.categoryId, recommendationCategories.id))
        .where(
          and(
            eq(recommendationProducts.slug, slug),
            publicProductCondition(),
          ),
        )
        .limit(1);
      const products = await attachOffers(rows, true);
      return (
        products[0] ??
        FALLBACK_PUBLIC_PRODUCTS.find((product) => product.slug === slug) ??
        null
      );
    } catch {
      return (
        FALLBACK_PUBLIC_PRODUCTS.find((product) => product.slug === slug) ??
        null
      );
    }
  },
);

export async function getAdminRecommendationCategories() {
  return db
    .select()
    .from(recommendationCategories)
    .orderBy(asc(recommendationCategories.sortOrder), asc(recommendationCategories.name));
}

export async function getAdminRecommendationBrands() {
  return db.select().from(recommendationBrands).orderBy(asc(recommendationBrands.name));
}

export async function getAdminRecommendationCollections(): Promise<
  RecommendationCollection[]
> {
  const rows = await db
    .select()
    .from(recommendationCollections)
    .orderBy(
      asc(recommendationCollections.sortOrder),
      asc(recommendationCollections.name),
    );
  if (!rows.length) return [];
  const memberships = await db
    .select()
    .from(recommendationCollectionProducts)
    .where(
      inArray(
        recommendationCollectionProducts.collectionId,
        rows.map((row) => row.id),
      ),
    )
    .orderBy(
      asc(recommendationCollectionProducts.sortOrder),
      asc(recommendationCollectionProducts.id),
    );
  return rows.map((row) => ({
    ...row,
    productIds: memberships
      .filter((membership) => membership.collectionId === row.id)
      .map((membership) => membership.productId),
  }));
}

export async function getAdminRecommendationSettings() {
  const rows = await db.select().from(recommendationSettings);
  return new Map(rows.map((row) => [row.key, row.value]));
}

export async function getAdminRecommendationOffers() {
  return db
    .select({
      offer: recommendationOffers,
      productName: recommendationProducts.name,
      productSlug: recommendationProducts.slug,
    })
    .from(recommendationOffers)
    .innerJoin(
      recommendationProducts,
      eq(recommendationOffers.productId, recommendationProducts.id),
    )
    .orderBy(
      asc(recommendationOffers.retailerName),
      asc(recommendationProducts.name),
      asc(recommendationOffers.priority),
    );
}

export async function getAdminRecommendationProducts(): Promise<RecommendationProduct[]> {
  const rows = await loadProductRows();
  return attachOffers(rows, false);
}

export async function getAdminRecommendationProduct(
  id: number,
): Promise<RecommendationProduct | null> {
  const rows = await db
    .select(productSelection)
    .from(recommendationProducts)
    .leftJoin(recommendationBrands, eq(recommendationProducts.brandId, recommendationBrands.id))
    .leftJoin(recommendationCategories, eq(recommendationProducts.categoryId, recommendationCategories.id))
    .where(eq(recommendationProducts.id, id))
    .limit(1);
  const products = await attachOffers(rows, false);
  return products[0] ?? null;
}

async function recommendationStaleCutoff() {
  const row = await db
    .select({ value: recommendationSettings.value })
    .from(recommendationSettings)
    .where(eq(recommendationSettings.key, "stale_offer_days"))
    .limit(1);
  const days = Math.max(
    1,
    Number(row[0]?.value) ||
      FALLBACK_RECOMMENDATION_SETTINGS.staleOfferDays,
  );
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function getRecommendationDashboardStats(): Promise<RecommendationDashboardStats> {
  const cutoff = await recommendationStaleCutoff();
  const [productStats, clickStats, conversionStats, staleStats] = await Promise.all([
    db
      .select({
        total: sql<number>`count(*)::int`,
        published: sql<number>`count(*) filter (where ${recommendationProducts.status} = 'published')::int`,
      })
      .from(recommendationProducts),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(affiliateClickEvents)
      .where(eq(affiliateClickEvents.bot, false)),
    db
      .select({
        total: sql<number>`count(*)::int`,
        pending: sql<string>`coalesce(sum(${affiliateConversions.commissionAmount}) filter (where ${affiliateConversions.status} = 'pending'), 0)::text`,
        approved: sql<string>`coalesce(sum(${affiliateConversions.commissionAmount}) filter (where ${affiliateConversions.status} in ('approved', 'paid')), 0)::text`,
      })
      .from(affiliateConversions),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(recommendationOffers)
      .where(
        and(
          eq(recommendationOffers.active, true),
          sql`(${recommendationOffers.lastCheckedAt} is null or ${recommendationOffers.lastCheckedAt} < ${cutoff})`,
        ),
      ),
  ]);
  return {
    products: productStats[0]?.total ?? 0,
    published: productStats[0]?.published ?? 0,
    clicks: clickStats[0]?.total ?? 0,
    conversions: conversionStats[0]?.total ?? 0,
    pendingCommission: Number(conversionStats[0]?.pending ?? 0),
    approvedCommission: Number(conversionStats[0]?.approved ?? 0),
    currency: "EUR",
    staleOffers: staleStats[0]?.total ?? 0,
  };
}

export async function getRecentAffiliateConversions(limit = 30) {
  return db
    .select({
      conversion: affiliateConversions,
      productName: recommendationProducts.name,
    })
    .from(affiliateConversions)
    .leftJoin(recommendationProducts, eq(affiliateConversions.productId, recommendationProducts.id))
    .orderBy(desc(affiliateConversions.transactionAt))
    .limit(limit);
}

export async function getStaleRecommendationOffers() {
  const cutoff = await recommendationStaleCutoff();
  return db
    .select({
      offer: recommendationOffers,
      productName: recommendationProducts.name,
    })
    .from(recommendationOffers)
    .innerJoin(
      recommendationProducts,
      eq(recommendationOffers.productId, recommendationProducts.id),
    )
    .where(
      and(
        eq(recommendationOffers.active, true),
        sql`(
          ${recommendationOffers.lastCheckedAt} is null
          or ${recommendationOffers.lastCheckedAt} < ${cutoff}
          or ${recommendationOffers.lastHttpStatus} is null
        )`,
      ),
    )
    .orderBy(asc(recommendationOffers.lastCheckedAt));
}

export async function getOfferForRedirect(id: number) {
  const fallbackDestination = FALLBACK_AFFILIATE_DESTINATIONS[id];
  if (fallbackDestination) {
    const fallbackProduct = FALLBACK_PUBLIC_PRODUCTS.find((product) =>
      product.offers.some((offer) => offer.id === id),
    );
    if (!fallbackProduct) return null;
    return {
      offer: {
        id,
        destinationUrl: fallbackDestination,
      },
      product: { id: fallbackProduct.id },
    };
  }
  const rows = await db
    .select({
      offer: recommendationOffers,
      product: recommendationProducts,
    })
    .from(recommendationOffers)
    .innerJoin(recommendationProducts, eq(recommendationOffers.productId, recommendationProducts.id))
    .where(
      and(
        eq(recommendationOffers.id, id),
        eq(recommendationOffers.active, true),
        publicProductCondition(),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

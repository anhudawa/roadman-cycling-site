import { and, asc, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  affiliateClickEvents,
  affiliateConversions,
  recommendationCategories,
  recommendationOffers,
  recommendationProducts,
} from "@/lib/db/schema";

export interface RecommendationAnalytics {
  from: Date;
  to: Date;
  dailyClicks: Array<{ day: string; clicks: number }>;
  products: Array<{
    id: number;
    name: string;
    category: string;
    clicks: number;
    conversions: number;
    sales: number;
    commission: number;
  }>;
  retailers: Array<{
    name: string;
    clicks: number;
    conversions: number;
    sales: number;
    commission: number;
  }>;
  categories: Array<{ name: string; clicks: number }>;
  regions: Array<{ name: string; clicks: number }>;
  devices: Array<{ name: string; clicks: number }>;
  campaigns: Array<{ name: string; clicks: number }>;
}

const REPORTED_SALE_STATUSES = ["pending", "approved", "paid"] as const;

export async function getRecommendationAnalytics(
  days = 30,
): Promise<RecommendationAnalytics> {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  const dayExpression = sql<string>`to_char(date_trunc('day', ${affiliateClickEvents.createdAt}), 'YYYY-MM-DD')`;

  const [
    dailyClicks,
    productClicks,
    productConversions,
    retailerClicks,
    retailerConversions,
    regions,
    devices,
    campaigns,
  ] = await Promise.all([
    db
      .select({
        day: dayExpression,
        clicks: sql<number>`count(*)::int`,
      })
      .from(affiliateClickEvents)
      .where(
        and(
          eq(affiliateClickEvents.bot, false),
          gte(affiliateClickEvents.createdAt, from),
        ),
      )
      .groupBy(dayExpression)
      .orderBy(asc(dayExpression)),
    db
      .select({
        id: recommendationProducts.id,
        name: recommendationProducts.name,
        category: sql<string>`coalesce(${recommendationCategories.name}, 'Uncategorised')`,
        clicks: sql<number>`count(${affiliateClickEvents.id})::int`,
      })
      .from(recommendationProducts)
      .leftJoin(
        recommendationCategories,
        eq(recommendationProducts.categoryId, recommendationCategories.id),
      )
      .leftJoin(
        affiliateClickEvents,
        and(
          eq(affiliateClickEvents.productId, recommendationProducts.id),
          eq(affiliateClickEvents.bot, false),
          gte(affiliateClickEvents.createdAt, from),
        ),
      )
      .groupBy(
        recommendationProducts.id,
        recommendationProducts.name,
        recommendationCategories.name,
      )
      .orderBy(desc(sql`count(${affiliateClickEvents.id})`)),
    db
      .select({
        productId: affiliateConversions.productId,
        conversions: sql<number>`count(*)::int`,
        sales: sql<string>`coalesce(sum(${affiliateConversions.saleAmount}), 0)::text`,
        commission: sql<string>`coalesce(sum(${affiliateConversions.commissionAmount}), 0)::text`,
      })
      .from(affiliateConversions)
      .where(
        and(
          gte(affiliateConversions.transactionAt, from),
          inArray(affiliateConversions.status, [...REPORTED_SALE_STATUSES]),
        ),
      )
      .groupBy(affiliateConversions.productId),
    db
      .select({
        name: recommendationOffers.retailerName,
        clicks: sql<number>`count(${affiliateClickEvents.id})::int`,
      })
      .from(affiliateClickEvents)
      .innerJoin(
        recommendationOffers,
        eq(affiliateClickEvents.offerId, recommendationOffers.id),
      )
      .where(
        and(
          eq(affiliateClickEvents.bot, false),
          gte(affiliateClickEvents.createdAt, from),
        ),
      )
      .groupBy(recommendationOffers.retailerName)
      .orderBy(desc(sql`count(${affiliateClickEvents.id})`)),
    db
      .select({
        name: sql<string>`coalesce(${affiliateConversions.retailerName}, 'Unmatched')`,
        conversions: sql<number>`count(*)::int`,
        sales: sql<string>`coalesce(sum(${affiliateConversions.saleAmount}), 0)::text`,
        commission: sql<string>`coalesce(sum(${affiliateConversions.commissionAmount}), 0)::text`,
      })
      .from(affiliateConversions)
      .where(
        and(
          gte(affiliateConversions.transactionAt, from),
          inArray(affiliateConversions.status, [...REPORTED_SALE_STATUSES]),
        ),
      )
      .groupBy(affiliateConversions.retailerName),
    db
      .select({
        name: sql<string>`coalesce(nullif(${affiliateClickEvents.region}, ''), 'Unknown')`,
        clicks: sql<number>`count(*)::int`,
      })
      .from(affiliateClickEvents)
      .where(
        and(
          eq(affiliateClickEvents.bot, false),
          gte(affiliateClickEvents.createdAt, from),
        ),
      )
      .groupBy(affiliateClickEvents.region)
      .orderBy(desc(sql`count(*)`)),
    db
      .select({
        name: sql<string>`coalesce(nullif(${affiliateClickEvents.device}, ''), 'Unknown')`,
        clicks: sql<number>`count(*)::int`,
      })
      .from(affiliateClickEvents)
      .where(
        and(
          eq(affiliateClickEvents.bot, false),
          gte(affiliateClickEvents.createdAt, from),
        ),
      )
      .groupBy(affiliateClickEvents.device)
      .orderBy(desc(sql`count(*)`)),
    db
      .select({
        name: sql<string>`coalesce(nullif(${affiliateClickEvents.campaign}, ''), 'Unattributed')`,
        clicks: sql<number>`count(*)::int`,
      })
      .from(affiliateClickEvents)
      .where(
        and(
          eq(affiliateClickEvents.bot, false),
          gte(affiliateClickEvents.createdAt, from),
        ),
      )
      .groupBy(affiliateClickEvents.campaign)
      .orderBy(desc(sql`count(*)`)),
  ]);

  const conversionsByProduct = new Map(
    productConversions.map((row) => [
      row.productId,
      {
        conversions: row.conversions,
        sales: Number(row.sales),
        commission: Number(row.commission),
      },
    ]),
  );
  const conversionsByRetailer = new Map(
    retailerConversions.map((row) => [
      row.name,
      {
        conversions: row.conversions,
        sales: Number(row.sales),
        commission: Number(row.commission),
      },
    ]),
  );

  const products = productClicks.map((row) => {
    const conversion = conversionsByProduct.get(row.id);
    return {
      ...row,
      conversions: conversion?.conversions ?? 0,
      sales: conversion?.sales ?? 0,
      commission: conversion?.commission ?? 0,
    };
  });

  const retailerNames = new Set([
    ...retailerClicks.map((row) => row.name),
    ...retailerConversions.map((row) => row.name),
  ]);
  const clicksByRetailer = new Map(
    retailerClicks.map((row) => [row.name, row.clicks]),
  );
  const retailers = [...retailerNames]
    .map((name) => {
      const conversion = conversionsByRetailer.get(name);
      return {
        name,
        clicks: clicksByRetailer.get(name) ?? 0,
        conversions: conversion?.conversions ?? 0,
        sales: conversion?.sales ?? 0,
        commission: conversion?.commission ?? 0,
      };
    })
    .sort((a, b) => b.clicks - a.clicks || b.commission - a.commission);
  const categoryTotals = new Map<string, number>();
  for (const product of products) {
    categoryTotals.set(
      product.category,
      (categoryTotals.get(product.category) ?? 0) + product.clicks,
    );
  }
  const categories = [...categoryTotals]
    .map(([name, clicks]) => ({ name, clicks }))
    .sort((a, b) => b.clicks - a.clicks);

  return {
    from,
    to,
    dailyClicks,
    products,
    retailers,
    categories,
    regions,
    devices,
    campaigns,
  };
}

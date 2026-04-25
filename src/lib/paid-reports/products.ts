import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { reportProducts } from "@/lib/db/schema";
import type { ToolSlug } from "@/lib/tool-results/types";
import {
  isPaidProductSlug,
  type PaidProductSlug,
  type ReportProduct,
} from "./types";

/**
 * Product registry $— thin read-through cache around `report_products`.
 *
 * Prices are stored in cents so we can display them without rounding
 * drift; currency defaults to EUR but the column is a text field so
 * USD/GBP pricing lands cleanly if we localise later. Bundles reference
 * child slugs in a JSON array so we don't need a join table $— admin
 * can re-order bundle items without a schema migration.
 */

type Row = typeof reportProducts.$inferSelect;

function rowToDomain(row: Row): ReportProduct | null {
  if (!isPaidProductSlug(row.slug)) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    toolSlug: (row.toolSlug as ToolSlug | null) ?? null,
    bundleItems:
      Array.isArray(row.bundleItems)
        ? (row.bundleItems.filter(isPaidProductSlug) as PaidProductSlug[])
        : null,
    priceCents: row.priceCents,
    currency: row.currency,
    stripePriceId: row.stripePriceId,
    active: row.active,
    pageCountTarget: row.pageCountTarget,
  };
}

/**
 * 5-minute in-memory TTL. Product rows are read on every checkout
 * session create $— no point hitting the DB every time.
 */
const CACHE_TTL_MS = 5 * 60 * 1000;
let cachedAt = 0;
let cached: ReportProduct[] | null = null;

async function loadAllProducts(): Promise<ReportProduct[]> {
  if (cached && Date.now() - cachedAt < CACHE_TTL_MS) return cached;
  const rows = await db
    .select()
    .from(reportProducts)
    .where(eq(reportProducts.active, true));
  cached = rows
    .map(rowToDomain)
    .filter((x): x is ReportProduct => x !== null);
  cachedAt = Date.now();
  return cached;
}

export async function listActiveProducts(): Promise<ReportProduct[]> {
  return loadAllProducts();
}

export async function getProductBySlug(
  slug: string,
): Promise<ReportProduct | null> {
  if (!isPaidProductSlug(slug)) return null;
  const products = await loadAllProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

/**
 * The one product a given tool unlocks (for the upsell card). Returns
 * null if no product is currently active.
 */
export async function getProductForTool(
  tool: ToolSlug,
): Promise<ReportProduct | null> {
  const products = await loadAllProducts();
  return products.find((p) => p.toolSlug === tool) ?? null;
}

/** Invalidate cache $— call after admin price edits. */
export function invalidateProductCache(): void {
  cached = null;
  cachedAt = 0;
}

/**
 * Resolve bundle children. Returns only active children; if a bundle
 * references a deactivated product the bundle itself continues to work
 * but only delivers the still-active children.
 */
export async function resolveBundleChildren(
  bundleSlug: PaidProductSlug,
): Promise<ReportProduct[]> {
  const bundle = await getProductBySlug(bundleSlug);
  if (!bundle || !bundle.bundleItems) return [];
  const products = await loadAllProducts();
  return products.filter(
    (p) => bundle.bundleItems!.includes(p.slug) && p.active,
  );
}

/**
 * Admin: update price + stripe price id. Clears cache so the next
 * checkout reflects the new price immediately.
 */
export async function updateProductPricing(
  slug: PaidProductSlug,
  priceCents: number,
  stripePriceId: string | null,
): Promise<void> {
  await db
    .update(reportProducts)
    .set({
      priceCents,
      stripePriceId,
      updatedAt: new Date(),
    })
    .where(and(eq(reportProducts.slug, slug), eq(reportProducts.active, true)));
  invalidateProductCache();
}

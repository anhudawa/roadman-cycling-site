"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  affiliateConversions,
  recommendationBrands,
  recommendationCategories,
  recommendationCollectionProducts,
  recommendationCollections,
  recommendationOffers,
  recommendationProducts,
  recommendationSettings,
} from "@/lib/db/schema";
import { requireAdmin, requireAuth } from "@/lib/admin/auth";
import { parseRecommendationCatalogCsv } from "@/lib/recommends/catalog-csv";
import { parseAffiliateConversionCsv } from "@/lib/recommends/csv";
import { parseRecommendationProductForm } from "@/lib/recommends/form-data";

export interface RecommendsActionState {
  error?: string;
  success?: string;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function resolveBrandId(name: string): Promise<number | null> {
  if (!name) return null;
  const slug = slugify(name);
  const existing = await db
    .select({ id: recommendationBrands.id })
    .from(recommendationBrands)
    .where(eq(recommendationBrands.slug, slug))
    .limit(1);
  if (existing[0]) return existing[0].id;
  const inserted = await db
    .insert(recommendationBrands)
    .values({ name, slug })
    .returning({ id: recommendationBrands.id });
  return inserted[0]?.id ?? null;
}

function productValues(
  input: ReturnType<typeof parseRecommendationProductForm>,
  brandId: number | null,
) {
  const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
  const now = new Date();
  return {
    brandId,
    categoryId: input.categoryId,
    name: input.name,
    slug: input.slug,
    status: input.status,
    badge: input.badge || null,
    evidenceStatus: input.evidenceStatus,
    verdict: input.verdict,
    shortDescription: input.shortDescription,
    whyRecommend: input.whyRecommend,
    whoFor: input.whoFor,
    whoSkip: input.whoSkip || null,
    strengths: input.strengths,
    limitations: input.limitations,
    specifications: input.specifications,
    useCases: input.useCases,
    tags: input.tags,
    disciplines: input.disciplines,
    seasons: input.seasons,
    priceBand: input.priceBand || null,
    imageUrl: input.imageUrl || null,
    imageAlt: input.imageAlt || null,
    relatedArticleUrl: input.relatedArticleUrl || null,
    featured: input.featured,
    bestValue: input.bestValue,
    sortOrder: input.sortOrder,
    scheduledAt:
      scheduledAt && !Number.isNaN(scheduledAt.getTime()) ? scheduledAt : null,
    publishedAt: input.status === "published" ? now : null,
    lastReviewedAt: input.status === "published" ? now : null,
    updatedAt: now,
  };
}

async function syncOffers(
  productId: number,
  offers: ReturnType<typeof parseRecommendationProductForm>["offers"],
) {
  const existing = await db
    .select({ id: recommendationOffers.id })
    .from(recommendationOffers)
    .where(eq(recommendationOffers.productId, productId));
  const retainedIds = offers.flatMap((offer) => (offer.id ? [offer.id] : []));
  const toDeactivate = existing
    .map((offer) => offer.id)
    .filter((id) => !retainedIds.includes(id));
  if (toDeactivate.length) {
    await db
      .update(recommendationOffers)
      .set({ active: false, updatedAt: new Date() })
      .where(
        and(
          eq(recommendationOffers.productId, productId),
          inArray(recommendationOffers.id, toDeactivate),
        ),
      );
  }

  for (const offer of offers) {
    const values = {
      retailerName: offer.retailerName,
      affiliateProgram: offer.affiliateProgram || null,
      destinationUrl: offer.destinationUrl,
      regions: offer.regions,
      currency: offer.currency || null,
      priceLabel: offer.priceLabel || null,
      promoCode: offer.promoCode || null,
      priority: offer.priority,
      active: offer.active,
      updatedAt: new Date(),
    };
    if (offer.id) {
      await db
        .update(recommendationOffers)
        .set(values)
        .where(
          and(
            eq(recommendationOffers.id, offer.id),
            eq(recommendationOffers.productId, productId),
          ),
        );
    } else {
      await db.insert(recommendationOffers).values({ productId, ...values });
    }
  }
}

function revalidateRecommends() {
  revalidatePath("/recommends", "layout");
  revalidatePath("/admin/recommends", "layout");
}

export async function createRecommendationProductAction(
  _state: RecommendsActionState,
  formData: FormData,
): Promise<RecommendsActionState> {
  await requireAuth();
  let productId: number;
  try {
    const input = parseRecommendationProductForm(formData);
    const brandId = await resolveBrandId(input.brandName);
    const inserted = await db
      .insert(recommendationProducts)
      .values(productValues(input, brandId))
      .returning({ id: recommendationProducts.id });
    const insertedId = inserted[0]?.id;
    if (!insertedId) throw new Error("Product was not created");
    productId = insertedId;
    await syncOffers(productId, input.offers);
    revalidateRecommends();
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to create this recommendation.",
    };
  }
  redirect(`/admin/recommends/products/${productId}/edit?saved=1`);
}

export async function updateRecommendationProductAction(
  productId: number,
  _state: RecommendsActionState,
  formData: FormData,
): Promise<RecommendsActionState> {
  await requireAuth();
  try {
    const input = parseRecommendationProductForm(formData);
    const brandId = await resolveBrandId(input.brandName);
    await db
      .update(recommendationProducts)
      .set(productValues(input, brandId))
      .where(eq(recommendationProducts.id, productId));
    await syncOffers(productId, input.offers);
    revalidateRecommends();
    return { success: "Recommendation saved." };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to save this recommendation.",
    };
  }
}

export async function duplicateRecommendationProductAction(productId: number) {
  await requireAuth();
  const source = await db
    .select()
    .from(recommendationProducts)
    .where(eq(recommendationProducts.id, productId))
    .limit(1);
  if (!source[0]) throw new Error("Recommendation not found");
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...copy } = source[0];
  void _id;
  void _createdAt;
  void _updatedAt;
  const suffix = Date.now().toString().slice(-6);
  const inserted = await db
    .insert(recommendationProducts)
    .values({
      ...copy,
      name: `${copy.name} (copy)`,
      slug: `${copy.slug}-copy-${suffix}`,
      status: "draft",
      publishedAt: null,
      scheduledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning({ id: recommendationProducts.id });
  const newId = inserted[0]?.id;
  if (!newId) throw new Error("Recommendation was not duplicated");
  const offers = await db
    .select()
    .from(recommendationOffers)
    .where(eq(recommendationOffers.productId, productId));
  if (offers.length) {
    await db.insert(recommendationOffers).values(
      offers.map(({ id: _offerId, createdAt: _created, updatedAt: _updated, ...offer }) => {
        void _offerId;
        void _created;
        void _updated;
        return {
          ...offer,
          productId: newId,
          active: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }),
    );
  }
  revalidateRecommends();
  redirect(`/admin/recommends/products/${newId}/edit`);
}

export async function archiveRecommendationProductAction(productId: number) {
  await requireAuth();
  await db
    .update(recommendationProducts)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(recommendationProducts.id, productId));
  revalidateRecommends();
}

export async function createRecommendationCategoryAction(formData: FormData) {
  await requireAuth();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugify(name);
  if (!name || !slug) throw new Error("Name and slug are required");
  await db.insert(recommendationCategories).values({
    name,
    slug,
    description: String(formData.get("description") ?? "").trim() || null,
    icon: String(formData.get("icon") ?? "gear").trim() || "gear",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    active: true,
  });
  revalidateRecommends();
}

export async function toggleRecommendationCategoryAction(
  categoryId: number,
  active: boolean,
) {
  await requireAuth();
  await db
    .update(recommendationCategories)
    .set({ active, updatedAt: new Date() })
    .where(eq(recommendationCategories.id, categoryId));
  revalidateRecommends();
}

export async function updateRecommendationCategoryAction(
  categoryId: number,
  formData: FormData,
) {
  await requireAuth();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Category name and a valid slug are required");
  }
  await db
    .update(recommendationCategories)
    .set({
      name,
      slug,
      description: String(formData.get("description") ?? "").trim() || null,
      icon: String(formData.get("icon") ?? "gear").trim() || "gear",
      sortOrder: Number(formData.get("sortOrder") ?? 0),
      updatedAt: new Date(),
    })
    .where(eq(recommendationCategories.id, categoryId));
  revalidateRecommends();
}

function optionalDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function collectionValues(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slug =
    String(formData.get("slug") ?? "").trim() || slugify(name);
  const rule = String(formData.get("rule") ?? "manual");
  if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Collection name and a valid slug are required");
  }
  if (!["manual", "featured", "best_value"].includes(rule)) {
    throw new Error("Unsupported collection rule");
  }
  return {
    name,
    slug,
    description:
      String(formData.get("description") ?? "").trim() || null,
    rule: rule as "manual" | "featured" | "best_value",
    active: formData.get("active") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    startsAt: optionalDate(formData.get("startsAt")),
    endsAt: optionalDate(formData.get("endsAt")),
    updatedAt: new Date(),
  };
}

function collectionProductIds(formData: FormData) {
  return formData
    .getAll("productIds")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);
}

async function syncCollectionProducts(
  collectionId: number,
  productIds: number[],
) {
  await db
    .delete(recommendationCollectionProducts)
    .where(
      eq(recommendationCollectionProducts.collectionId, collectionId),
    );
  if (productIds.length) {
    await db.insert(recommendationCollectionProducts).values(
      productIds.map((productId, index) => ({
        collectionId,
        productId,
        sortOrder: (index + 1) * 10,
      })),
    );
  }
}

export async function createRecommendationCollectionAction(
  formData: FormData,
) {
  await requireAuth();
  const values = collectionValues(formData);
  const inserted = await db
    .insert(recommendationCollections)
    .values(values)
    .returning({ id: recommendationCollections.id });
  if (!inserted[0]) throw new Error("Collection was not created");
  await syncCollectionProducts(
    inserted[0].id,
    collectionProductIds(formData),
  );
  revalidateRecommends();
}

export async function updateRecommendationCollectionAction(
  collectionId: number,
  formData: FormData,
) {
  await requireAuth();
  await db
    .update(recommendationCollections)
    .set(collectionValues(formData))
    .where(eq(recommendationCollections.id, collectionId));
  await syncCollectionProducts(
    collectionId,
    collectionProductIds(formData),
  );
  revalidateRecommends();
}

export async function createRecommendationBrandAction(formData: FormData) {
  await requireAuth();
  const name = String(formData.get("name") ?? "").trim();
  const slug =
    String(formData.get("slug") ?? "").trim() || slugify(name);
  if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Brand name and a valid slug are required");
  }
  await db.insert(recommendationBrands).values({
    name,
    slug,
    websiteUrl: String(formData.get("websiteUrl") ?? "").trim() || null,
    logoUrl: String(formData.get("logoUrl") ?? "").trim() || null,
  });
  revalidateRecommends();
}

export async function updateRecommendationBrandAction(
  brandId: number,
  formData: FormData,
) {
  await requireAuth();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Brand name and a valid slug are required");
  }
  await db
    .update(recommendationBrands)
    .set({
      name,
      slug,
      websiteUrl: String(formData.get("websiteUrl") ?? "").trim() || null,
      logoUrl: String(formData.get("logoUrl") ?? "").trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(recommendationBrands.id, brandId));
  revalidateRecommends();
}

export async function updateRecommendationSettingsAction(
  formData: FormData,
) {
  await requireAdmin();
  const disclosure = String(
    formData.get("affiliateDisclosure") ?? "",
  ).trim();
  const defaultRegion = String(
    formData.get("defaultRegion") ?? "IE",
  ).trim();
  const staleOfferDays = Math.max(
    1,
    Number(formData.get("staleOfferDays") ?? 30) || 30,
  );
  if (!disclosure) throw new Error("Affiliate disclosure is required");
  const values = [
    ["affiliate_disclosure", disclosure],
    ["default_region", defaultRegion],
    ["stale_offer_days", String(staleOfferDays)],
  ] as const;
  for (const [key, value] of values) {
    await db
      .insert(recommendationSettings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: recommendationSettings.key,
        set: { value, updatedAt: new Date() },
      });
  }
  revalidateRecommends();
}

export async function checkRecommendationLinksAction() {
  await requireAuth();
  const offers = await db
    .select()
    .from(recommendationOffers)
    .where(eq(recommendationOffers.active, true));
  const checkedAt = new Date();
  for (const offer of offers) {
    let status: number | null = null;
    let error: string | null = null;
    try {
      const affiliateUrl = new URL(offer.destinationUrl);
      const directDestination = affiliateUrl.searchParams.get("u");
      if (!directDestination) {
        error = "Manual check required: no non-tracking destination is stored.";
      } else {
        let response = await fetch(directDestination, {
          method: "HEAD",
          redirect: "follow",
          cache: "no-store",
          signal: AbortSignal.timeout(10_000),
          headers: { "user-agent": "Roadman-Link-Health/1.0" },
        });
        if (response.status === 405) {
          response = await fetch(directDestination, {
            method: "GET",
            redirect: "follow",
            cache: "no-store",
            signal: AbortSignal.timeout(10_000),
            headers: {
              "user-agent": "Roadman-Link-Health/1.0",
              range: "bytes=0-0",
            },
          });
        }
        status = response.status;
        error = response.ok ? null : `Direct destination returned HTTP ${status}`;
      }
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message.slice(0, 300) : "Link check failed";
    }
    await db
      .update(recommendationOffers)
      .set({
        lastCheckedAt: checkedAt,
        lastHttpStatus: status,
        lastError: error,
        updatedAt: checkedAt,
      })
      .where(eq(recommendationOffers.id, offer.id));
  }
  revalidateRecommends();
}

export async function importAffiliateConversionsAction(
  _state: RecommendsActionState,
  formData: FormData,
): Promise<RecommendsActionState> {
  await requireAdmin();
  try {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { error: "Choose a CSV export first." };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { error: "CSV must be smaller than 5 MB." };
    }
    const rows = parseAffiliateConversionCsv(await file.text());
    let imported = 0;
    for (const row of rows) {
      let productId: number | null = null;
      if (row.productSlug) {
        const product = await db
          .select({ id: recommendationProducts.id })
          .from(recommendationProducts)
          .where(eq(recommendationProducts.slug, row.productSlug))
          .limit(1);
        productId = product[0]?.id ?? null;
      }
      if (!productId && row.offerId) {
        const offer = await db
          .select({ productId: recommendationOffers.productId })
          .from(recommendationOffers)
          .where(eq(recommendationOffers.id, row.offerId))
          .limit(1);
        productId = offer[0]?.productId ?? null;
      }
      const values = {
        network: row.network,
        externalTransactionId: row.transactionId,
        offerId: row.offerId,
        productId,
        clickId: row.clickId,
        retailerName: row.retailerName,
        saleAmount: row.saleAmount,
        commissionAmount: row.commissionAmount,
        currency: row.currency,
        status: row.status,
        transactionAt: row.transactionAt,
        rawData: row.rawData,
      };
      await db
        .insert(affiliateConversions)
        .values(values)
        .onConflictDoUpdate({
          target: [
            affiliateConversions.network,
            affiliateConversions.externalTransactionId,
          ],
          set: {
            offerId: values.offerId,
            productId: values.productId,
            clickId: values.clickId,
            retailerName: values.retailerName,
            saleAmount: values.saleAmount,
            commissionAmount: values.commissionAmount,
            currency: values.currency,
            status: values.status,
            transactionAt: values.transactionAt,
            rawData: values.rawData,
            importedAt: new Date(),
          },
        });
      imported += 1;
    }
    revalidateRecommends();
    return { success: `${imported} conversion ${imported === 1 ? "row" : "rows"} imported.` };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to import the CSV.",
    };
  }
}

export async function importRecommendationCatalogAction(
  _state: RecommendsActionState,
  formData: FormData,
): Promise<RecommendsActionState> {
  await requireAdmin();
  try {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { error: "Choose a catalogue CSV first." };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { error: "CSV must be smaller than 5 MB." };
    }
    const rows = parseRecommendationCatalogCsv(await file.text());
    let productsImported = 0;
    let offersImported = 0;
    for (const row of rows) {
      const category = await db
        .select({ id: recommendationCategories.id })
        .from(recommendationCategories)
        .where(eq(recommendationCategories.slug, row.categorySlug))
        .limit(1);
      if (!category[0]) {
        throw new Error(`Unknown category: ${row.categorySlug}`);
      }
      const brandId = await resolveBrandId(row.brandName);
      const now = new Date();
      const inserted = await db
        .insert(recommendationProducts)
        .values({
          brandId,
          categoryId: category[0].id,
          name: row.name,
          slug: row.slug,
          status: row.status,
          badge: row.badge || null,
          evidenceStatus: row.evidenceStatus,
          verdict: row.verdict,
          shortDescription: row.shortDescription,
          whyRecommend: row.whyRecommend,
          whoFor: row.whoFor,
          whoSkip: row.whoSkip || null,
          strengths: row.strengths,
          limitations: row.limitations,
          specifications: row.specifications,
          tags: row.tags,
          useCases: row.useCases,
          disciplines: row.disciplines,
          seasons: row.seasons,
          priceBand: row.priceBand || null,
          imageUrl: row.imageUrl || null,
          imageAlt: row.imageAlt || null,
          relatedArticleUrl: row.relatedArticleUrl || null,
          featured: row.featured,
          bestValue: row.bestValue,
          sortOrder: row.sortOrder,
          publishedAt: row.status === "published" ? now : null,
          lastReviewedAt: row.status === "published" ? now : null,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: recommendationProducts.slug,
          set: {
            brandId,
            categoryId: category[0].id,
            name: row.name,
            status: row.status,
            badge: row.badge || null,
            evidenceStatus: row.evidenceStatus,
            verdict: row.verdict,
            shortDescription: row.shortDescription,
            whyRecommend: row.whyRecommend,
            whoFor: row.whoFor,
            whoSkip: row.whoSkip || null,
            strengths: row.strengths,
            limitations: row.limitations,
            specifications: row.specifications,
            tags: row.tags,
            useCases: row.useCases,
            disciplines: row.disciplines,
            seasons: row.seasons,
            priceBand: row.priceBand || null,
            imageUrl: row.imageUrl || null,
            imageAlt: row.imageAlt || null,
            relatedArticleUrl: row.relatedArticleUrl || null,
            featured: row.featured,
            bestValue: row.bestValue,
            sortOrder: row.sortOrder,
            publishedAt: row.status === "published" ? now : null,
            lastReviewedAt: row.status === "published" ? now : null,
            updatedAt: now,
          },
        })
        .returning({ id: recommendationProducts.id });
      const productId = inserted[0]?.id;
      if (!productId) throw new Error(`Unable to import ${row.name}`);
      productsImported += 1;

      if (row.destinationUrl) {
        const existingOffer = await db
          .select({ id: recommendationOffers.id })
          .from(recommendationOffers)
          .where(
            and(
              eq(recommendationOffers.productId, productId),
              eq(recommendationOffers.retailerName, row.retailerName),
              eq(recommendationOffers.destinationUrl, row.destinationUrl),
            ),
          )
          .limit(1);
        const offerValues = {
          retailerName: row.retailerName,
          affiliateProgram: row.affiliateProgram || null,
          destinationUrl: row.destinationUrl,
          regions: row.regions,
          currency: row.currency || null,
          priceLabel: row.priceLabel || null,
          promoCode: row.promoCode || null,
          active: true,
          lastCheckedAt: now,
          lastHttpStatus: 200,
          updatedAt: now,
        };
        if (existingOffer[0]) {
          await db
            .update(recommendationOffers)
            .set(offerValues)
            .where(eq(recommendationOffers.id, existingOffer[0].id));
        } else {
          await db
            .insert(recommendationOffers)
            .values({ productId, ...offerValues });
        }
        offersImported += 1;
      }
    }
    revalidateRecommends();
    return {
      success: `${productsImported} product row${productsImported === 1 ? "" : "s"} and ${offersImported} offer${offersImported === 1 ? "" : "s"} imported.`,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to import the catalogue CSV.",
    };
  }
}

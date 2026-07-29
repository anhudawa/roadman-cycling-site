import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { recommendationOffers } from "@/lib/db/schema";
import {
  getAdminRecommendationCategories,
  getAdminRecommendationProduct,
} from "@/lib/recommends/queries";
import { updateRecommendationProductAction } from "../../../actions";
import { ProductForm } from "../../../_components/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditRecommendationProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const [product, categories, offers] = await Promise.all([
    getAdminRecommendationProduct(id),
    getAdminRecommendationCategories(),
    db.select().from(recommendationOffers).where(eq(recommendationOffers.productId, id)),
  ]);
  if (!product) notFound();
  const editableProduct = {
    ...product,
    editableOffers: offers.map((offer) => ({
      id: offer.id,
      retailerName: offer.retailerName,
      affiliateProgram: offer.affiliateProgram ?? "",
      destinationUrl: offer.destinationUrl,
      regions: offer.regions,
      currency: offer.currency ?? "",
      priceLabel: offer.priceLabel ?? "",
      promoCode: offer.promoCode ?? "",
      priority: offer.priority,
      active: offer.active,
    })),
  };
  const updateAction = updateRecommendationProductAction.bind(null, product.id);
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/recommends/products" className="text-xs text-foreground-muted">← Products</Link>
          <h1 className="mt-2 text-3xl font-semibold text-white">Edit {product.name}</h1>
          <p className="mt-1 text-sm text-foreground-muted">Last updated {product.updatedAt.toLocaleString("en-IE")}.</p>
        </div>
        {product.status === "published" && product.categorySlug ? (
          <Link href={`/recommends/${product.categorySlug}/${product.slug}`} target="_blank" className="rounded-md border border-white/15 px-4 py-2 text-sm text-white">
            View live page ↗
          </Link>
        ) : (
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-foreground-muted">Not publicly visible</span>
        )}
      </header>
      <ProductForm action={updateAction} product={editableProduct} categories={categories} />
    </div>
  );
}

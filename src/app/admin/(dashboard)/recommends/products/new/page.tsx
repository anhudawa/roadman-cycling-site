import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { getAdminRecommendationCategories } from "@/lib/recommends/queries";
import { createRecommendationProductAction } from "../../actions";
import { ProductForm } from "../../_components/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewRecommendationProductPage() {
  await requireAuth();
  const categories = await getAdminRecommendationCategories();
  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/recommends/products" className="text-xs text-foreground-muted">← Products</Link>
        <h1 className="mt-2 text-3xl font-semibold text-white">New recommendation</h1>
        <p className="mt-1 text-sm text-foreground-muted">Start in draft. Only mark evidence that can be substantiated.</p>
      </header>
      <ProductForm action={createRecommendationProductAction} categories={categories} />
    </div>
  );
}

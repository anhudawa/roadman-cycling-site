import Link from "next/link";
import { Button } from "@/components/admin/ui";
import { requireAuth } from "@/lib/admin/auth";
import { getAdminRecommendationProducts } from "@/lib/recommends/queries";
import {
  archiveRecommendationProductAction,
  duplicateRecommendationProductAction,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function RecommendationProductsAdminPage() {
  await requireAuth();
  let products: Awaited<ReturnType<typeof getAdminRecommendationProducts>> = [];
  let ready = true;
  try {
    products = await getAdminRecommendationProducts();
  } catch {
    ready = false;
  }
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/recommends" className="text-xs text-foreground-muted">← Recommends</Link>
          <h1 className="mt-2 text-3xl font-semibold text-white">Products</h1>
          <p className="mt-1 text-sm text-foreground-muted">Editorial recommendations and every retailer offer attached to them.</p>
        </div>
        <Button href="/admin/recommends/products/new">New recommendation</Button>
      </header>

      {!ready ? <p className="rounded-md border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">Apply database migration 0052 before adding products.</p> : null}

      <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]">
        {products.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs text-foreground-subtle">
                <tr><th className="px-4 py-3">Recommendation</th><th>Category</th><th>Status</th><th>Offers</th><th>Reviewed</th><th className="px-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((product) => (
                  <tr key={product.id} className="text-foreground-muted">
                    <td className="px-4 py-3">
                      <strong className="block text-white">{product.name}</strong>
                      <span className="text-xs">{product.brandName || "No brand"} · {product.verdict}</span>
                    </td>
                    <td>{product.categoryName ?? "—"}</td>
                    <td><span className="rounded-full border border-white/10 px-2 py-1 text-xs">{product.status}</span></td>
                    <td>{product.offers.filter((offer) => offer.active).length}</td>
                    <td className="text-xs">{product.lastReviewedAt?.toLocaleDateString("en-IE") ?? "Not reviewed"}</td>
                    <td className="px-4">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/recommends/products/${product.id}/edit`} className="rounded border border-white/15 px-2 py-1 text-xs text-white">Edit</Link>
                        <form action={duplicateRecommendationProductAction.bind(null, product.id)}>
                          <button className="rounded border border-white/15 px-2 py-1 text-xs text-white">Duplicate</button>
                        </form>
                        {product.status !== "archived" ? (
                          <form action={archiveRecommendationProductAction.bind(null, product.id)}>
                            <button className="rounded border border-red-400/20 px-2 py-1 text-xs text-red-200">Archive</button>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <h2 className="font-heading text-3xl text-white">NO RECOMMENDATIONS YET.</h2>
            <p className="mt-2 text-sm text-foreground-muted">Create the first one as a draft. It will stay off the public site until published.</p>
          </div>
        )}
      </section>
    </div>
  );
}

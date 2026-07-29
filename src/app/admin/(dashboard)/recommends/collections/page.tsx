import Link from "next/link";
import { Button } from "@/components/admin/ui";
import { requireAuth } from "@/lib/admin/auth";
import {
  getAdminRecommendationCollections,
  getAdminRecommendationProducts,
} from "@/lib/recommends/queries";
import {
  createRecommendationCollectionAction,
  updateRecommendationCollectionAction,
} from "../actions";

export const dynamic = "force-dynamic";

const field =
  "focus-ring w-full rounded-md border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[var(--color-border-focus)]";

function ProductChoices({
  products,
  selected,
}: {
  products: Awaited<ReturnType<typeof getAdminRecommendationProducts>>;
  selected: number[];
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs text-foreground-muted">
        Manual products
      </legend>
      <div className="grid max-h-56 gap-2 overflow-y-auto rounded-md border border-white/10 p-3 md:grid-cols-2">
        {products.map((product) => (
          <label
            key={product.id}
            className="flex items-start gap-2 text-xs text-foreground-muted"
          >
            <input
              type="checkbox"
              name="productIds"
              value={product.id}
              defaultChecked={selected.includes(product.id)}
              className="mt-0.5"
            />
            <span>
              <strong className="block text-white">{product.name}</strong>
              {product.status}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default async function RecommendationCollectionsPage() {
  await requireAuth();
  const [collections, products] = await Promise.all([
    getAdminRecommendationCollections(),
    getAdminRecommendationProducts(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/recommends"
          className="text-xs text-foreground-muted"
        >
          ← Recommends
        </Link>
        <h1 className="mt-2 text-3xl font-semibold text-white">Collections</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Build shareable edits such as Roadman Picks, Best Value and seasonal
          gear lists.
        </p>
      </header>

      <form
        action={createRecommendationCollectionAction}
        className="space-y-4 rounded-lg border border-white/10 bg-white/[0.035] p-5"
      >
        <h2 className="text-lg font-semibold text-white">Add collection</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label>
            <span className="mb-1 block text-xs text-foreground-muted">Name</span>
            <input className={field} name="name" required />
          </label>
          <label>
            <span className="mb-1 block text-xs text-foreground-muted">Slug</span>
            <input
              className={field}
              name="slug"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            />
          </label>
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs text-foreground-muted">
              Description
            </span>
            <textarea className={field} name="description" rows={2} />
          </label>
          <label>
            <span className="mb-1 block text-xs text-foreground-muted">Rule</span>
            <select className={field} name="rule" defaultValue="manual">
              <option value="manual">Manual products</option>
              <option value="featured">Roadman picks</option>
              <option value="best_value">Best value</option>
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs text-foreground-muted">
              Sort order
            </span>
            <input
              className={field}
              name="sortOrder"
              type="number"
              min="0"
              defaultValue="0"
            />
          </label>
        </div>
        <ProductChoices products={products} selected={[]} />
        <label className="flex items-center gap-2 text-sm text-white">
          <input type="checkbox" name="active" defaultChecked /> Active
        </label>
        <Button type="submit">Add collection</Button>
      </form>

      <div className="space-y-4">
        {collections.map((collection) => (
          <form
            key={collection.id}
            action={updateRecommendationCollectionAction.bind(
              null,
              collection.id,
            )}
            className="space-y-4 rounded-lg border border-white/10 bg-white/[0.035] p-5"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className={field}
                name="name"
                defaultValue={collection.name}
                aria-label={`${collection.name} name`}
              />
              <input
                className={field}
                name="slug"
                defaultValue={collection.slug}
                aria-label={`${collection.name} slug`}
              />
              <textarea
                className={`${field} md:col-span-2`}
                name="description"
                rows={2}
                defaultValue={collection.description ?? ""}
                aria-label={`${collection.name} description`}
              />
              <select
                className={field}
                name="rule"
                defaultValue={collection.rule}
                aria-label={`${collection.name} rule`}
              >
                <option value="manual">Manual products</option>
                <option value="featured">Roadman picks</option>
                <option value="best_value">Best value</option>
              </select>
              <input
                className={field}
                name="sortOrder"
                type="number"
                min="0"
                defaultValue={collection.sortOrder}
                aria-label={`${collection.name} sort order`}
              />
            </div>
            <ProductChoices
              products={products}
              selected={collection.productIds}
            />
            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={collection.active}
                />
                Active
              </label>
              <button className="rounded border border-white/15 px-3 py-2 text-xs text-white">
                Save collection
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}

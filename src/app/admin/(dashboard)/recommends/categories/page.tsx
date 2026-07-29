import Link from "next/link";
import { Button } from "@/components/admin/ui";
import { requireAuth } from "@/lib/admin/auth";
import { getAdminRecommendationCategories } from "@/lib/recommends/queries";
import {
  createRecommendationCategoryAction,
  toggleRecommendationCategoryAction,
  updateRecommendationCategoryAction,
} from "../actions";

export const dynamic = "force-dynamic";

const field =
  "focus-ring w-full rounded-md border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[var(--color-border-focus)]";

export default async function RecommendationCategoriesPage() {
  await requireAuth();
  const categories = await getAdminRecommendationCategories();
  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/recommends" className="text-xs text-foreground-muted">← Recommends</Link>
        <h1 className="mt-2 text-3xl font-semibold text-white">Categories</h1>
        <p className="mt-1 text-sm text-foreground-muted">These control the public browse navigation and category landing pages.</p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <form action={createRecommendationCategoryAction} className="space-y-4 rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <h2 className="text-lg font-semibold text-white">Add category</h2>
          <label className="block"><span className="mb-1 block text-xs text-foreground-muted">Name</span><input className={field} name="name" required /></label>
          <label className="block"><span className="mb-1 block text-xs text-foreground-muted">Slug (optional)</span><input className={field} name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /></label>
          <label className="block"><span className="mb-1 block text-xs text-foreground-muted">Description</span><textarea className={field} name="description" rows={4} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label><span className="mb-1 block text-xs text-foreground-muted">Icon key</span><input className={field} name="icon" defaultValue="gear" /></label>
            <label><span className="mb-1 block text-xs text-foreground-muted">Sort order</span><input className={field} name="sortOrder" type="number" min="0" defaultValue="0" /></label>
          </div>
          <Button type="submit">Add category</Button>
        </form>

        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]">
          {categories.map((category) => (
            <div key={category.id} className="border-b border-white/5 px-4 py-4 last:border-0">
              <form action={updateRecommendationCategoryAction.bind(null, category.id)} className="grid gap-3 md:grid-cols-2">
                <input className={field} name="name" defaultValue={category.name} aria-label={`${category.name} name`} />
                <input className={field} name="slug" defaultValue={category.slug} aria-label={`${category.name} slug`} />
                <textarea className={`${field} md:col-span-2`} name="description" rows={2} defaultValue={category.description ?? ""} aria-label={`${category.name} description`} />
                <div className="grid grid-cols-2 gap-3">
                  <input className={field} name="icon" defaultValue={category.icon} aria-label={`${category.name} icon`} />
                  <input className={field} name="sortOrder" type="number" min="0" defaultValue={category.sortOrder} aria-label={`${category.name} sort order`} />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button className="rounded border border-white/15 px-3 py-2 text-xs text-white">Save</button>
                </div>
              </form>
              <form className="mt-2 flex justify-end" action={toggleRecommendationCategoryAction.bind(null, category.id, !category.active)}>
                <button className={`rounded-full border px-3 py-1 text-xs ${category.active ? "border-emerald-400/30 text-emerald-200" : "border-white/10 text-foreground-muted"}`}>
                  {category.active ? "Active" : "Hidden"}
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

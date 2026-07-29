import Link from "next/link";
import { Button } from "@/components/admin/ui";
import { requireAuth } from "@/lib/admin/auth";
import { getAdminRecommendationBrands } from "@/lib/recommends/queries";
import {
  createRecommendationBrandAction,
  updateRecommendationBrandAction,
} from "../actions";

export const dynamic = "force-dynamic";

const field =
  "focus-ring w-full rounded-md border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[var(--color-border-focus)]";

export default async function RecommendationBrandsPage() {
  await requireAuth();
  const brands = await getAdminRecommendationBrands();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/recommends" className="text-xs text-foreground-muted">
          ← Recommends
        </Link>
        <h1 className="mt-2 text-3xl font-semibold text-white">Brands</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Keep brand names, websites and product imagery consistent.
        </p>
      </header>

      <form
        action={createRecommendationBrandAction}
        className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-5 md:grid-cols-2"
      >
        <input className={field} name="name" placeholder="Brand name" required />
        <input
          className={field}
          name="slug"
          placeholder="brand-slug"
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
        />
        <input
          className={field}
          name="websiteUrl"
          type="url"
          placeholder="https://brand.example"
        />
        <input
          className={field}
          name="logoUrl"
          type="url"
          placeholder="Logo URL (optional)"
        />
        <div className="md:col-span-2">
          <Button type="submit">Add brand</Button>
        </div>
      </form>

      <div className="space-y-3">
        {brands.map((brand) => (
          <form
            key={brand.id}
            action={updateRecommendationBrandAction.bind(null, brand.id)}
            className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 md:grid-cols-2"
          >
            <input className={field} name="name" defaultValue={brand.name} />
            <input className={field} name="slug" defaultValue={brand.slug} />
            <input
              className={field}
              name="websiteUrl"
              type="url"
              defaultValue={brand.websiteUrl ?? ""}
              placeholder="Website"
            />
            <input
              className={field}
              name="logoUrl"
              type="url"
              defaultValue={brand.logoUrl ?? ""}
              placeholder="Logo URL"
            />
            <div className="md:col-span-2 md:text-right">
              <button className="rounded border border-white/15 px-3 py-2 text-xs text-white">
                Save brand
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}

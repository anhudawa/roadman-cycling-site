import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { getStaleRecommendationOffers } from "@/lib/recommends/queries";
import { checkRecommendationLinksAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function RecommendationLinkHealthPage() {
  await requireAuth();
  const offers = await getStaleRecommendationOffers();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/recommends" className="text-xs text-foreground-muted">← Recommends</Link>
          <h1 className="mt-2 text-3xl font-semibold text-white">Link health</h1>
          <p className="mt-1 text-sm text-foreground-muted">Active offers that have never been checked, are older than 30 days or have no recorded response.</p>
        </div>
        <form action={checkRecommendationLinksAction}>
          <button className="rounded-md border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5">
            Check direct destinations
          </button>
        </form>
      </header>
      <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]">
        {offers.length ? (
          <div className="divide-y divide-white/5">
            {offers.map(({ offer, productName }) => (
              <div key={offer.id} className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
                <div>
                  <strong className="text-white">{productName}</strong>
                  <p className="text-sm text-foreground-muted">{offer.retailerName} · {offer.regions.join(", ")}</p>
                  <p className="mt-1 max-w-2xl truncate font-mono text-xs text-foreground-subtle">{offer.destinationUrl}</p>
                </div>
                <div className="text-right text-xs text-foreground-muted">
                  <p>{offer.lastCheckedAt ? `Checked ${offer.lastCheckedAt.toLocaleDateString("en-IE")}` : "Never checked"}</p>
                  <p>{offer.lastHttpStatus ? `HTTP ${offer.lastHttpStatus}` : offer.lastError || "No response recorded"}</p>
                  <Link className="mt-2 inline-block text-blue-300 hover:text-blue-200" href={`/admin/recommends/products/${offer.productId}/edit`}>Edit offer →</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-10 text-center text-sm text-foreground-muted">No active offers currently need review.</p>
        )}
      </section>
      <p className="text-xs leading-relaxed text-foreground-subtle">
        Automated checks use the non-tracking product URL embedded in supported
        Impact deep links. Offers without a separate destination remain in the
        manual review queue, so Roadman never creates false affiliate clicks.
      </p>
    </div>
  );
}

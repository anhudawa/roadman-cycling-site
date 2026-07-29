import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { getAdminRecommendationOffers } from "@/lib/recommends/queries";

export const dynamic = "force-dynamic";

export default async function RecommendationOffersPage() {
  await requireAuth();
  const offers = await getAdminRecommendationOffers();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/recommends" className="text-xs text-foreground-muted">
          ← Recommends
        </Link>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          Retailers & affiliate offers
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          One view of every programme, region, price check and active
          destination. Edit an offer from its product.
        </p>
      </header>

      <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/[0.035]">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="text-xs text-foreground-subtle">
            <tr>
              <th className="px-4 py-3">Retailer</th>
              <th>Product</th>
              <th>Programme</th>
              <th>Regions</th>
              <th>Price</th>
              <th>Checked</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {offers.map(({ offer, productName }) => (
              <tr key={offer.id} className="text-foreground-muted">
                <td className="px-4 py-3 text-white">{offer.retailerName}</td>
                <td>{productName}</td>
                <td>{offer.affiliateProgram ?? "—"}</td>
                <td>{offer.regions.join(", ")}</td>
                <td>{offer.priceLabel ?? "Check price"}</td>
                <td>
                  {offer.lastCheckedAt?.toLocaleDateString("en-IE") ?? "Never"}
                </td>
                <td>{offer.active ? "Active" : "Inactive"}</td>
                <td className="pr-4 text-right">
                  <Link
                    href={`/admin/recommends/products/${offer.productId}/edit`}
                    className="text-blue-300 hover:text-blue-200"
                  >
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

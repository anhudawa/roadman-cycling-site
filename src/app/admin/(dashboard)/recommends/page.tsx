import Link from "next/link";
import { Button } from "@/components/admin/ui";
import { requireAuth } from "@/lib/admin/auth";
import {
  getRecentAffiliateConversions,
  getRecommendationDashboardStats,
} from "@/lib/recommends/queries";

export const dynamic = "force-dynamic";

function money(value: number, currency = "EUR") {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function RecommendsAdminPage() {
  await requireAuth();
  let ready = true;
  let stats = {
    products: 0,
    published: 0,
    clicks: 0,
    conversions: 0,
    pendingCommission: 0,
    approvedCommission: 0,
    currency: "EUR",
    staleOffers: 0,
  };
  let conversions: Awaited<ReturnType<typeof getRecentAffiliateConversions>> = [];
  try {
    [stats, conversions] = await Promise.all([
      getRecommendationDashboardStats(),
      getRecentAffiliateConversions(8),
    ]);
  } catch {
    ready = false;
  }
  const conversionRate = stats.clicks
    ? ((stats.conversions / stats.clicks) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">Affiliate library</p>
          <h1 className="mt-1 font-heading text-5xl text-white">ROADMAN RECOMMENDS</h1>
          <p className="mt-2 max-w-2xl text-sm text-foreground-muted">
            Publish honest buying guidance, manage regional retailer links and
            reconcile clicks with affiliate-network sales.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/recommends" target="_blank" className="rounded-md border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5">
            View library ↗
          </Link>
          <Button href="/admin/recommends/products/new">New recommendation</Button>
        </div>
      </header>

      {!ready ? (
        <section className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-5">
          <h2 className="font-semibold text-amber-100">Database setup required</h2>
          <p className="mt-1 text-sm text-amber-100/75">
            Apply migrations 0052–0054 before using the admin.
            The public library already fails safely while the tables are absent.
          </p>
        </section>
      ) : null}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Published", stats.published, `${stats.products} total products`],
          ["Outbound clicks", stats.clicks, "First-party redirect events"],
          ["Reported sales", stats.conversions, `${conversionRate}% click-to-sale`],
          ["Approved commission", money(stats.approvedCommission), `${money(stats.pendingCommission)} pending`],
        ].map(([label, value, sub]) => (
          <div key={label} className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
            <p className="text-xs text-foreground-muted">{label}</p>
            <p className="mt-2 font-mono text-3xl tabular-nums text-white">{value}</p>
            <p className="mt-1 text-xs text-foreground-subtle">{sub}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          ["/admin/recommends/products", "Products", "Draft, review, publish and order recommendations."],
          ["/admin/recommends/categories", "Categories", "Control the public information architecture."],
          ["/admin/recommends/collections", "Collections", "Build Roadman Picks, best-value and campaign edits."],
          ["/admin/recommends/brands", "Brands", "Maintain brand names, websites and visual assets."],
          ["/admin/recommends/offers", "Affiliate offers", "Review programmes, regional links and price freshness."],
          ["/admin/recommends/analytics", "Analytics", "Understand demand, sales and commission by product and retailer."],
          ["/admin/recommends/conversions", "Conversions", "Import network reports and reconcile commission."],
          ["/admin/recommends/imports", "Imports & exports", "Bulk-manage products and regional offers through CSV."],
          ["/admin/recommends/link-health", "Link health", `${stats.staleOffers} active offers need checking.`],
          ["/admin/recommends/settings", "Settings", "Edit disclosure, default region and review cadence."],
        ].map(([href, title, copy]) => (
          <Link key={href} href={href} className="rounded-lg border border-white/10 bg-white/[0.035] p-5 transition hover:border-white/25 hover:bg-white/[0.055]">
            <h2 className="font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{copy}</p>
            <span className="mt-5 block text-sm text-blue-300">Open →</span>
          </Link>
        ))}
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Recent reported conversions</h2>
            <p className="mt-1 text-xs text-foreground-muted">Sales appear only after a network API, postback or CSV reports them.</p>
          </div>
          <Link href="/admin/recommends/conversions" className="text-sm text-blue-300 hover:text-blue-200">View all →</Link>
        </div>
        {conversions.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-foreground-subtle">
                <tr><th className="py-2">Date</th><th>Product</th><th>Network</th><th>Status</th><th className="text-right">Commission</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {conversions.map(({ conversion, productName }) => (
                  <tr key={conversion.id} className="text-foreground-muted">
                    <td className="py-3">{conversion.transactionAt.toLocaleDateString("en-IE")}</td>
                    <td>{productName ?? "Unmatched"}</td>
                    <td>{conversion.network}</td>
                    <td>{conversion.status}</td>
                    <td className="text-right font-mono text-white">{money(Number(conversion.commissionAmount ?? 0), conversion.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-foreground-muted">No affiliate sales have been reported yet.</p>
        )}
      </section>
    </div>
  );
}

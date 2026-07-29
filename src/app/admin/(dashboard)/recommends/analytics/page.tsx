import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import {
  getRecommendationAnalytics,
  type RecommendationAnalytics,
} from "@/lib/recommends/analytics";

export const dynamic = "force-dynamic";

function money(value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function Breakdown({
  title,
  items,
}: {
  title: string;
  items: Array<{ name: string; clicks: number }>;
}) {
  const max = Math.max(...items.map((item) => item.clicks), 1);
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
      <h2 className="font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.slice(0, 8).map((item) => (
          <div key={item.name}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs">
              <span className="truncate text-foreground-muted">{item.name}</span>
              <span className="font-mono tabular-nums text-white">{item.clicks}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-blue-400"
                style={{ width: `${Math.max((item.clicks / max) * 100, 3)}%` }}
              />
            </div>
          </div>
        ))}
        {!items.length ? (
          <p className="py-5 text-center text-xs text-foreground-subtle">No click data yet.</p>
        ) : null}
      </div>
    </section>
  );
}

export default async function RecommendsAnalyticsPage() {
  await requireAuth();
  let analytics: RecommendationAnalytics | null = null;
  try {
    analytics = await getRecommendationAnalytics(30);
  } catch {
    // Migration may not yet be applied in this environment.
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <Link href="/admin/recommends" className="text-sm text-blue-300 hover:text-blue-200">← Recommends</Link>
        <section className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-5">
          <h1 className="text-lg font-semibold text-amber-100">Analytics will appear after database setup</h1>
          <p className="mt-1 text-sm text-amber-100/75">Apply the Recommends migration to begin recording outbound clicks and reported sales.</p>
        </section>
      </div>
    );
  }

  const clicks = analytics.dailyClicks.reduce((sum, day) => sum + day.clicks, 0);
  const conversions = analytics.products.reduce((sum, product) => sum + product.conversions, 0);
  const sales = analytics.products.reduce((sum, product) => sum + product.sales, 0);
  const commission = analytics.products.reduce((sum, product) => sum + product.commission, 0);
  const maxDailyClicks = Math.max(...analytics.dailyClicks.map((day) => day.clicks), 1);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/recommends" className="text-sm text-blue-300 hover:text-blue-200">← Recommends</Link>
          <h1 className="mt-3 font-heading text-5xl text-white">AFFILIATE ANALYTICS</h1>
          <p className="mt-2 text-sm text-foreground-muted">
            Last 30 days · {analytics.from.toLocaleDateString("en-IE")}–{analytics.to.toLocaleDateString("en-IE")}
          </p>
        </div>
        <p className="max-w-sm text-xs leading-relaxed text-foreground-subtle">
          Clicks exclude known bots. Sales are included only when a network reports a pending, approved or paid transaction.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Clicks", clicks.toLocaleString("en-IE"), "First-party redirects"],
          ["Reported sales", conversions.toLocaleString("en-IE"), clicks ? `${((conversions / clicks) * 100).toFixed(1)}% conversion rate` : "No clicks yet"],
          ["Sales value", money(sales), "Reported order value"],
          ["Commission", money(commission), "Pending + approved + paid"],
        ].map(([label, value, detail]) => (
          <div key={label} className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
            <p className="text-xs text-foreground-muted">{label}</p>
            <p className="mt-2 font-mono text-3xl tabular-nums text-white">{value}</p>
            <p className="mt-1 text-xs text-foreground-subtle">{detail}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-semibold text-white">Daily outbound clicks</h2>
          <span className="text-xs text-foreground-subtle">30-day window</span>
        </div>
        <div className="mt-6 flex h-40 items-end gap-1" aria-label="Daily outbound click chart">
          {analytics.dailyClicks.length ? analytics.dailyClicks.map((day) => (
            <div key={day.day} className="group relative flex h-full min-w-0 flex-1 items-end">
              <div
                className="w-full rounded-t-sm bg-blue-400/75 transition group-hover:bg-blue-400"
                style={{ height: `${Math.max((day.clicks / maxDailyClicks) * 100, 4)}%` }}
              />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] text-white group-hover:block">
                {day.day}: {day.clicks}
              </span>
            </div>
          )) : (
            <p className="m-auto text-sm text-foreground-subtle">No click data yet.</p>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Breakdown title="Category" items={analytics.categories} />
        <Breakdown title="Country / region" items={analytics.regions} />
        <Breakdown title="Device" items={analytics.devices} />
        <Breakdown title="Campaign" items={analytics.campaigns} />
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <h2 className="font-semibold text-white">Product performance</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs text-foreground-subtle">
              <tr>
                <th className="py-2">Product</th><th>Category</th><th className="text-right">Clicks</th>
                <th className="text-right">Sales</th><th className="text-right">Order value</th><th className="text-right">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {analytics.products.map((product) => (
                <tr key={product.id} className="text-foreground-muted">
                  <td className="py-3 pr-4 text-white">{product.name}</td>
                  <td className="pr-4">{product.category}</td>
                  <td className="text-right font-mono">{product.clicks}</td>
                  <td className="text-right font-mono">{product.conversions}</td>
                  <td className="text-right font-mono">{money(product.sales)}</td>
                  <td className="text-right font-mono text-white">{money(product.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!analytics.products.length ? (
            <p className="py-8 text-center text-sm text-foreground-subtle">No products yet.</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <h2 className="font-semibold text-white">Retailer performance</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="text-xs text-foreground-subtle">
              <tr><th className="py-2">Retailer</th><th className="text-right">Clicks</th><th className="text-right">Sales</th><th className="text-right">Order value</th><th className="text-right">Commission</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {analytics.retailers.map((retailer) => (
                <tr key={retailer.name} className="text-foreground-muted">
                  <td className="py-3 text-white">{retailer.name}</td>
                  <td className="text-right font-mono">{retailer.clicks}</td>
                  <td className="text-right font-mono">{retailer.conversions}</td>
                  <td className="text-right font-mono">{money(retailer.sales)}</td>
                  <td className="text-right font-mono text-white">{money(retailer.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!analytics.retailers.length ? (
            <p className="py-8 text-center text-sm text-foreground-subtle">No retailer activity yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

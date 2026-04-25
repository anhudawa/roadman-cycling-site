import { getStatsForRange, type PageStats } from "@/lib/admin/events-store";
import { getContentROI, type ContentROI } from "@/lib/admin/subscribers-store";
import { parseTimeRange } from "@/lib/admin/time-ranges";
import { Suspense } from "react";
import { TimeRangePicker } from "../components/TimeRangePicker";
import { Card, CardBody } from "@/components/admin/ui";

const PLACEHOLDER_DATA: PageStats[] = [
  { page: "/", views: 2103, signups: 84, conversionRate: 4.0 },
  { page: "/blog/zone-2-training-guide", views: 1284, signups: 47, conversionRate: 3.7 },
  { page: "/blog/winter-base-miles", views: 892, signups: 31, conversionRate: 3.5 },
  { page: "/blog/ftp-test-protocol", views: 756, signups: 19, conversionRate: 2.5 },
  { page: "/podcast/ep-42-nutrition", views: 623, signups: 28, conversionRate: 4.5 },
  { page: "/blog/gravel-bike-setup", views: 541, signups: 12, conversionRate: 2.2 },
  { page: "/podcast", views: 478, signups: 22, conversionRate: 4.6 },
  { page: "/blog/indoor-training-apps", views: 412, signups: 8, conversionRate: 1.9 },
];

function ConvBadge({ rate }: { rate: number }) {
  let color = "text-foreground-subtle bg-white/5";
  if (rate >= 4) color = "text-green-400 bg-green-400/10";
  else if (rate >= 2.5) color = "text-yellow-400 bg-yellow-400/10";
  else if (rate > 0) color = "text-[var(--color-bad)] bg-[var(--color-bad-tint)]";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {rate.toFixed(1)}%
    </span>
  );
}

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const rangeParam = typeof resolvedParams.range === "string" ? resolvedParams.range : "7d";
  const { from, to } = parseTimeRange(rangeParam);

  let pages: PageStats[];
  let usingLiveData = false;

  try {
    const rangedStats = await getStatsForRange(from, to);
    pages = rangedStats.pages;
    usingLiveData = true;
  } catch {
    // Database not provisioned yet $€” use placeholder data
    pages = PLACEHOLDER_DATA;
  }

  let contentROI: ContentROI[] = [];
  try {
    contentROI = await getContentROI();
  } catch {
    // DB not available
  }

  // Merge ROI data into pages
  const roiMap = new Map(contentROI.map((r) => [r.sourcePage, r]));

  const totalViews = pages.reduce((s, p) => s + p.views, 0);
  const avgConvRate =
    pages.length > 0
      ? pages.reduce((s, p) => s + p.conversionRate, 0) / pages.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-off-white tracking-wider">
            CONTENT PERFORMANCE
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            {usingLiveData
              ? "Page-level views, signups, and conversion rates"
              : "Demo data \u2014 database not connected yet"}
          </p>
        </div>
        <Suspense fallback={null}>
          <TimeRangePicker />
        </Suspense>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardBody compact>
            <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
              Pages Tracked
            </p>
            <p className="text-2xl font-heading text-off-white tracking-wide">
              {pages.length}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody compact>
            <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
              Total Views
            </p>
            <p className="text-2xl font-heading text-off-white tracking-wide">
              {totalViews.toLocaleString()}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody compact>
            <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
              Avg Conv. Rate
            </p>
            <p className="text-2xl font-heading text-off-white tracking-wide">
              {avgConvRate.toFixed(1)}%
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Content ROI highlights */}
      {contentROI.length > 0 && (
        <Card>
          <CardBody compact>
            <h2 className="font-body font-semibold text-[13px] text-[var(--color-fg)] mb-3">
              Content ROI
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {contentROI[0] && (
              <div>
                <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">Best Converter</p>
                <p className="text-off-white">{contentROI[0].sourcePage}</p>
                <p className="text-foreground-muted text-xs">{contentROI[0].paidConversions} paid from {contentROI[0].signups} signups</p>
              </div>
            )}
            {(() => {
              const worst = [...pages].filter(p => p.views > 100).sort((a, b) => a.conversionRate - b.conversionRate)[0];
              return worst ? (
                <div>
                  <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">Needs Attention</p>
                  <p className="text-off-white">{worst.page}</p>
                  <p className="text-foreground-muted text-xs">{worst.views} views, {worst.conversionRate.toFixed(1)}% conv rate</p>
                </div>
              ) : null;
            })()}
          </div>
          </CardBody>
        </Card>
      )}

      {/* Content table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Page
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Views
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Signups
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Conv Rate
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Paid
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {[...pages].sort((a, b) => b.views - a.views).map((row) => (
                <tr
                  key={row.page}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm text-off-white font-medium">
                      {row.page}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-off-white tabular-nums">
                    {row.views.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-off-white tabular-nums">
                    {row.signups}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ConvBadge rate={row.conversionRate} />
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-foreground-muted tabular-nums">
                    {roiMap.get(row.page)?.paidConversions ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-off-white tabular-nums font-medium">
                    {roiMap.get(row.page)?.revenue
                      ? `$${(roiMap.get(row.page)!.revenue / 100).toLocaleString()}`
                      : "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

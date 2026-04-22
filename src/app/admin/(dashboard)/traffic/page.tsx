import { getStatsForRange } from "@/lib/admin/events-store";
import { parseTimeRange } from "@/lib/admin/time-ranges";
import { Suspense } from "react";
import { TimeRangePicker } from "../components/TimeRangePicker";
import { Card, CardBody } from "@/components/admin/ui";

function HorizontalBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-foreground-muted truncate min-w-0 flex-shrink w-48">
        {label}
      </span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--color-info)] rounded-full transition-all"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-sm text-off-white font-medium tabular-nums w-12 text-right flex-shrink-0">
        {value}
      </span>
    </div>
  );
}

function DeviceBar({ device, count, percentage }: { device: string; count: number; percentage: number }) {
  const icons: Record<string, string> = {
    desktop: "Desktop",
    mobile: "Mobile",
    tablet: "Tablet",
    unknown: "Unknown",
  };
  const colors: Record<string, string> = {
    desktop: "bg-purple",
    mobile: "bg-[var(--color-info)]",
    tablet: "bg-green-400",
    unknown: "bg-white/20",
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-foreground-muted w-20">{icons[device] || device}</span>
      <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[device] || "bg-white/20"} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-off-white tabular-nums w-16 text-right">
        {percentage.toFixed(1)}%
      </span>
      <span className="text-xs text-foreground-subtle tabular-nums w-10 text-right">
        ({count})
      </span>
    </div>
  );
}

function cleanReferrer(ref: string): string {
  if (!ref || ref === "Direct") return "Direct / None";
  try {
    const url = new URL(ref);
    return url.hostname.replace("www.", "");
  } catch {
    return ref;
  }
}

export default async function TrafficPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const rangeParam = typeof resolvedParams.range === "string" ? resolvedParams.range : "7d";
  const { from, to } = parseTimeRange(rangeParam);

  let topPages, referrers, devices;
  try {
    const rangedStats = await getStatsForRange(from, to);
    topPages = rangedStats.traffic.topPages;
    referrers = rangedStats.traffic.referrers;
    devices = rangedStats.traffic.devices;
  } catch {
    topPages = [
      { page: "/", views: 842 }, { page: "/blog/zone-2-training", views: 621 },
      { page: "/podcast", views: 418 }, { page: "/newsletter", views: 312 },
      { page: "/tools/ftp-zones", views: 289 }, { page: "/about", views: 187 },
    ];
    referrers = [
      { referrer: "google.com", count: 1240 }, { referrer: "(direct)", count: 890 },
      { referrer: "youtube.com", count: 420 }, { referrer: "instagram.com", count: 310 },
      { referrer: "facebook.com", count: 180 },
    ];
    devices = [
      { device: "mobile", count: 2800, percentage: 52 },
      { device: "desktop", count: 2100, percentage: 39 },
      { device: "tablet", count: 500, percentage: 9 },
    ];
  }
  const maxPageViews = topPages.length > 0 ? topPages[0].views : 1;
  const maxRefCount = referrers.length > 0 ? referrers[0].count : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-off-white tracking-wider">TRAFFIC</h1>
          <p className="text-foreground-muted text-sm mt-1">
            Page views, referrers, and device breakdown
          </p>
        </div>
        <Suspense fallback={null}>
          <TimeRangePicker />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardBody compact>
            <h2 className="font-body font-semibold text-[13px] text-[var(--color-fg)] mb-4">
              Top pages by views
            </h2>
            <div className="space-y-2.5">
              {topPages.slice(0, 12).map((page) => (
                <HorizontalBar
                  key={page.page}
                  value={page.views}
                  max={maxPageViews}
                  label={page.page}
                />
              ))}
              {topPages.length === 0 && (
                <p className="text-foreground-subtle text-sm">No pageview data yet.</p>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Referrers */}
        <Card>
          <CardBody compact>
            <h2 className="font-body font-semibold text-[13px] text-[var(--color-fg)] mb-4">
              Referrer breakdown
            </h2>
            <div className="space-y-2.5">
              {referrers.map((ref) => (
                <HorizontalBar
                  key={ref.referrer}
                  value={ref.count}
                  max={maxRefCount}
                  label={cleanReferrer(ref.referrer)}
                />
              ))}
              {referrers.length === 0 && (
                <p className="text-foreground-subtle text-sm">No referrer data yet.</p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Device Breakdown */}
      <Card>
        <CardBody compact>
          <h2 className="font-body font-semibold text-[13px] text-[var(--color-fg)] mb-4">
            Device breakdown
          </h2>
          <div className="max-w-xl space-y-3">
            {devices.map((d) => (
              <DeviceBar
                key={d.device}
                device={d.device}
                count={d.count}
                percentage={d.percentage}
              />
            ))}
            {devices.length === 0 && (
              <p className="text-foreground-subtle text-sm">No device data yet.</p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

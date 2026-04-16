import {
  fetchSubscriberStats,
  fetchNewsletterPosts,
  fetchSubscriberGrowth,
  type NewsletterPost,
  type SubscriberStats,
  type DailyGrowth,
} from "@/lib/integrations/beehiiv";
import { TimeSeriesChart } from "../components/charts/TimeSeriesChart";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function NewsletterPage() {
  let subscriberStats: SubscriberStats | null = null;
  let posts: NewsletterPost[] = [];
  let growth: DailyGrowth[] = [];
  let apiError = false;

  try {
    [subscriberStats, posts, growth] = await Promise.all([
      fetchSubscriberStats(),
      fetchNewsletterPosts(20),
      fetchSubscriberGrowth(30),
    ]);
  } catch {
    apiError = true;
  }

  // Compute open/click rates across sent posts.
  // Send-weighted (total opens / total recipients) so a tiny re-send doesn't
  // distort the top-line number; fall back to arithmetic mean of Beehiiv's
  // per-post rates when recipient counts aren't available.
  const sentPosts = posts.filter(
    (p) => p.sentAt !== null && (p.stats.recipients > 0 || p.stats.openRate > 0)
  );
  const totalRecipients = sentPosts.reduce((s, p) => s + p.stats.recipients, 0);
  const totalOpens = sentPosts.reduce((s, p) => s + p.stats.opens, 0);
  const totalClicks = sentPosts.reduce((s, p) => s + p.stats.clicks, 0);
  const avgOpenRate =
    totalRecipients > 0
      ? totalOpens / totalRecipients
      : sentPosts.length > 0
        ? sentPosts.reduce((sum, p) => sum + p.stats.openRate, 0) / sentPosts.length
        : 0;
  const avgClickRate =
    totalRecipients > 0
      ? totalClicks / totalRecipients
      : sentPosts.length > 0
        ? sentPosts.reduce((sum, p) => sum + p.stats.clickRate, 0) / sentPosts.length
        : 0;

  const hasData = subscriberStats !== null || posts.length > 0;

  // Prepare growth chart data
  const growthChartData = growth.map((g) => ({
    date: g.date,
    subscribers: g.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider">
          NEWSLETTER ANALYTICS
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          {apiError
            ? "Beehiiv API not configured \u2014 add BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID to .env.local"
            : "Data syncs from Beehiiv (cached 5 min)"}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
            Total Subscribers
          </p>
          <p className="text-2xl font-heading text-off-white tracking-wide">
            {subscriberStats
              ? subscriberStats.totalSubscribers.toLocaleString()
              : "--"}
          </p>
          {subscriberStats && (
            <p className="text-xs text-foreground-subtle mt-1">
              {subscriberStats.activeSubscribers.toLocaleString()} active
            </p>
          )}
          {!subscriberStats && !apiError && (
            <p className="text-xs text-foreground-subtle mt-1">
              No data returned from Beehiiv
            </p>
          )}
        </div>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
            Open Rate (Avg)
          </p>
          <p className="text-2xl font-heading text-off-white tracking-wide">
            {hasData ? `${(avgOpenRate * 100).toFixed(1)}%` : "--%"}
          </p>
          <p className="text-xs text-foreground-subtle mt-1">
            {sentPosts.length > 0
              ? `Across ${sentPosts.length} recent sends`
              : "Last 30 days"}
          </p>
        </div>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
            Click Rate (Avg)
          </p>
          <p className="text-2xl font-heading text-off-white tracking-wide">
            {hasData ? `${(avgClickRate * 100).toFixed(1)}%` : "--%"}
          </p>
          <p className="text-xs text-foreground-subtle mt-1">
            {sentPosts.length > 0
              ? `Across ${sentPosts.length} recent sends`
              : "Last 30 days"}
          </p>
        </div>
      </div>

      {/* Growth trend */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
          SUBSCRIBER GROWTH (30 DAYS)
        </h2>
        {growthChartData.length > 1 ? (
          <TimeSeriesChart
            data={growthChartData}
            dataKeys={[
              { key: "subscribers", color: "#E8836B", label: "New Subscribers" },
            ]}
            height={256}
          />
        ) : (
          <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
            <p className="text-foreground-subtle text-sm">
              {apiError
                ? "Connect Beehiiv API to see subscriber growth"
                : "Not enough data points for growth chart yet"}
            </p>
          </div>
        )}
      </div>

      {/* Recent sends table */}
      <div className="bg-background-elevated border border-white/5 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <h2 className="font-heading text-sm text-foreground-muted tracking-wider">
            RECENT SENDS{sentPosts.length > 0 ? ` (${sentPosts.length})` : ""}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Subject
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Sent
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Opens
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Clicks
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Open Rate
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Click Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {sentPosts.length > 0 ? (
                sentPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-off-white max-w-xs truncate">
                      {post.subject || post.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-muted text-right tabular-nums whitespace-nowrap">
                      {post.sentAt ? formatDate(post.sentAt) : "--"}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-muted text-right tabular-nums">
                      {post.stats.opens.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-muted text-right tabular-nums">
                      {post.stats.clicks.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          post.stats.openRate >= 0.4
                            ? "text-green-400 bg-green-400/10"
                            : post.stats.openRate >= 0.2
                              ? "text-yellow-400 bg-yellow-400/10"
                              : "text-coral bg-coral/10"
                        }`}
                      >
                        {(post.stats.openRate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          post.stats.clickRate >= 0.04
                            ? "text-green-400 bg-green-400/10"
                            : post.stats.clickRate >= 0.02
                              ? "text-yellow-400 bg-yellow-400/10"
                              : "text-coral bg-coral/10"
                        }`}
                      >
                        {(post.stats.clickRate * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-foreground-subtle text-sm"
                  >
                    {apiError
                      ? "Connect Beehiiv API to sync send history."
                      : "No newsletter sends found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

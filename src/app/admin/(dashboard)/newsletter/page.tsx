export default async function NewsletterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider">
          NEWSLETTER ANALYTICS
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Data syncs daily from Beehiiv
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
            Total Subscribers
          </p>
          <p className="text-2xl font-heading text-off-white tracking-wide">--</p>
          <p className="text-xs text-foreground-subtle mt-1">
            Connect Beehiiv to populate
          </p>
        </div>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
            Open Rate (Avg)
          </p>
          <p className="text-2xl font-heading text-off-white tracking-wide">--%</p>
          <p className="text-xs text-foreground-subtle mt-1">
            Last 30 days
          </p>
        </div>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
            Click Rate (Avg)
          </p>
          <p className="text-2xl font-heading text-off-white tracking-wide">--%</p>
          <p className="text-xs text-foreground-subtle mt-1">
            Last 30 days
          </p>
        </div>
      </div>

      {/* Growth trend placeholder */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
          SUBSCRIBER GROWTH
        </h2>
        <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
          <p className="text-foreground-subtle text-sm">
            Growth chart will appear once Beehiiv is connected
          </p>
        </div>
      </div>

      {/* Recent sends table */}
      <div className="bg-background-elevated border border-white/5 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <h2 className="font-heading text-sm text-foreground-muted tracking-wider">
            RECENT SENDS
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
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground-subtle text-sm">
                  No newsletter data yet. Connect Beehiiv API to sync send history.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import {
  getSignupWindowTotals,
  getSignupsByWindow,
  type SignupBySourceRow,
} from "@/lib/admin/subscribers-store";
import { Card, CardBody } from "@/components/admin/ui";

/**
 * Email Signups — the at-a-glance section on /admin.
 *
 * Three time windows: last 24h / 7d / 30d. Each card shows the headline
 * total and the source breakdown so Anthony can see which surfaces
 * (Plateau Diagnostic, Lead Magnets, Saturday Spin, Wrapped, etc.) are
 * actually driving signups today vs. over the month.
 *
 * Counts come from the `subscribers` table — every /api/* endpoint that
 * captures an email calls `upsertOnSignup`, so this is the unified view
 * across diagnostic, lead-magnets, newsletter, wrapped, and any future
 * capture surface. Beehiiv's own subscriber total (which includes leads
 * from their hosted forms) lives on /admin/newsletter.
 */

interface SourceBucket {
  label: string;
  /** Matches the bucket if any of these strings is contained in the
   * raw `source` value stored in subscribers.source. */
  match: (raw: string) => boolean;
}

// Buckets are evaluated in order — first match wins. Keep "other" last
// (it has no match — it's the fallthrough rendered for anything that
// didn't bucket).
const BUCKETS: SourceBucket[] = [
  {
    label: "Plateau Diagnostic",
    match: (s) => s === "plateau-diagnostic" || s === "/plateau",
  },
  {
    label: "Zones plan",
    match: (s) => s.startsWith("lead-magnet-zones-plan") || s === "zones-plan",
  },
  {
    label: "Event plan",
    match: (s) => s.startsWith("lead-magnet-event-plan") || s === "event-plan",
  },
  {
    label: "Masters checklist",
    match: (s) =>
      s.startsWith("lead-magnet-masters-checklist") || s === "masters-checklist",
  },
  {
    label: "Fuelling guide",
    match: (s) =>
      s.startsWith("lead-magnet-fuelling-guide") || s === "fuelling-guide",
  },
  {
    label: "Gym plan (2-day)",
    match: (s) =>
      s.startsWith("lead-magnet-strength-2day") || s === "strength-2day",
  },
  {
    label: "Episode playlist",
    match: (s) =>
      s.startsWith("lead-magnet-episode-playlist") || s === "episode-playlist",
  },
  {
    label: "Other lead magnet",
    match: (s) => s.startsWith("lead-magnet-"),
  },
  {
    label: "Saturday Spin (newsletter page)",
    match: (s) => s === "/newsletter" || s === "newsletter",
  },
  {
    label: "Wrapped",
    match: (s) => s === "wrapped" || s === "/wrapped",
  },
  {
    label: "Footer subscribe",
    match: (s) => s === "footer" || s === "site-footer",
  },
  {
    label: "Blog / article CTA",
    match: (s) => s.startsWith("/blog") || s.startsWith("blog-"),
  },
  {
    label: "Podcast page",
    match: (s) => s.startsWith("/podcast") || s.startsWith("podcast-"),
  },
];

function bucketLabel(raw: string): string {
  for (const b of BUCKETS) {
    if (b.match(raw)) return b.label;
  }
  // Path-like sources (e.g. "/some-page") that didn't match — surface
  // the path so Anthony can see which page sent the signup.
  if (raw.startsWith("/")) return raw;
  if (raw === "unknown") return "Unknown source";
  return raw;
}

interface AggregatedSource {
  label: string;
  signups: number;
}

function aggregateBuckets(rows: SignupBySourceRow[]): AggregatedSource[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const label = bucketLabel(r.source);
    map.set(label, (map.get(label) ?? 0) + r.signups);
  }
  return [...map.entries()]
    .map(([label, signups]) => ({ label, signups }))
    .sort((a, b) => b.signups - a.signups);
}

interface WindowCardProps {
  title: string;
  subtitle: string;
  total: number;
  sources: AggregatedSource[];
}

function WindowCard({ title, subtitle, total, sources }: WindowCardProps) {
  // Show top 6 in the breakdown so each card stays scannable; fold the
  // rest into "Other sources" so the total still ties out.
  const TOP = 6;
  const shown = sources.slice(0, TOP);
  const overflow = sources.slice(TOP);
  const overflowTotal = overflow.reduce((s, r) => s + r.signups, 0);
  const display = overflowTotal > 0
    ? [...shown, { label: "Other sources", signups: overflowTotal }]
    : shown;

  return (
    <Card>
      <CardBody compact>
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)] font-medium">
            {title}
          </p>
          <p className="text-[10px] text-[var(--color-fg-subtle)]">{subtitle}</p>
        </div>
        <p className="font-display text-5xl text-[var(--color-fg)] tracking-tight font-mono tabular-nums">
          {total.toLocaleString()}
        </p>
        <p className="text-[11px] text-[var(--color-fg-muted)] mt-1">
          {total === 1 ? "new email signup" : "new email signups"}
        </p>

        {display.length > 0 ? (
          <ul className="mt-5 space-y-1.5 pt-4 border-t border-[var(--color-border)]">
            {display.map((row) => {
              const pct = total > 0 ? (row.signups / total) * 100 : 0;
              return (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-3 text-[12px]"
                >
                  <span className="text-[var(--color-fg-muted)] truncate" title={row.label}>
                    {row.label}
                  </span>
                  <span className="flex items-baseline gap-2 shrink-0">
                    <span className="font-mono tabular-nums text-[var(--color-fg)] font-medium">
                      {row.signups.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[var(--color-fg-subtle)] font-mono tabular-nums w-10 text-right">
                      {pct.toFixed(0)}%
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-5 pt-4 border-t border-[var(--color-border)] text-[12px] text-[var(--color-fg-subtle)] italic">
            No signups in this window yet.
          </p>
        )}
      </CardBody>
    </Card>
  );
}

export async function EmailSignupsSection() {
  // Three independent queries — keep them on Promise.all so the section
  // doesn't serialise. If the DB isn't reachable we render a single
  // sentinel card rather than blowing up the whole dashboard.
  let totals: { last24h: number; last7d: number; last30d: number };
  let by24h: SignupBySourceRow[] = [];
  let by7d: SignupBySourceRow[] = [];
  let by30d: SignupBySourceRow[] = [];

  try {
    const now = new Date();
    const [t, w24, w7, w30] = await Promise.all([
      getSignupWindowTotals(now),
      getSignupsByWindow(24, now),
      getSignupsByWindow(24 * 7, now),
      getSignupsByWindow(24 * 30, now),
    ]);
    totals = t;
    by24h = w24.sources;
    by7d = w7.sources;
    by30d = w30.sources;
  } catch (err) {
    console.error("[admin] Email signups section query failed:", err);
    return (
      <section aria-labelledby="email-signups-heading">
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h2
            id="email-signups-heading"
            className="font-body font-semibold text-[13px] text-[var(--color-fg)]"
          >
            Email signups
          </h2>
          <p className="text-[11px] text-[var(--color-fg-subtle)]">
            All sources via subscribers table
          </p>
        </div>
        <Card>
          <CardBody compact>
            <p className="text-[var(--color-fg-muted)] text-sm">
              Couldn&apos;t load signup data — the subscribers table may not be reachable.
            </p>
          </CardBody>
        </Card>
      </section>
    );
  }

  return (
    <section aria-labelledby="email-signups-heading">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2
          id="email-signups-heading"
          className="font-body font-semibold text-[13px] text-[var(--color-fg)]"
        >
          Email signups
        </h2>
        <p className="text-[11px] text-[var(--color-fg-subtle)]">
          All site sources · diagnostic, lead magnets, newsletter, wrapped
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WindowCard
          title="Last 24 hours"
          subtitle="Today"
          total={totals.last24h}
          sources={aggregateBuckets(by24h)}
        />
        <WindowCard
          title="Last 7 days"
          subtitle="Past week"
          total={totals.last7d}
          sources={aggregateBuckets(by7d)}
        />
        <WindowCard
          title="Last 30 days"
          subtitle="Past month"
          total={totals.last30d}
          sources={aggregateBuckets(by30d)}
        />
      </div>
    </section>
  );
}

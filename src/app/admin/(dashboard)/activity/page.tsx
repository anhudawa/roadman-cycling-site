import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import {
  ALL_ACTIVITY_TYPES,
  listActivityFeed,
  listDistinctAuthors,
  type ActivityFeedRow,
} from "@/lib/crm/activity-feed";
import type { ActivityType } from "@/lib/crm/contacts";
import { ActivityFilters } from "./_components/ActivityFilters";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const TYPE_STYLE: Record<string, string> = {
  note: "bg-[var(--color-bad-tint)] text-[var(--color-bad)] border-[var(--color-border-strong)]",
  email_sent: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  email_opened: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  email_clicked: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  stage_change: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  file_uploaded: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  file_removed: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  contact_merged: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  task_created: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  task_completed: "bg-slate-500/10 text-slate-300 border-slate-500/20",
};

function badgeClass(type: string): string {
  return TYPE_STYLE[type] ?? "bg-white/5 text-foreground-muted border-white/10";
}

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dayLabel(key: string): string {
  const today = new Date();
  const t = dayKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const y = dayKey(yesterday);
  if (key === t) return "Today";
  if (key === y) return "Yesterday";
  return new Date(key).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function clip(s: string | null, n = 200): string {
  if (!s) return "";
  if (s.length <= n) return s;
  return s.slice(0, n).trimEnd() + "…";
}

function firstString(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

function allStrings(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAuth();
  const sp = await searchParams;

  const typesRaw = allStrings(sp.type);
  const types = typesRaw.filter((t): t is ActivityType =>
    (ALL_ACTIVITY_TYPES as string[]).includes(t)
  );
  const author = firstString(sp.author);
  const search = firstString(sp.search);
  const after = firstString(sp.after);
  const before = firstString(sp.before);
  const offset = Math.max(parseInt(firstString(sp.offset) || "0", 10) || 0, 0);

  const afterDate = after ? new Date(after) : undefined;
  const beforeDate = before ? new Date(before + "T23:59:59.999Z") : undefined;

  const [{ rows, total }, authors] = await Promise.all([
    listActivityFeed(
      {
        types: types.length > 0 ? types : undefined,
        authorSlug: author || undefined,
        search: search || undefined,
        after: afterDate && !isNaN(afterDate.getTime()) ? afterDate : undefined,
        before: beforeDate && !isNaN(beforeDate.getTime()) ? beforeDate : undefined,
      },
      { limit: PAGE_SIZE, offset }
    ),
    listDistinctAuthors(),
  ]);

  // Group by day
  const groups = new Map<string, ActivityFeedRow[]>();
  for (const r of rows) {
    const key = dayKey(new Date(r.createdAt));
    const arr = groups.get(key) ?? [];
    arr.push(r);
    groups.set(key, arr);
  }

  // Build pagination URLs preserving filters
  function buildPageUrl(newOffset: number): string {
    const params = new URLSearchParams();
    for (const t of types) params.append("type", t);
    if (author) params.set("author", author);
    if (search) params.set("search", search);
    if (after) params.set("after", after);
    if (before) params.set("before", before);
    if (newOffset > 0) params.set("offset", String(newOffset));
    const qs = params.toString();
    return qs ? `/admin/activity?${qs}` : "/admin/activity";
  }

  const showingFrom = total === 0 ? 0 : offset + 1;
  const showingTo = Math.min(offset + rows.length, total);
  const hasPrev = offset > 0;
  const hasNext = offset + PAGE_SIZE < total;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl text-off-white tracking-wider uppercase">
          Activity
        </h1>
        <p className="text-sm text-foreground-muted mt-1">
          Firehose of every CRM event across all contacts.
        </p>
      </div>

      <div className="bg-background-elevated border border-white/5 rounded-lg p-4 mb-4">
        <ActivityFilters
          initialTypes={types}
          initialAuthor={author}
          initialSearch={search}
          initialAfter={after}
          initialBefore={before}
          authors={authors}
          currentUserSlug={user.slug}
        />
      </div>

      <div className="bg-background-elevated border border-white/5 rounded-lg overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-foreground-muted">
            No activity matches these filters.
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {Array.from(groups.entries()).map(([key, items]) => (
              <li key={key}>
                <div className="px-4 py-2 bg-white/[0.02] border-b border-white/5 text-[10px] uppercase tracking-widest text-foreground-subtle">
                  {dayLabel(key)}
                </div>
                <ul className="divide-y divide-white/5">
                  {items.map((r) => {
                    const created = new Date(r.createdAt);
                    const meta = (r.meta ?? {}) as Record<string, unknown>;
                    const toStage =
                      r.type === "stage_change" && typeof meta.toStage === "string"
                        ? (meta.toStage as string)
                        : null;
                    return (
                      <li key={r.id} className="px-4 py-3 hover:bg-white/[0.02]">
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 w-20 text-[11px] text-foreground-subtle pt-0.5">
                            {formatTimeAgo(created)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span
                                className={`px-1.5 py-0.5 rounded border text-[10px] ${badgeClass(
                                  r.type
                                )}`}
                              >
                                {r.type}
                              </span>
                              <span className="text-foreground-muted">
                                {r.authorName ?? r.authorSlug ?? "system"}
                              </span>
                              <span className="text-foreground-subtle">·</span>
                              <Link
                                href={`/admin/contacts/${r.contactId}`}
                                className="text-off-white hover:text-[var(--color-fg)] truncate"
                              >
                                {r.contactName ?? r.contactEmail}
                              </Link>
                              {toStage && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px]">
                                  → {toStage}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-off-white mt-1">{r.title}</p>
                            {r.body && (
                              <p className="text-xs text-foreground-muted mt-0.5 whitespace-pre-wrap">
                                {clip(r.body, 200)}
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-foreground-muted">
        <span>
          Showing {showingFrom}–{showingTo} of {total}
        </span>
        <div className="flex items-center gap-2">
          {hasPrev ? (
            <Link
              href={buildPageUrl(Math.max(offset - PAGE_SIZE, 0))}
              className="px-3 py-1.5 rounded border border-white/10 hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)]"
            >
              ← Prev
            </Link>
          ) : (
            <span className="px-3 py-1.5 rounded border border-white/5 text-foreground-subtle/50">
              ← Prev
            </span>
          )}
          {hasNext ? (
            <Link
              href={buildPageUrl(offset + PAGE_SIZE)}
              className="px-3 py-1.5 rounded border border-white/10 hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)]"
            >
              Next →
            </Link>
          ) : (
            <span className="px-3 py-1.5 rounded border border-white/5 text-foreground-subtle/50">
              Next →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

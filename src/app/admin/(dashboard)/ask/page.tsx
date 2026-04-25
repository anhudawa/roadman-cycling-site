import { desc, eq, sql, and, gte } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { askMessages, askSessions } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

interface SearchParams {
  filter?: "all" | "flagged";
}

export default async function AdminAskPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAuth();
  const { filter: rawFilter } = await searchParams;
  const filter: "all" | "flagged" = rawFilter === "flagged" ? "flagged" : "all";

  const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalSessionsRow,
    totalMessagesRow,
    flaggedCountRow,
    safetyFlagCountRow,
    recentMessages,
  ] = await Promise.all([
    db
      .select({ cnt: sql<number>`count(*)` })
      .from(askSessions)
      .where(gte(askSessions.startedAt, last7d)),
    db
      .select({ cnt: sql<number>`count(*)` })
      .from(askMessages)
      .where(and(eq(askMessages.role, "assistant"), gte(askMessages.createdAt, last7d))),
    db
      .select({ cnt: sql<number>`count(*)` })
      .from(askMessages)
      .where(and(eq(askMessages.flaggedForReview, true), gte(askMessages.createdAt, last7d))),
    db
      .select({ cnt: sql<number>`count(*)` })
      .from(askMessages)
      .where(
        and(
          sql`array_length(${askMessages.safetyFlags}, 1) > 0`,
          gte(askMessages.createdAt, last7d),
        ),
      ),
    db
      .select()
      .from(askMessages)
      .where(
        filter === "flagged"
          ? eq(askMessages.flaggedForReview, true)
          : eq(askMessages.role, "assistant"),
      )
      .orderBy(desc(askMessages.createdAt))
      .limit(40),
  ]);

  const totalSessions = Number(totalSessionsRow[0]?.cnt ?? 0);
  const totalMessages = Number(totalMessagesRow[0]?.cnt ?? 0);
  const flaggedCount = Number(flaggedCountRow[0]?.cnt ?? 0);
  const safetyFlagCount = Number(safetyFlagCountRow[0]?.cnt ?? 0);

  return (
    <div className="px-6 py-6 max-w-[1200px]">
      <h1 className="font-heading text-2xl text-off-white mb-1">Ask Roadman</h1>
      <p className="text-foreground-muted text-sm mb-6">
        Review queue, safety flags, and recent assistant messages.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Sessions (7d)" value={totalSessions} />
        <StatCard label="Assistant messages (7d)" value={totalMessages} />
        <StatCard label="Flagged for review (7d)" value={flaggedCount} tone="warning" />
        <StatCard label="Safety templates (7d)" value={safetyFlagCount} tone="info" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 text-sm">
        <TabLink href="/admin/ask?filter=all" active={filter === "all"}>
          All assistant messages
        </TabLink>
        <TabLink href="/admin/ask?filter=flagged" active={filter === "flagged"}>
          Flagged only
        </TabLink>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04] text-foreground-muted">
            <tr>
              <th className="text-left font-heading tracking-widest uppercase text-xs p-3">
                When
              </th>
              <th className="text-left font-heading tracking-widest uppercase text-xs p-3">
                Flags
              </th>
              <th className="text-left font-heading tracking-widest uppercase text-xs p-3">
                Preview
              </th>
              <th className="text-left font-heading tracking-widest uppercase text-xs p-3">
                CTA
              </th>
              <th className="text-left font-heading tracking-widest uppercase text-xs p-3">
                Model
              </th>
            </tr>
          </thead>
          <tbody>
            {recentMessages.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-foreground-subtle">
                  No messages yet.
                </td>
              </tr>
            )}
            {recentMessages.map((m) => (
              <tr key={m.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="p-3 text-foreground-muted whitespace-nowrap">
                  {new Date(m.createdAt).toLocaleString()}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {m.flaggedForReview && (
                      <span className="rounded bg-amber-500/15 text-amber-200 text-[10px] px-1.5 py-0.5 uppercase tracking-widest font-heading">
                        flagged
                      </span>
                    )}
                    {(m.safetyFlags ?? []).map((f) => (
                      <span
                        key={f}
                        className="rounded bg-red-500/15 text-red-200 text-[10px] px-1.5 py-0.5 uppercase tracking-widest font-heading"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-off-white max-w-[520px]">
                  <p className="line-clamp-3 leading-relaxed">{m.content}</p>
                </td>
                <td className="p-3 text-foreground-muted whitespace-nowrap text-xs">
                  {m.ctaRecommended ?? "$€”"}
                </td>
                <td className="p-3 text-foreground-subtle whitespace-nowrap text-xs">
                  {m.model ?? "$€”"}
                  {m.latencyMs != null && (
                    <div className="text-[10px] text-foreground-subtle/80">
                      {m.latencyMs}ms
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "warning" | "info";
}) {
  const toneClass =
    tone === "warning"
      ? "text-amber-300"
      : tone === "info"
        ? "text-blue-400"
        : "text-off-white";
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <p className="text-foreground-muted text-xs uppercase tracking-widest font-heading mb-1">
        {label}
      </p>
      <p className={`font-heading text-2xl ${toneClass}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={`px-3 py-1.5 rounded-md border transition-colors ${active ? "border-white/30 bg-white/10 text-off-white" : "border-white/10 text-foreground-muted hover:border-white/25 hover:text-off-white"}`}
    >
      {children}
    </a>
  );
}

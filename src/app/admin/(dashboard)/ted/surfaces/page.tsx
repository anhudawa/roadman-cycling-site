import { db } from "@/lib/db";
import { tedSurfaceDrafts } from "@/lib/db/schema";
import { desc, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { safeQuery, anyNeedsMigration } from "@/lib/ted/safe-db";
import { SurfaceReviewTable } from "./_components/SurfaceReviewTable";
import { MigrationBanner } from "../_components/MigrationBanner";

export const dynamic = "force-dynamic";

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  drafted: { label: "drafted", cls: "bg-blue-500/10 text-blue-300" },
  voice_flagged: { label: "voice-flagged", cls: "bg-yellow-500/10 text-yellow-300" },
  approved: { label: "approved", cls: "bg-emerald-500/10 text-emerald-300" },
  edited: { label: "edited", cls: "bg-emerald-500/10 text-emerald-300" },
  posted: { label: "posted", cls: "bg-emerald-500/15 text-emerald-200" },
  rejected: { label: "rejected", cls: "bg-white/10 text-foreground-subtle" },
  failed: { label: "failed", cls: "bg-[var(--color-bad-tint)] text-[var(--color-bad)]" },
};

function statusPill(s: string): { label: string; cls: string } {
  return STATUS_PILL[s] ?? { label: s, cls: "bg-white/10 text-foreground-subtle" };
}

export default async function TedSurfacesPage() {
  await requireAuth();

  const needReviewR = await safeQuery(
    () =>
      db
        .select()
        .from(tedSurfaceDrafts)
        .where(inArray(tedSurfaceDrafts.status, ["drafted", "voice_flagged"]))
        .orderBy(desc(tedSurfaceDrafts.createdAt))
        .limit(50),
    [] as Array<typeof tedSurfaceDrafts.$inferSelect>
  );

  const recentR = await safeQuery(
    () =>
      db
        .select()
        .from(tedSurfaceDrafts)
        .where(
          inArray(tedSurfaceDrafts.status, ["approved", "edited", "posted", "rejected", "failed"])
        )
        .orderBy(desc(tedSurfaceDrafts.createdAt))
        .limit(50),
    [] as Array<typeof tedSurfaceDrafts.$inferSelect>
  );

  const needReview = needReviewR.data;
  const recent = recentR.data;
  const migrationsNeeded = anyNeedsMigration([needReviewR, recentR]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Ted $€” thread surfaces</h1>
        <p className="text-sm text-foreground-subtle">
          Surface replies don&apos;t publish until you approve each one. Ted
          scans daily, drafts candidate replies (tag / link / summary), and
          lands them here.
        </p>
      </div>

      {migrationsNeeded ? <MigrationBanner /> : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
          Needs review ({needReview.length})
        </h2>
        <SurfaceReviewTable
          rows={needReview.map((r) => ({
            id: r.id,
            skoolPostId: r.skoolPostId,
            threadUrl: r.threadUrl,
            threadAuthor: r.threadAuthor,
            threadTitle: r.threadTitle,
            threadBody: r.threadBody,
            surfaceType: r.surfaceType,
            originalBody: r.originalBody,
            editedBody: r.editedBody,
            status: r.status,
            voiceCheck: r.voiceCheck,
            createdAt: r.createdAt.toISOString(),
          }))}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
          Recent history ({recent.length})
        </h2>
        {recent.length === 0 ? (
          <div className="rounded-md bg-white/5 border border-white/10 p-4 text-sm text-foreground-subtle">
            No surface history yet.
          </div>
        ) : (
          <div className="rounded-md bg-white/5 border border-white/10 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-foreground-subtle uppercase tracking-wide">
                  <th className="text-left p-2">When</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Thread</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Body / error</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => {
                  const pill = statusPill(r.status);
                  const body = r.editedBody ?? r.originalBody;
                  return (
                    <tr key={r.id} className="border-t border-white/5 align-top">
                      <td className="p-2 font-mono text-foreground-subtle whitespace-nowrap">
                        {r.createdAt.toISOString().slice(0, 10)}
                      </td>
                      <td className="p-2 text-white">{r.surfaceType}</td>
                      <td className="p-2 text-foreground-subtle">
                        <a
                          href={r.threadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-300 hover:underline"
                        >
                          {r.threadTitle ?? r.skoolPostId}
                        </a>
                        <div className="text-[10px] text-foreground-subtle mt-1">
                          by {r.threadAuthor ?? "(unknown)"}
                        </div>
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded-full ${pill.cls}`}>
                          {pill.label}
                        </span>
                      </td>
                      <td className="p-2 text-foreground-subtle max-w-xl">
                        {r.failureReason ? (
                          <code className="text-[var(--color-bad)]">{r.failureReason}</code>
                        ) : (
                          <pre className="font-sans text-xs whitespace-pre-wrap">{body}</pre>
                        )}
                        {r.skoolReplyUrl ? (
                          <a
                            href={r.skoolReplyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block mt-1 text-blue-300 hover:underline"
                          >
                            View reply on Skool $†’
                          </a>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

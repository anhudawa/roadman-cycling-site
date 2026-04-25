import { db } from "@/lib/db";
import { tedActiveMembers } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { safeQuery } from "@/lib/ted/safe-db";
import { MembersUploader } from "./_components/MembersUploader";
import { MigrationBanner } from "../_components/MigrationBanner";

export const dynamic = "force-dynamic";

export default async function TedMembersPage() {
  await requireAuth();

  const rowsResult = await safeQuery(
    () =>
      db
        .select()
        .from(tedActiveMembers)
        .orderBy(desc(tedActiveMembers.lastSeenAt))
        .limit(200),
    [] as Array<typeof tedActiveMembers.$inferSelect>
  );
  const rows = rowsResult.data;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">Ted $€” active members</h1>
        <p className="text-sm text-foreground-subtle">
          Members Ted can tag in thread-surface replies. Upsert below, or seed
          via
          <code className="mx-1 px-1 rounded bg-white/5 text-xs">
            agents/ted/scripts/seed-active-members.ts
          </code>
          for large imports.
        </p>
      </div>

      {rowsResult.migrationsNeeded ? <MigrationBanner /> : null}

      <MembersUploader />

      {rows.length === 0 ? (
        <div className="rounded-md bg-yellow-500/5 border border-yellow-500/20 p-4 text-sm text-yellow-300">
          No active members yet. Without at least a handful of entries, the
          <code className="mx-1 px-1 rounded bg-white/5 text-xs">surface-tag</code>
          variant will always fall through to link or summary. Seed from a CSV
          to unblock Week 4.
        </div>
      ) : (
        <div className="rounded-md bg-white/5 border border-white/10 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-foreground-subtle uppercase tracking-wide">
                <th className="text-left p-2">Member</th>
                <th className="text-left p-2">First name</th>
                <th className="text-left p-2">Topics</th>
                <th className="text-left p-2">Last seen</th>
                <th className="text-right p-2">Posts</th>
                <th className="text-right p-2">Replies</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.memberId} className="border-t border-white/5">
                  <td className="p-2 font-mono text-foreground-subtle">{r.memberId}</td>
                  <td className="p-2 text-white">{r.firstName}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      {(r.topicTags ?? []).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-foreground-subtle"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-2 font-mono text-foreground-subtle whitespace-nowrap">
                    {r.lastSeenAt?.toISOString().slice(0, 10) ?? "$€”"}
                  </td>
                  <td className="p-2 text-right text-white">{r.postCount}</td>
                  <td className="p-2 text-right text-white">{r.replyCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

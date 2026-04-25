import { db } from "@/lib/db";
import { tedActivityLog } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { safeQuery } from "@/lib/ted/safe-db";
import { LogAutoRefresh } from "./_components/LogAutoRefresh";
import { MigrationBanner } from "../_components/MigrationBanner";

export const dynamic = "force-dynamic";

export default async function TedLogPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string; level?: string }>;
}) {
  await requireAuth();
  const params = await searchParams;

  const rowsResult = await safeQuery(
    () =>
      db
        .select()
        .from(tedActivityLog)
        .orderBy(desc(tedActivityLog.timestamp))
        .limit(200),
    [] as Array<typeof tedActivityLog.$inferSelect>
  );
  const rows = rowsResult.data;

  const filtered = rows.filter((r) => {
    if (params.job && r.job !== params.job) return false;
    if (params.level && r.level !== params.level) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Ted — activity log</h1>
          <p className="text-sm text-foreground-subtle">
            Last 200 events. Filter via ?job= or ?level= in the URL.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LogAutoRefresh />
          <a
            href="/api/admin/ted/log/export?limit=5000"
            className="text-sm rounded-md bg-white/10 px-3 py-1.5 text-white hover:bg-white/15"
          >
            Export JSONL
          </a>
        </div>
      </div>

      {rowsResult.migrationsNeeded ? <MigrationBanner /> : null}

      <div className="rounded-md bg-white/5 border border-white/10 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-foreground-subtle uppercase tracking-wide">
              <th className="text-left p-2">Time</th>
              <th className="text-left p-2">Job</th>
              <th className="text-left p-2">Action</th>
              <th className="text-left p-2">Level</th>
              <th className="text-left p-2">Detail</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-white/5 align-top">
                <td className="p-2 font-mono text-foreground-subtle whitespace-nowrap">
                  {r.timestamp.toISOString().replace("T", " ").slice(0, 19)}
                </td>
                <td className="p-2 font-mono text-white">{r.job}</td>
                <td className="p-2 text-white">{r.action}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-0.5 rounded-full ${
                      r.level === "error"
                        ? "bg-[var(--color-bad-tint)] text-[var(--color-bad)]"
                        : r.level === "warn"
                          ? "bg-yellow-500/10 text-yellow-300"
                          : "bg-white/5 text-foreground-subtle"
                    }`}
                  >
                    {r.level}
                  </span>
                </td>
                <td className="p-2 text-foreground-subtle">
                  {r.error ? (
                    <code className="text-[var(--color-bad)]">{r.error}</code>
                  ) : r.payload ? (
                    <code className="font-mono">{JSON.stringify(r.payload)}</code>
                  ) : (
                    "—"
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

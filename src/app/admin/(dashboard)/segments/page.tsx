import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { countByFilters, listSegments } from "@/lib/crm/segments";

export const dynamic = "force-dynamic";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SegmentsPage() {
  await requireAuth();
  const segments = await listSegments();
  const withCounts = await Promise.all(
    segments.map(async (s) => ({ ...s, memberCount: await countByFilters(s.filters) }))
  );

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl text-off-white tracking-wider uppercase">Segments</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Dynamic contact groups. Re-evaluated each time — send template email to all members.
          </p>
        </div>
        <Link
          href="/admin/segments/new"
          className="px-4 py-2 bg-[var(--color-coral)] text-background-deep font-medium rounded text-sm hover:bg-[var(--color-coral-hover)]"
        >
          + New segment
        </Link>
      </div>

      {withCounts.length === 0 ? (
        <div className="bg-background-elevated border border-white/5 rounded-lg p-8 text-center">
          <p className="text-foreground-muted text-sm">No segments yet.</p>
          <Link href="/admin/segments/new" className="inline-block mt-3 text-accent text-sm hover:underline">
            Create your first segment →
          </Link>
        </div>
      ) : (
        <div className="bg-background-elevated border border-white/5 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr className="text-left text-[10px] uppercase tracking-widest text-foreground-subtle">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Members</th>
                <th className="px-4 py-3">Created by</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {withCounts.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/segments/${s.id}`} className="text-off-white hover:text-accent font-medium">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-foreground-muted truncate max-w-xs">
                    {s.description ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-off-white font-medium">{s.memberCount}</td>
                  <td className="px-4 py-3 text-foreground-muted">{s.createdBySlug ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground-subtle">{formatWhen(s.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

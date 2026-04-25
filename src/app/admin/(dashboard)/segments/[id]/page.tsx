import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/admin/auth";
import { countSegmentMembers, getSegment, listSegmentMembers } from "@/lib/crm/segments";
import { listTemplates } from "@/lib/crm/email";
import { SegmentActions } from "../_components/SegmentActions";

export const dynamic = "force-dynamic";

export default async function SegmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) notFound();

  const segment = await getSegment(id);
  if (!segment) notFound();

  const [count, members, templates] = await Promise.all([
    countSegmentMembers(id),
    listSegmentMembers(id, { limit: 100, offset: 0 }),
    listTemplates(),
  ]);

  const canSendEmail = user.role === "admin";

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/segments" className="text-xs text-foreground-subtle hover:text-accent">
          ← Segments
        </Link>
        <div className="flex items-start justify-between mt-2 gap-4">
          <div>
            <h1 className="font-heading text-2xl text-off-white tracking-wider uppercase">{segment.name}</h1>
            {segment.description && (
              <p className="text-sm text-foreground-muted mt-1">{segment.description}</p>
            )}
            <p className="text-xs text-foreground-subtle mt-2">
              <span className="font-medium text-[var(--color-bad)] text-sm">{count}</span> members · created by {segment.createdBySlug ?? "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SegmentActions
            segmentId={segment.id}
            memberCount={count}
            canSendEmail={canSendEmail}
            templates={templates.map((t) => ({ id: t.id, slug: t.slug, name: t.name, subject: t.subject }))}
          />
        </div>

        <div className="lg:col-span-2 bg-background-elevated border border-white/5 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-heading text-sm text-off-white tracking-wider uppercase">Members</h3>
            <span className="text-xs text-foreground-subtle">
              Showing {Math.min(count, members.length)} of {count}
            </span>
          </div>
          {members.length === 0 ? (
            <p className="p-6 text-sm text-foreground-subtle text-center">No matching contacts.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr className="text-left text-[10px] uppercase tracking-widest text-foreground-subtle">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Stage</th>
                  <th className="px-4 py-2">Owner</th>
                </tr>
              </thead>
              <tbody>
                {members.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-2">
                      <Link href={`/admin/contacts/${c.id}`} className="text-off-white hover:text-accent">
                        {c.name ?? "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-foreground-muted">{c.email}</td>
                    <td className="px-4 py-2 text-foreground-muted">{c.lifecycleStage}</td>
                    <td className="px-4 py-2 text-foreground-muted">{c.owner ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

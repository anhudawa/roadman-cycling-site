import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { listContacts } from "@/lib/crm/contacts";
import { BackfillButton } from "./_components/BackfillButton";
import { ContactsFilters } from "./_components/ContactsFilters";
import { EnrichAllButton } from "./_components/EnrichAllButton";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

function formatRelative(dateStr: string | Date | null): string {
  if (!dateStr) return "—";
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const diffMs = Date.now() - d.getTime();
  const m = Math.floor(diffMs / 60_000);
  const h = Math.floor(diffMs / 3_600_000);
  const dys = Math.floor(diffMs / 86_400_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (dys < 7) return `${dys}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function stageBadgeClass(stage: string): string {
  switch (stage) {
    case "customer":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "qualified":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "contacted":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "churned":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-white/5 text-foreground-muted border-white/10";
  }
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAuth();
  const sp = await searchParams;

  const search = typeof sp.search === "string" ? sp.search : "";
  const owner = typeof sp.owner === "string" ? sp.owner : "";
  const stage = typeof sp.stage === "string" ? sp.stage : "";
  const pageNum = Math.max(1, parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);
  const offset = (pageNum - 1) * PAGE_SIZE;

  const { rows, total } = await listContacts({
    search: search || undefined,
    owner: owner || undefined,
    stage: stage || undefined,
    limit: PAGE_SIZE,
    offset,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(n: number): string {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (owner) p.set("owner", owner);
    if (stage) p.set("stage", stage);
    p.set("page", String(n));
    return `/admin/contacts?${p.toString()}`;
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl text-off-white tracking-wider">CONTACTS</h1>
          <p className="text-sm text-foreground-muted mt-1">
            {total} total {total === 1 ? "contact" : "contacts"}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <BackfillButton />
          {user.role === "admin" && <EnrichAllButton />}
        </div>
      </div>

      <div className="mb-6">
        <ContactsFilters
          initialSearch={search}
          initialOwner={owner}
          initialStage={stage}
        />
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-16 text-foreground-subtle">
          <p className="text-lg font-heading tracking-wider">NO CONTACTS YET</p>
          <p className="text-sm mt-1">
            Run the backfill above to import from existing submissions.
          </p>
        </div>
      ) : (
        <div className="bg-background-elevated rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02]">
              <tr className="text-left text-[10px] uppercase tracking-widest text-foreground-subtle">
                <th className="px-4 py-3 font-medium">Name / Email</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Tags</th>
                <th className="px-4 py-3 font-medium text-right">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const tags = Array.isArray(c.tags) ? c.tags : [];
                return (
                  <tr
                    key={c.id}
                    className="border-t border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/admin/contacts/${c.id}`} className="block">
                        <div className="text-off-white font-medium">
                          {c.name ?? c.email}
                        </div>
                        <div className="text-xs text-foreground-subtle">{c.email}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/contacts/${c.id}`} className="block">
                        {c.owner ? (
                          <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-foreground-muted capitalize">
                            {c.owner}
                          </span>
                        ) : (
                          <span className="text-xs text-foreground-subtle">—</span>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/contacts/${c.id}`} className="block">
                        <span
                          className={`text-xs px-2 py-0.5 rounded border capitalize ${stageBadgeClass(c.lifecycleStage)}`}
                        >
                          {c.lifecycleStage}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/contacts/${c.id}`} className="flex flex-wrap gap-1">
                        {tags.length === 0 ? (
                          <span className="text-xs text-foreground-subtle">—</span>
                        ) : (
                          tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-coral/10 text-coral/90 border border-coral/20"
                            >
                              {t}
                            </span>
                          ))
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/contacts/${c.id}`}
                        className="text-xs text-foreground-muted"
                      >
                        {formatRelative(c.lastActivityAt ?? c.createdAt)}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-xs text-foreground-muted">
          <span>
            Page {pageNum} of {totalPages}
          </span>
          <div className="flex gap-2">
            {pageNum > 1 && (
              <Link
                href={pageHref(pageNum - 1)}
                className="px-3 py-1 rounded border border-white/10 hover:border-coral/30"
              >
                Previous
              </Link>
            )}
            {pageNum < totalPages && (
              <Link
                href={pageHref(pageNum + 1)}
                className="px-3 py-1 rounded border border-white/10 hover:border-coral/30"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

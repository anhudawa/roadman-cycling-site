import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { listContacts } from "@/lib/crm/contacts";
import { BackfillButton } from "./_components/BackfillButton";
import { ContactsFilters } from "./_components/ContactsFilters";
import { ContactsTable, type ContactRow } from "./_components/ContactsTable";
import { EnrichAllButton } from "./_components/EnrichAllButton";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

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
  const staleRaw = typeof sp.stale === "string" ? sp.stale : "";
  const staleOnly = staleRaw === "1" || staleRaw === "true";
  const pageNum = Math.max(1, parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);
  const offset = (pageNum - 1) * PAGE_SIZE;

  const { rows, total } = await listContacts({
    search: search || undefined,
    owner: owner || undefined,
    stage: stage || undefined,
    staleOnly,
    limit: PAGE_SIZE,
    offset,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(n: number): string {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (owner) p.set("owner", owner);
    if (stage) p.set("stage", stage);
    if (staleOnly) p.set("stale", "1");
    p.set("page", String(n));
    return `/admin/contacts?${p.toString()}`;
  }

  const tableRows: ContactRow[] = rows.map((c) => ({
    id: c.id,
    email: c.email,
    name: c.name,
    owner: c.owner,
    lifecycleStage: c.lifecycleStage,
    tags: Array.isArray(c.tags) ? c.tags : [],
    lastActivityAt: c.lastActivityAt ? c.lastActivityAt.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
  }));

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
          <Link
            href="/admin/contacts/import"
            className="px-3 py-2 text-xs font-heading tracking-wider uppercase bg-background-elevated border border-white/10 text-off-white rounded hover:border-coral/40 transition-colors"
          >
            Import CSV
          </Link>
          <BackfillButton />
          {user.role === "admin" && <EnrichAllButton />}
        </div>
      </div>

      <div className="mb-6">
        <ContactsFilters
          initialSearch={search}
          initialOwner={owner}
          initialStage={stage}
          initialStale={staleOnly}
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
        <ContactsTable rows={tableRows} />
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

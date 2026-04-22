import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { listContacts } from "@/lib/crm/contacts";
import { listSavedViews } from "@/lib/crm/saved-views";
import { BackfillButton } from "./_components/BackfillButton";
import { ContactsFilters } from "./_components/ContactsFilters";
import { ContactsTable, type ContactRow } from "./_components/ContactsTable";
import { EnrichAllButton } from "./_components/EnrichAllButton";
import { SavedViewsBar } from "./_components/SavedViewsBar";
import { findDuplicateGroups } from "@/lib/crm/dedup";

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
  const sortParam = typeof sp.sort === "string" ? sp.sort : "";
  const sort = sortParam === "score" ? ("score" as const) : undefined;
  const pageNum = Math.max(1, parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);
  const offset = (pageNum - 1) * PAGE_SIZE;

  const { rows, total } = await listContacts({
    search: search || undefined,
    owner: owner || undefined,
    stage: stage || undefined,
    staleOnly,
    sort,
    limit: PAGE_SIZE,
    offset,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const savedViews = await listSavedViews("contacts").catch(() => []);
  const duplicateGroups =
    user.role === "admin" ? await findDuplicateGroups(50).catch(() => []) : [];
  const currentFilters: Record<string, string> = {};
  if (search) currentFilters.search = search;
  if (owner) currentFilters.owner = owner;
  if (stage) currentFilters.stage = stage;
  if (staleOnly) currentFilters.stale = "1";

  function pageHref(n: number): string {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (owner) p.set("owner", owner);
    if (stage) p.set("stage", stage);
    if (staleOnly) p.set("stale", "1");
    if (sort) p.set("sort", sort);
    p.set("page", String(n));
    return `/admin/contacts?${p.toString()}`;
  }

  const tableRows: ContactRow[] = rows.map((c) => {
    const cf = (c.customFields ?? {}) as Record<string, unknown>;
    const sys = (cf.system ?? {}) as Record<string, unknown>;
    const raw = sys.lead_score;
    const score =
      typeof raw === "number"
        ? raw
        : typeof raw === "string" && raw !== ""
          ? parseInt(raw, 10)
          : null;
    return {
      id: c.id,
      email: c.email,
      name: c.name,
      owner: c.owner,
      lifecycleStage: c.lifecycleStage,
      tags: Array.isArray(c.tags) ? c.tags : [],
      lastActivityAt: c.lastActivityAt ? c.lastActivityAt.toISOString() : null,
      createdAt: c.createdAt.toISOString(),
      score: Number.isFinite(score) ? (score as number) : null,
    };
  });

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
            className="px-3 py-2 font-body font-semibold text-[13px] bg-[var(--color-elevated)] border border-[var(--color-border)] text-[var(--color-fg)] rounded-[var(--radius-admin-md)] hover:border-[var(--color-border-strong)] transition-colors"
          >
            Import CSV
          </Link>
          <BackfillButton />
          {user.role === "admin" && <EnrichAllButton />}
          {user.role === "admin" && duplicateGroups.length > 0 && (
            <Link
              href="/admin/contacts/duplicates"
              className="px-3 py-2 text-xs font-heading tracking-wider uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded hover:bg-amber-500/20 transition-colors"
            >
              {duplicateGroups.length} potential duplicate{duplicateGroups.length === 1 ? "" : "s"}
            </Link>
          )}
        </div>
      </div>

      <div className="mb-6">
        <SavedViewsBar
          views={savedViews}
          currentUserSlug={user.slug}
          currentFilters={currentFilters}
        />
        <ContactsFilters
          initialSearch={search}
          initialOwner={owner}
          initialStage={stage}
          initialStale={staleOnly}
        />
        <div className="mt-2 flex items-center gap-3 text-xs text-foreground-muted">
          <span className="uppercase tracking-widest text-[10px] text-foreground-subtle">
            Order by:
          </span>
          <Link
            href={(() => {
              const p = new URLSearchParams();
              if (search) p.set("search", search);
              if (owner) p.set("owner", owner);
              if (stage) p.set("stage", stage);
              if (staleOnly) p.set("stale", "1");
              const qs = p.toString();
              return qs ? `/admin/contacts?${qs}` : "/admin/contacts";
            })()}
            className={
              sort !== "score"
                ? "text-off-white underline underline-offset-2"
                : "hover:text-off-white"
            }
          >
            Recent activity
          </Link>
          <Link
            href={(() => {
              const p = new URLSearchParams();
              if (search) p.set("search", search);
              if (owner) p.set("owner", owner);
              if (stage) p.set("stage", stage);
              if (staleOnly) p.set("stale", "1");
              p.set("sort", "score");
              return `/admin/contacts?${p.toString()}`;
            })()}
            className={
              sort === "score"
                ? "text-off-white underline underline-offset-2"
                : "hover:text-off-white"
            }
          >
            Score desc
          </Link>
        </div>
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
                className="px-3 py-1 rounded-[var(--radius-admin-md)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)]"
              >
                Previous
              </Link>
            )}
            {pageNum < totalPages && (
              <Link
                href={pageHref(pageNum + 1)}
                className="px-3 py-1 rounded-[var(--radius-admin-md)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)]"
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

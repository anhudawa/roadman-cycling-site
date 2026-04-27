import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { cohortApplications, contacts } from "@/lib/db/schema";
import { requireAuth } from "@/lib/admin/auth";
import {
  APPLICATION_STAGES,
  isApplicationStage,
  type ApplicationStage,
} from "@/lib/crm/pipeline";
import { getOrCreateContactForApplication } from "@/lib/crm/contacts";
import { PipelineBoard, type KanbanApplication, type StageMap } from "./_components/PipelineBoard";
import { ApplicationsList } from "./_components/ApplicationsList";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function serialize(
  row: typeof cohortApplications.$inferSelect,
  contactId: number | null,
  owner: string | null
): KanbanApplication {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    goal: row.goal,
    hours: row.hours,
    ftp: row.ftp,
    frustration: row.frustration,
    cohort: row.cohort,
    persona: row.persona,
    status: row.status,
    readAt: row.readAt ? row.readAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    contactId,
    owner,
  };
}

export default async function ApplicationsPage({ searchParams }: PageProps) {
  await requireAuth();
  const sp = await searchParams;

  const viewRaw = sp.view;
  const view = Array.isArray(viewRaw) ? viewRaw[0] : viewRaw;
  const currentView: "kanban" | "list" = view === "list" ? "list" : "kanban";

  const cohortRaw = sp.cohort;
  const cohort = Array.isArray(cohortRaw) ? cohortRaw[0] : cohortRaw;
  const currentCohort = cohort && cohort.trim() ? cohort : "all";

  const cohortsRows = await db
    .selectDistinct({ cohort: cohortApplications.cohort })
    .from(cohortApplications);
  const cohorts = cohortsRows.map((c) => c.cohort).filter(Boolean) as string[];

  const initialStages: StageMap = {
    awaiting_response: [],
    contacted: [],
    offered: [],
    accepted: [],
    rejected: [],
  };

  if (currentView === "kanban") {
    const baseQuery = db
      .select()
      .from(cohortApplications)
      .orderBy(desc(cohortApplications.createdAt));
    const rows = await (currentCohort !== "all"
      ? baseQuery.where(eq(cohortApplications.cohort, currentCohort))
      : baseQuery);

    const emailToContactId = new Map<string, number>();
    for (const r of rows) {
      const key = r.email.toLowerCase();
      if (emailToContactId.has(key)) continue;
      try {
        const cid = await getOrCreateContactForApplication({
          email: r.email,
          name: r.name,
          goal: r.goal,
          hours: r.hours,
          ftp: r.ftp,
          cohort: r.cohort,
          persona: r.persona,
          createdAt: r.createdAt,
        });
        emailToContactId.set(key, cid);
      } catch (err) {
        console.error("[applications page] upsert failed", err);
      }
    }

    // Resolve owner for each contact.
    const contactIds = Array.from(new Set(emailToContactId.values()));
    const ownerById = new Map<number, string | null>();
    if (contactIds.length > 0) {
      const ownerRows = await db
        .select({ id: contacts.id, owner: contacts.owner })
        .from(contacts)
        .where(inArray(contacts.id, contactIds));
      for (const o of ownerRows) ownerById.set(o.id, o.owner);
    }

    for (const r of rows) {
      const stage: ApplicationStage = isApplicationStage(r.status)
        ? r.status
        : "awaiting_response";
      const cid = emailToContactId.get(r.email.toLowerCase()) ?? null;
      const owner = cid !== null ? ownerById.get(cid) ?? null : null;
      initialStages[stage].push(serialize(r, cid, owner));
    }
  }

  const totalCount = APPLICATION_STAGES.reduce(
    (sum, s) => sum + initialStages[s].length,
    0
  );

  return (
    <div className="p-6">
      <div className="mb-5 space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl sm:text-3xl text-off-white tracking-wider uppercase leading-none">
              Submissions
            </h1>
            <p className="text-foreground-muted text-sm mt-1.5">
              {currentView === "kanban"
                ? `${totalCount} /apply submission${totalCount === 1 ? "" : "s"}`
                : "/apply submissions · list view"}
            </p>
          </div>
          <div className="inline-flex rounded-lg border border-white/10 bg-background-elevated p-0.5 text-[11px] shrink-0">
            <Link
              href={{ pathname: "/admin/applications", query: { view: "kanban" } }}
              aria-current={currentView === "kanban" ? "page" : undefined}
              className={`px-3 h-8 inline-flex items-center rounded-md font-heading tracking-wider uppercase transition-colors ${
                currentView === "kanban"
                  ? "bg-[var(--color-raised)] text-[var(--color-fg)] shadow-inner"
                  : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              }`}
            >
              Board
            </Link>
            <Link
              href={{ pathname: "/admin/applications", query: { view: "list" } }}
              aria-current={currentView === "list" ? "page" : undefined}
              className={`px-3 h-8 inline-flex items-center rounded-md font-heading tracking-wider uppercase transition-colors ${
                currentView === "list"
                  ? "bg-[var(--color-raised)] text-[var(--color-fg)] shadow-inner"
                  : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              }`}
            >
              List
            </Link>
          </div>
        </div>
        <div className="inline-flex rounded-lg border border-white/10 bg-background-elevated p-0.5 text-[11px]">
          <Link
            href="/admin/inbox"
            className="px-4 h-8 inline-flex items-center rounded-md font-heading tracking-wider uppercase text-foreground-subtle hover:text-off-white transition-colors"
          >
            Contact forms
          </Link>
          <Link
            href="/admin/applications"
            aria-current="page"
            className="px-4 h-8 inline-flex items-center rounded-md font-body font-semibold text-[13px] bg-[var(--color-raised)] text-[var(--color-fg)] shadow-inner"
          >
            Applications
          </Link>
        </div>
      </div>

      {currentView === "kanban" ? (
        <PipelineBoard
          initialStages={initialStages}
          cohorts={cohorts}
          initialCohort={currentCohort}
        />
      ) : (
        <ApplicationsList />
      )}
    </div>
  );
}

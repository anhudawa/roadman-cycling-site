import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cohortApplications } from "@/lib/db/schema";
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

function serialize(row: typeof cohortApplications.$inferSelect, contactId: number | null): KanbanApplication {
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

  let initialStages: StageMap = {
    awaiting_response: [],
    contacted: [],
    qualified: [],
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

    for (const r of rows) {
      const stage: ApplicationStage = isApplicationStage(r.status)
        ? r.status
        : "awaiting_response";
      initialStages[stage].push(
        serialize(r, emailToContactId.get(r.email.toLowerCase()) ?? null)
      );
    }
  }

  const totalCount = APPLICATION_STAGES.reduce(
    (sum, s) => sum + initialStages[s].length,
    0
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl text-off-white tracking-wider uppercase">
            Applications
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            {currentView === "kanban"
              ? `${totalCount} in pipeline`
              : "List view"}
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-white/10 bg-background-elevated p-1 text-xs">
          <Link
            href={{ pathname: "/admin/applications", query: { view: "kanban" } }}
            className={`px-3 py-1.5 rounded-md font-heading tracking-wider uppercase transition ${
              currentView === "kanban"
                ? "bg-coral/15 text-coral"
                : "text-foreground-subtle hover:text-off-white"
            }`}
          >
            Kanban
          </Link>
          <Link
            href={{ pathname: "/admin/applications", query: { view: "list" } }}
            className={`px-3 py-1.5 rounded-md font-heading tracking-wider uppercase transition ${
              currentView === "list"
                ? "bg-coral/15 text-coral"
                : "text-foreground-subtle hover:text-off-white"
            }`}
          >
            List
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

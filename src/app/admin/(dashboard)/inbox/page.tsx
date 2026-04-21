import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  contactSubmissions,
  INBOX_STAGES,
  isInboxStage,
  type InboxStage,
} from "@/lib/db/schema";
import { requireAuth } from "@/lib/admin/auth";
import {
  InboxPipelineBoard,
  type InboxSubmission,
  type InboxStageMap,
} from "./_components/InboxPipelineBoard";
import { InboxList } from "./_components/InboxList";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function serialize(
  row: typeof contactSubmissions.$inferSelect
): InboxSubmission {
  const stage: InboxStage = isInboxStage(row.status)
    ? (row.status as InboxStage)
    : "new";
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    readAt: row.readAt ? row.readAt.toISOString() : null,
    assignedTo: row.assignedTo,
    status: stage,
    createdAt: row.createdAt.toISOString(),
  };
}

export default async function InboxPage({ searchParams }: PageProps) {
  await requireAuth();
  const sp = await searchParams;

  const viewRaw = sp.view;
  const view = Array.isArray(viewRaw) ? viewRaw[0] : viewRaw;
  const currentView: "kanban" | "list" = view === "list" ? "list" : "kanban";

  let initialStages: InboxStageMap = {
    new: [],
    in_progress: [],
    replied: [],
    follow_up: [],
    closed: [],
  };
  let totalCount = 0;

  if (currentView === "kanban") {
    const rows = await db
      .select()
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.createdAt));

    for (const r of rows) {
      const sub = serialize(r);
      const stage: InboxStage = isInboxStage(r.status)
        ? (r.status as InboxStage)
        : "new";
      initialStages[stage].push(sub);
    }
    totalCount = INBOX_STAGES.reduce(
      (sum, s) => sum + initialStages[s].length,
      0
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl sm:text-3xl text-off-white tracking-wider uppercase leading-none">
            Submissions
          </h1>
          <p className="text-foreground-muted text-sm mt-1.5">
            {currentView === "kanban"
              ? `${totalCount} contact-form message${totalCount === 1 ? "" : "s"} · drag to reorder`
              : "Contact-form messages · list view"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="inline-flex rounded-lg border border-white/10 bg-background-elevated p-0.5 text-xs">
            <Link
              href="/admin/inbox"
              className="px-3 py-1.5 rounded-md font-heading tracking-wider uppercase bg-coral/15 text-coral"
            >
              Contact forms
            </Link>
            <Link
              href="/admin/applications"
              className="px-3 py-1.5 rounded-md font-heading tracking-wider uppercase text-foreground-subtle hover:text-off-white transition-colors"
            >
              Applications
            </Link>
          </div>
          <div className="inline-flex rounded-lg border border-white/10 bg-background-elevated p-0.5 text-xs">
            <Link
              href={{ pathname: "/admin/inbox", query: { view: "kanban" } }}
              className={`px-3 py-1.5 rounded-md font-heading tracking-wider uppercase transition-colors ${
                currentView === "kanban"
                  ? "bg-coral/15 text-coral"
                  : "text-foreground-subtle hover:text-off-white"
              }`}
            >
              Board
            </Link>
            <Link
              href={{ pathname: "/admin/inbox", query: { view: "list" } }}
              className={`px-3 py-1.5 rounded-md font-heading tracking-wider uppercase transition-colors ${
                currentView === "list"
                  ? "bg-coral/15 text-coral"
                  : "text-foreground-subtle hover:text-off-white"
              }`}
            >
              List
            </Link>
          </div>
        </div>
      </div>

      {currentView === "kanban" ? (
        <InboxPipelineBoard initialStages={initialStages} />
      ) : (
        <InboxList />
      )}
    </div>
  );
}

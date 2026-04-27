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
import { PageHeader } from "@/components/admin/ui";
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

  const initialStages: InboxStageMap = {
    new: [],
    reviewing: [],
    awaiting_reply: [],
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

  const subtitle =
    currentView === "kanban"
      ? `${totalCount} contact-form message${totalCount === 1 ? "" : "s"}`
      : "Contact-form messages · list view";

  const pillActiveCls =
    "bg-[var(--color-raised)] text-[var(--color-fg)] shadow-inner";
  const pillIdleCls =
    "text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]";

  return (
    <div>
      <PageHeader
        title="Inbox"
        subtitle={subtitle}
        actions={
          <div className="inline-flex rounded-[var(--radius-admin-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-0.5 text-[11px] shrink-0">
            <Link
              href={{ pathname: "/admin/inbox", query: { view: "kanban" } }}
              aria-current={currentView === "kanban" ? "page" : undefined}
              className={`px-3 h-8 inline-flex items-center rounded-[var(--radius-admin-sm)] font-body font-semibold tracking-normal transition-colors duration-[var(--dur-fast)] ${
                currentView === "kanban" ? pillActiveCls : pillIdleCls
              }`}
            >
              Board
            </Link>
            <Link
              href={{ pathname: "/admin/inbox", query: { view: "list" } }}
              aria-current={currentView === "list" ? "page" : undefined}
              className={`px-3 h-8 inline-flex items-center rounded-[var(--radius-admin-sm)] font-body font-semibold tracking-normal transition-colors duration-[var(--dur-fast)] ${
                currentView === "list" ? pillActiveCls : pillIdleCls
              }`}
            >
              List
            </Link>
          </div>
        }
      />

      {/* Source tabs — contact forms vs applications */}
      <div className="mb-5 inline-flex rounded-[var(--radius-admin-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-0.5 text-[11px]">
        <Link
          href="/admin/inbox"
          aria-current="page"
          className={`px-4 h-8 inline-flex items-center rounded-[var(--radius-admin-sm)] font-body font-semibold tracking-normal ${pillActiveCls}`}
        >
          Contact forms
        </Link>
        <Link
          href="/admin/applications"
          className={`px-4 h-8 inline-flex items-center rounded-[var(--radius-admin-sm)] font-body font-semibold tracking-normal transition-colors duration-[var(--dur-fast)] ${pillIdleCls}`}
        >
          Applications
        </Link>
      </div>

      {currentView === "kanban" ? (
        <InboxPipelineBoard initialStages={initialStages} />
      ) : (
        <InboxList />
      )}
    </div>
  );
}

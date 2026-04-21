import Link from "next/link";
import { db } from "@/lib/db";
import {
  tedDrafts,
  tedWelcomeQueue,
  tedSurfaceDrafts,
  tedKillSwitch,
} from "@/lib/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { safeQuery, anyNeedsMigration } from "@/lib/ted/safe-db";
import { MigrationBanner } from "./_components/MigrationBanner";
import { GenerateDraftPanel } from "./_components/GenerateDraftPanel";
import { ApprovalsInbox } from "./approvals/_components/ApprovalsInbox";
import type { ApprovalItem } from "./approvals/_components/types";

export const dynamic = "force-dynamic";

export default async function TedDashboardPage() {
  await requireAuth();

  const [promptsR, welcomesR, surfacesR, ksR] = await Promise.all([
    safeQuery(
      () =>
        db
          .select()
          .from(tedDrafts)
          .where(inArray(tedDrafts.status, ["draft", "voice_flagged"]))
          .orderBy(desc(tedDrafts.createdAt))
          .limit(25),
      [] as Array<typeof tedDrafts.$inferSelect>
    ),
    safeQuery(
      () =>
        db
          .select()
          .from(tedWelcomeQueue)
          .where(inArray(tedWelcomeQueue.status, ["drafted", "failed"]))
          .orderBy(desc(tedWelcomeQueue.createdAt))
          .limit(25),
      [] as Array<typeof tedWelcomeQueue.$inferSelect>
    ),
    safeQuery(
      () =>
        db
          .select()
          .from(tedSurfaceDrafts)
          .where(inArray(tedSurfaceDrafts.status, ["drafted", "voice_flagged"]))
          .orderBy(desc(tedSurfaceDrafts.createdAt))
          .limit(25),
      [] as Array<typeof tedSurfaceDrafts.$inferSelect>
    ),
    safeQuery(
      () =>
        db
          .select()
          .from(tedKillSwitch)
          .where(eq(tedKillSwitch.id, 1))
          .limit(1),
      [] as Array<typeof tedKillSwitch.$inferSelect>
    ),
  ]);

  const migrationsNeeded = anyNeedsMigration([promptsR, welcomesR, surfacesR, ksR]);
  const kill = ksR.data[0];

  const items: ApprovalItem[] = [
    ...promptsR.data.map((r) => ({
      kind: "prompt" as const,
      id: r.id,
      pillar: r.pillar,
      scheduledFor: r.scheduledFor,
      originalBody: r.originalBody,
      editedBody: r.editedBody,
      voiceCheck: r.voiceCheck,
      status: r.status,
      attempts: r.generationAttempts,
      createdAt: r.createdAt.toISOString(),
    })),
    ...welcomesR.data.map((r) => ({
      kind: "welcome" as const,
      memberEmail: r.memberEmail,
      firstName: r.firstName,
      persona: r.persona,
      draftBody: r.draftBody ?? "",
      voiceCheck: r.voiceCheck,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    })),
    ...surfacesR.data.map((r) => ({
      kind: "surface" as const,
      id: r.id,
      surfaceType: r.surfaceType,
      threadUrl: r.threadUrl,
      threadAuthor: r.threadAuthor,
      threadTitle: r.threadTitle,
      threadBody: r.threadBody,
      originalBody: r.originalBody,
      editedBody: r.editedBody,
      voiceCheck: r.voiceCheck,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    })),
  ];
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const counts = {
    total: items.length,
    prompts: promptsR.data.length,
    welcomes: welcomesR.data.length,
    surfaces: surfacesR.data.length,
  };

  const statusLabel = kill?.paused
    ? { text: "Paused", cls: "bg-coral/10 text-coral" }
    : kill?.postPromptEnabled ||
        kill?.postWelcomeEnabled ||
        kill?.surfaceThreadsEnabled
      ? { text: "Live", cls: "bg-emerald-500/10 text-emerald-300" }
      : { text: "Shadow mode", cls: "bg-yellow-500/10 text-yellow-300" };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-white">Ted</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusLabel.cls}`}>
              {statusLabel.text}
            </span>
          </div>
          <p className="text-sm text-foreground-subtle mt-1">
            Review what Ted wants to post to the Clubhouse. Nothing publishes
            without your approval.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/admin/ted/settings"
            className="text-sm rounded-md bg-white/5 border border-white/10 text-white hover:bg-white/10 px-3 py-1.5"
          >
            Settings
          </Link>
          <Link
            href="/admin/ted/health"
            className="text-sm rounded-md bg-white/5 border border-white/10 text-foreground-subtle hover:text-white hover:bg-white/10 px-3 py-1.5"
          >
            Health &amp; schedule
          </Link>
        </div>
      </header>

      {migrationsNeeded ? <MigrationBanner /> : null}

      {kill?.paused ? (
        <div className="rounded-md bg-coral/10 border border-coral/30 p-4 text-sm">
          <div className="font-semibold text-coral mb-1">Ted is paused</div>
          <div className="text-xs text-foreground-subtle">
            Paused by {kill.pausedBySlug ?? "unknown"}
            {kill.reason ? ` — ${kill.reason}` : ""}. Resume from{" "}
            <Link href="/admin/ted/settings" className="text-coral underline">
              Settings
            </Link>
            .
          </div>
        </div>
      ) : null}

      <section className="rounded-md bg-white/5 border border-white/10 p-4 sm:p-5">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">
            Waiting on you
            {counts.total > 0 ? (
              <span className="ml-2 text-xs font-normal text-foreground-subtle">
                {counts.total} item{counts.total === 1 ? "" : "s"} · {counts.prompts}{" "}
                prompt{counts.prompts === 1 ? "" : "s"} · {counts.welcomes}{" "}
                welcome{counts.welcomes === 1 ? "" : "s"} · {counts.surfaces}{" "}
                surface{counts.surfaces === 1 ? "" : "s"}
              </span>
            ) : null}
          </h2>
          <Link
            href="/admin/ted/approvals"
            className="text-xs text-foreground-subtle hover:text-white underline"
          >
            Open full inbox →
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-md bg-emerald-500/5 border border-emerald-500/20 p-6 text-sm text-emerald-300">
            Nothing waiting. Ted is caught up.
            <div className="text-xs text-foreground-subtle mt-2">
              New drafts arrive on Ted&apos;s schedule (daily prompts 06:00 UTC,
              welcomes twice a day, thread surfaces 13:00 UTC). Want to see
              examples right now? Seed sample posts below.
            </div>
          </div>
        ) : (
          <ApprovalsInbox items={items} />
        )}
      </section>

      <GenerateDraftPanel />
    </div>
  );
}

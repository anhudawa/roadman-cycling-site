import { db } from "@/lib/db";
import {
  tedDrafts,
  tedWelcomeQueue,
  tedSurfaceDrafts,
} from "@/lib/db/schema";
import { desc, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { safeQuery, anyNeedsMigration } from "@/lib/ted/safe-db";
import { ApprovalsInbox } from "./_components/ApprovalsInbox";
import type { ApprovalItem } from "./_components/types";
import { MigrationBanner } from "../_components/MigrationBanner";

export const dynamic = "force-dynamic";

export default async function TedApprovalsPage() {
  await requireAuth();

  const [promptsR, welcomesR, surfacesR] = await Promise.all([
    safeQuery(
      () =>
        db
          .select()
          .from(tedDrafts)
          .where(inArray(tedDrafts.status, ["draft", "voice_flagged"]))
          .orderBy(desc(tedDrafts.createdAt))
          .limit(50),
      [] as Array<typeof tedDrafts.$inferSelect>
    ),
    safeQuery(
      () =>
        db
          .select()
          .from(tedWelcomeQueue)
          .where(inArray(tedWelcomeQueue.status, ["drafted", "failed"]))
          .orderBy(desc(tedWelcomeQueue.createdAt))
          .limit(50),
      [] as Array<typeof tedWelcomeQueue.$inferSelect>
    ),
    safeQuery(
      () =>
        db
          .select()
          .from(tedSurfaceDrafts)
          .where(inArray(tedSurfaceDrafts.status, ["drafted", "voice_flagged"]))
          .orderBy(desc(tedSurfaceDrafts.createdAt))
          .limit(50),
      [] as Array<typeof tedSurfaceDrafts.$inferSelect>
    ),
  ]);

  const migrationsNeeded = anyNeedsMigration([promptsR, welcomesR, surfacesR]);
  const prompts = promptsR.data;
  const welcomes = welcomesR.data;
  const surfaces = surfacesR.data;

  const items: ApprovalItem[] = [
    ...prompts.map((r) => ({
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
    ...welcomes.map((r) => ({
      kind: "welcome" as const,
      memberEmail: r.memberEmail,
      firstName: r.firstName,
      persona: r.persona,
      draftBody: r.draftBody ?? "",
      voiceCheck: r.voiceCheck,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    })),
    ...surfaces.map((r) => ({
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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">Ted $— approvals inbox</h1>
        <p className="text-sm text-foreground-subtle">
          Everything waiting on you across prompts, welcomes, and surfaces. Filter by type or work the lot top-to-bottom.
        </p>
      </div>

      {migrationsNeeded ? <MigrationBanner /> : null}

      <ApprovalsInbox items={items} />
    </div>
  );
}

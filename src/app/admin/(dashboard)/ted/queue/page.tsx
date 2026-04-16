import { db } from "@/lib/db";
import { tedDrafts } from "@/lib/db/schema";
import { desc, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { QueueTable } from "./_components/QueueTable";

export const dynamic = "force-dynamic";

export default async function TedQueuePage() {
  await requireAuth();

  const rows = await db
    .select()
    .from(tedDrafts)
    .where(inArray(tedDrafts.status, ["draft", "voice_flagged", "edited", "approved"]))
    .orderBy(desc(tedDrafts.scheduledFor), desc(tedDrafts.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Ted — review queue</h1>
        <p className="text-sm text-foreground-subtle">
          Approve, edit, or reject each draft. Edits feed the weekly edit-rate metric.
        </p>
      </div>

      <QueueTable
        rows={rows.map((r) => ({
          id: r.id,
          pillar: r.pillar,
          scheduledFor: r.scheduledFor,
          status: r.status,
          originalBody: r.originalBody,
          editedBody: r.editedBody,
          voiceCheck: r.voiceCheck,
          generationAttempts: r.generationAttempts,
          failureReason: r.failureReason,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}

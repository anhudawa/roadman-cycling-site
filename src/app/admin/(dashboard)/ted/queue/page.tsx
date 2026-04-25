import Link from "next/link";
import { db } from "@/lib/db";
import { tedDrafts } from "@/lib/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { safeQuery } from "@/lib/ted/safe-db";
import { QueueTable } from "./_components/QueueTable";
import { MigrationBanner } from "../_components/MigrationBanner";

export const dynamic = "force-dynamic";

const QUEUE_STATUSES = ["draft", "voice_flagged", "edited", "approved"] as const;
const PILLARS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

type QueueStatus = (typeof QUEUE_STATUSES)[number];

export default async function TedQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ pillar?: string; status?: string }>;
}) {
  await requireAuth();
  const params = await searchParams;

  const statusFilter = QUEUE_STATUSES.includes(params.status as QueueStatus)
    ? (params.status as QueueStatus)
    : null;
  const pillarFilter = PILLARS.includes(params.pillar as (typeof PILLARS)[number])
    ? params.pillar ?? null
    : null;

  const conditions = [inArray(tedDrafts.status, [...QUEUE_STATUSES])];
  if (statusFilter) {
    conditions[0] = inArray(tedDrafts.status, [statusFilter]);
  }
  if (pillarFilter) conditions.push(eq(tedDrafts.pillar, pillarFilter));

  const rowsResult = await safeQuery(
    () =>
      db
        .select()
        .from(tedDrafts)
        .where(conditions.length === 1 ? conditions[0] : and(...conditions))
        .orderBy(desc(tedDrafts.scheduledFor), desc(tedDrafts.createdAt))
        .limit(50),
    [] as Array<typeof tedDrafts.$inferSelect>
  );
  const rows = rowsResult.data;

  const statusFilters: Array<{ label: string; status: QueueStatus | null }> = [
    { label: "all open", status: null },
    { label: "draft", status: "draft" },
    { label: "voice-flagged", status: "voice_flagged" },
    { label: "edited", status: "edited" },
    { label: "approved", status: "approved" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Ted $€” review queue</h1>
        <p className="text-sm text-foreground-subtle">
          Approve, edit, or reject each draft. Edits feed the weekly edit-rate metric.
        </p>
      </div>

      {rowsResult.migrationsNeeded ? <MigrationBanner /> : null}

      <div className="flex flex-wrap gap-2 text-xs">
        <div className="flex gap-1 items-center">
          <span className="text-foreground-subtle uppercase tracking-wide mr-1">
            Status:
          </span>
          {statusFilters.map((f) => {
            const active = (f.status ?? "") === (statusFilter ?? "");
            const href = buildHref({
              pillar: pillarFilter,
              status: f.status,
            });
            return (
              <Link
                key={f.label}
                href={href}
                className={`px-2 py-1 rounded-md ${
                  active
                    ? "bg-white/15 text-white"
                    : "bg-white/5 text-foreground-subtle hover:text-white hover:bg-white/10"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        <div className="flex gap-1 items-center">
          <span className="text-foreground-subtle uppercase tracking-wide mr-1">
            Pillar:
          </span>
          <Link
            href={buildHref({ pillar: null, status: statusFilter })}
            className={`px-2 py-1 rounded-md ${
              !pillarFilter
                ? "bg-white/15 text-white"
                : "bg-white/5 text-foreground-subtle hover:text-white hover:bg-white/10"
            }`}
          >
            all
          </Link>
          {PILLARS.map((p) => {
            const active = pillarFilter === p;
            return (
              <Link
                key={p}
                href={buildHref({ pillar: p, status: statusFilter })}
                className={`px-2 py-1 rounded-md ${
                  active
                    ? "bg-white/15 text-white"
                    : "bg-white/5 text-foreground-subtle hover:text-white hover:bg-white/10"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
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

function buildHref(opts: { pillar: string | null; status: string | null }): string {
  const params = new URLSearchParams();
  if (opts.status) params.set("status", opts.status);
  if (opts.pillar) params.set("pillar", opts.pillar);
  const qs = params.toString();
  return qs ? `/admin/ted/queue?${qs}` : "/admin/ted/queue";
}

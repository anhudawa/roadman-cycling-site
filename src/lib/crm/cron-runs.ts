import { db } from "@/lib/db";
import { cronRuns, type CronRunKind } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export type CronStatus = "running" | "success" | "error";

export async function startCronRun(kind: CronRunKind): Promise<{ id: number }> {
  try {
    const [row] = await db
      .insert(cronRuns)
      .values({ kind, status: "running" })
      .returning({ id: cronRuns.id });
    return { id: row.id };
  } catch {
    // Table may not exist yet in envs without the migration applied.
    return { id: -1 };
  }
}

export async function finishCronRun(
  id: number,
  status: "success" | "error",
  opts: { result?: Record<string, unknown> | null; error?: string | null } = {}
): Promise<void> {
  if (id < 0) return;
  try {
    await db
      .update(cronRuns)
      .set({
        status,
        result: opts.result ?? null,
        error: opts.error ?? null,
        finishedAt: new Date(),
      })
      .where(eq(cronRuns.id, id));
  } catch {
    // swallow
  }
}

export async function listCronRuns(
  opts: { kind?: CronRunKind; limit?: number } = {}
): Promise<Array<typeof cronRuns.$inferSelect>> {
  const limit = opts.limit ?? 20;
  try {
    if (opts.kind) {
      return await db
        .select()
        .from(cronRuns)
        .where(eq(cronRuns.kind, opts.kind))
        .orderBy(desc(cronRuns.startedAt))
        .limit(limit);
    }
    return await db
      .select()
      .from(cronRuns)
      .orderBy(desc(cronRuns.startedAt))
      .limit(limit);
  } catch {
    return [];
  }
}

export async function getLatestByKind(): Promise<
  Record<string, typeof cronRuns.$inferSelect | undefined>
> {
  try {
    const rows = await db.execute(sql`
      SELECT DISTINCT ON (kind) id, kind, status, result, error, started_at, finished_at
      FROM cron_runs
      ORDER BY kind, started_at DESC
    `);
    const out: Record<string, typeof cronRuns.$inferSelect | undefined> = {};
    const asArray = Array.isArray(rows)
      ? rows
      : ((rows as { rows?: unknown[] }).rows ?? []);
    for (const r of asArray as Array<Record<string, unknown>>) {
      const kind = r.kind as string;
      out[kind] = {
        id: r.id as number,
        kind,
        status: r.status as string,
        result: (r.result as Record<string, unknown> | null) ?? null,
        error: (r.error as string | null) ?? null,
        startedAt: r.started_at as Date,
        finishedAt: (r.finished_at as Date | null) ?? null,
      } as typeof cronRuns.$inferSelect;
    }
    return out;
  } catch {
    return {};
  }
}

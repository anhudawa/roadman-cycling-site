import { db } from "@/lib/db";
import { deals, contacts } from "@/lib/db/schema";
import { and, desc, eq, gte, sql, isNotNull, isNull } from "drizzle-orm";
import { addActivity } from "./contacts";

export const DEAL_STAGES = [
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const;

export type DealStage = (typeof DEAL_STAGES)[number];

export const STAGE_LABELS: Record<DealStage, string> = {
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export interface StageColor {
  badge: string;
  ring: string;
  dot: string;
}

export const STAGE_COLORS: Record<DealStage, StageColor> = {
  qualified: {
    badge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    ring: "ring-indigo-500/40",
    dot: "bg-indigo-400",
  },
  proposal: {
    badge: "bg-coral/10 text-coral border-coral/30",
    ring: "ring-coral/50",
    dot: "bg-coral",
  },
  negotiation: {
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    ring: "ring-amber-500/40",
    dot: "bg-amber-400",
  },
  won: {
    badge: "bg-green-500/10 text-green-300 border-green-500/20",
    ring: "ring-green-500/40",
    dot: "bg-green-400",
  },
  lost: {
    badge: "bg-red-500/10 text-red-300/80 border-red-500/20",
    ring: "ring-red-500/30",
    dot: "bg-red-400/70",
  },
};

export function isDealStage(v: unknown): v is DealStage {
  return typeof v === "string" && (DEAL_STAGES as readonly string[]).includes(v);
}

export type Deal = typeof deals.$inferSelect;

export interface DealWithContact extends Deal {
  contactName: string | null;
  contactEmail: string | null;
}

export interface ListDealsParams {
  stage?: DealStage;
  ownerSlug?: string | null;
  contactId?: number;
}

export async function listDeals(
  params: ListDealsParams = {}
): Promise<DealWithContact[]> {
  const conditions = [];
  if (params.stage) conditions.push(eq(deals.stage, params.stage));
  if (params.ownerSlug === null) conditions.push(isNull(deals.ownerSlug));
  else if (params.ownerSlug) conditions.push(eq(deals.ownerSlug, params.ownerSlug));
  if (params.contactId) conditions.push(eq(deals.contactId, params.contactId));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const base = db
    .select({
      id: deals.id,
      contactId: deals.contactId,
      title: deals.title,
      valueCents: deals.valueCents,
      currency: deals.currency,
      stage: deals.stage,
      ownerSlug: deals.ownerSlug,
      source: deals.source,
      expectedCloseDate: deals.expectedCloseDate,
      closedAt: deals.closedAt,
      notes: deals.notes,
      createdAt: deals.createdAt,
      updatedAt: deals.updatedAt,
      contactName: contacts.name,
      contactEmail: contacts.email,
    })
    .from(deals)
    .leftJoin(contacts, eq(deals.contactId, contacts.id))
    .orderBy(desc(deals.updatedAt));

  const rows = whereClause ? await base.where(whereClause) : await base;
  return rows as DealWithContact[];
}

export async function getDealById(id: number): Promise<DealWithContact | null> {
  const rows = await db
    .select({
      id: deals.id,
      contactId: deals.contactId,
      title: deals.title,
      valueCents: deals.valueCents,
      currency: deals.currency,
      stage: deals.stage,
      ownerSlug: deals.ownerSlug,
      source: deals.source,
      expectedCloseDate: deals.expectedCloseDate,
      closedAt: deals.closedAt,
      notes: deals.notes,
      createdAt: deals.createdAt,
      updatedAt: deals.updatedAt,
      contactName: contacts.name,
      contactEmail: contacts.email,
    })
    .from(deals)
    .leftJoin(contacts, eq(deals.contactId, contacts.id))
    .where(eq(deals.id, id))
    .limit(1);
  return (rows[0] as DealWithContact) ?? null;
}

export interface CreateDealParams {
  contactId?: number | null;
  title: string;
  valueCents: number;
  currency?: string;
  stage?: DealStage;
  ownerSlug?: string | null;
  source?: string | null;
  expectedCloseDate?: string | null; // YYYY-MM-DD
  notes?: string | null;
}

export async function createDeal(params: CreateDealParams): Promise<Deal> {
  const stage: DealStage = params.stage ?? "qualified";
  const closedAt =
    stage === "won" || stage === "lost" ? new Date() : null;

  const inserted = await db
    .insert(deals)
    .values({
      contactId: params.contactId ?? null,
      title: params.title.trim(),
      valueCents: params.valueCents,
      currency: params.currency ?? "EUR",
      stage,
      ownerSlug: params.ownerSlug ?? null,
      source: params.source ?? null,
      expectedCloseDate: params.expectedCloseDate ?? null,
      closedAt,
      notes: params.notes ?? null,
    })
    .returning();
  return inserted[0];
}

export interface UpdateDealPatch {
  contactId?: number | null;
  title?: string;
  valueCents?: number;
  currency?: string;
  stage?: DealStage;
  ownerSlug?: string | null;
  source?: string | null;
  expectedCloseDate?: string | null;
  notes?: string | null;
}

export interface UpdateDealOptions {
  authorName?: string | null;
  authorSlug?: string | null;
}

export async function updateDeal(
  id: number,
  patch: UpdateDealPatch,
  options: UpdateDealOptions = {}
): Promise<Deal | null> {
  const existing = await db
    .select()
    .from(deals)
    .where(eq(deals.id, id))
    .limit(1);
  const current = existing[0];
  if (!current) return null;

  const updates: Partial<typeof deals.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (patch.contactId !== undefined) updates.contactId = patch.contactId;
  if (patch.title !== undefined) updates.title = patch.title.trim();
  if (patch.valueCents !== undefined) updates.valueCents = patch.valueCents;
  if (patch.currency !== undefined) updates.currency = patch.currency;
  if (patch.ownerSlug !== undefined) updates.ownerSlug = patch.ownerSlug;
  if (patch.source !== undefined) updates.source = patch.source;
  if (patch.expectedCloseDate !== undefined)
    updates.expectedCloseDate = patch.expectedCloseDate;
  if (patch.notes !== undefined) updates.notes = patch.notes;

  let stageChanged = false;
  const fromStage = current.stage as DealStage;
  let toStage: DealStage = fromStage;
  if (patch.stage !== undefined && patch.stage !== current.stage) {
    stageChanged = true;
    toStage = patch.stage;
    updates.stage = patch.stage;
    if (patch.stage === "won" || patch.stage === "lost") {
      updates.closedAt = new Date();
    } else {
      updates.closedAt = null;
    }
  }

  const updated = await db
    .update(deals)
    .set(updates)
    .where(eq(deals.id, id))
    .returning();
  const row = updated[0];

  if (stageChanged && row.contactId) {
    try {
      await addActivity(row.contactId, {
        type: "stage_change",
        title: `Deal "${row.title}" moved to ${STAGE_LABELS[toStage]}`,
        meta: {
          dealId: row.id,
          from: fromStage,
          to: toStage,
        },
        authorName: options.authorName ?? null,
        authorSlug: options.authorSlug ?? null,
      });
    } catch (err) {
      console.error("[deals] activity log failed", err);
    }
  }

  if (stageChanged) {
    try {
      const { runAutomations } = await import("./automations");
      await runAutomations({
        type: "deal.stage_changed",
        contactId: row.contactId ?? null,
        dealId: row.id,
        toStage,
        fromStage,
      });
    } catch (err) {
      console.error("[deals] automations failed", err);
    }
  }

  return row;
}

export async function deleteDeal(id: number): Promise<boolean> {
  const result = await db.delete(deals).where(eq(deals.id, id)).returning({ id: deals.id });
  return result.length > 0;
}

export interface DealStats {
  openPipelineValueCents: number;
  wonThisMonthCents: number;
  avgDealSizeCents: number;
  countsByStage: Record<DealStage, number>;
}

function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function getDealStats(): Promise<DealStats> {
  const stageRows = await db
    .select({
      stage: deals.stage,
      count: sql<number>`count(*)::int`,
      total: sql<number>`coalesce(sum(${deals.valueCents}),0)::bigint`,
    })
    .from(deals)
    .groupBy(deals.stage);

  const countsByStage: Record<DealStage, number> = {
    qualified: 0,
    proposal: 0,
    negotiation: 0,
    won: 0,
    lost: 0,
  };
  let openPipelineValueCents = 0;
  for (const r of stageRows) {
    if (isDealStage(r.stage)) {
      countsByStage[r.stage] = r.count;
      if (r.stage !== "won" && r.stage !== "lost") {
        openPipelineValueCents += Number(r.total);
      }
    }
  }

  const [wonRow] = await db
    .select({
      total: sql<number>`coalesce(sum(${deals.valueCents}),0)::bigint`,
    })
    .from(deals)
    .where(
      and(
        eq(deals.stage, "won"),
        isNotNull(deals.closedAt),
        gte(deals.closedAt, startOfMonth())
      )
    );

  const [avgRow] = await db
    .select({
      avg: sql<number>`coalesce(avg(${deals.valueCents}),0)::bigint`,
    })
    .from(deals)
    .where(eq(deals.stage, "won"));

  return {
    openPipelineValueCents,
    wonThisMonthCents: Number(wonRow?.total ?? 0),
    avgDealSizeCents: Number(avgRow?.avg ?? 0),
    countsByStage,
  };
}

export function formatCurrency(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  } catch {
    return `${currency} ${(cents / 100).toFixed(0)}`;
  }
}

import { requireAuth } from "@/lib/admin/auth";
import {
  DEAL_STAGES,
  getDealStats,
  listDeals,
  type DealStage,
  isDealStage,
} from "@/lib/crm/deals";
import { DealsBoard, type KanbanDeal, type StageMap } from "./_components/DealsBoard";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  await requireAuth();

  const [rows, stats] = await Promise.all([listDeals(), getDealStats()]);

  const stageMap: StageMap = {
    qualified: [],
    proposal: [],
    negotiation: [],
    won: [],
    lost: [],
  };

  for (const r of rows) {
    const stage: DealStage = isDealStage(r.stage) ? r.stage : "qualified";
    const card: KanbanDeal = {
      id: r.id,
      contactId: r.contactId,
      contactName: r.contactName,
      contactEmail: r.contactEmail,
      title: r.title,
      valueCents: r.valueCents,
      currency: r.currency,
      stage,
      ownerSlug: r.ownerSlug,
      source: r.source,
      expectedCloseDate: r.expectedCloseDate,
      closedAt: r.closedAt ? r.closedAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
    stageMap[stage].push(card);
  }

  const openCount =
    stats.countsByStage.qualified +
    stats.countsByStage.proposal +
    stats.countsByStage.negotiation;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl text-off-white tracking-wider uppercase">
            Deals
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            {DEAL_STAGES.reduce((s, st) => s + stageMap[st].length, 0)} total
          </p>
        </div>
      </div>
      <DealsBoard
        initialStages={stageMap}
        stats={{
          openPipelineValueCents: stats.openPipelineValueCents,
          wonThisMonthCents: stats.wonThisMonthCents,
          avgDealSizeCents: stats.avgDealSizeCents,
          openCount,
        }}
        defaultCurrency="EUR"
      />
    </div>
  );
}

import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/admin/auth";
import { getDealById, isDealStage, type DealStage } from "@/lib/crm/deals";
import { DealEditor } from "./_components/DealEditor";

export const dynamic = "force-dynamic";

export default async function DealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) notFound();
  const deal = await getDealById(id);
  if (!deal) notFound();

  const stage: DealStage = isDealStage(deal.stage) ? deal.stage : "qualified";

  return (
    <div className="p-6">
      <DealEditor
        deal={{
          id: deal.id,
          contactId: deal.contactId,
          contactName: deal.contactName,
          contactEmail: deal.contactEmail,
          title: deal.title,
          valueCents: deal.valueCents,
          currency: deal.currency,
          stage,
          ownerSlug: deal.ownerSlug,
          source: deal.source,
          expectedCloseDate: deal.expectedCloseDate,
          closedAt: deal.closedAt ? deal.closedAt.toISOString() : null,
          notes: deal.notes,
          createdAt: deal.createdAt.toISOString(),
          updatedAt: deal.updatedAt.toISOString(),
        }}
      />
    </div>
  );
}

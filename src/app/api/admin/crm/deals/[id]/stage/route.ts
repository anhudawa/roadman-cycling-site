import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { DEAL_STAGES, isDealStage, updateDeal } from "@/lib/crm/deals";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isDealStage(body.stage)) {
    return NextResponse.json(
      { error: "Invalid stage", allowed: DEAL_STAGES },
      { status: 400 }
    );
  }

  const updated = await updateDeal(
    id,
    { stage: body.stage },
    { authorName: user.name, authorSlug: user.slug }
  );
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    deal: {
      ...updated,
      closedAt: updated.closedAt ? updated.closedAt.toISOString() : null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}

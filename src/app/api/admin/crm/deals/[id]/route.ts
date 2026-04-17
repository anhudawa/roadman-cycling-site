import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import {
  deleteDeal,
  getDealById,
  isDealStage,
  updateDeal,
  type UpdateDealPatch,
} from "@/lib/crm/deals";

const ALLOWED_OWNERS = ["sarah", "wes", "matthew", "ted"];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const deal = await getDealById(id);
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    deal: {
      ...deal,
      closedAt: deal.closedAt ? deal.closedAt.toISOString() : null,
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString(),
    },
  });
}

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

  const patch: UpdateDealPatch = {};

  if (Object.prototype.hasOwnProperty.call(body, "title") && typeof body.title === "string") {
    patch.title = body.title;
  }
  if (Object.prototype.hasOwnProperty.call(body, "valueCents")) {
    const v =
      typeof body.valueCents === "number"
        ? body.valueCents
        : parseInt(String(body.valueCents), 10);
    if (!Number.isFinite(v)) {
      return NextResponse.json({ error: "Invalid valueCents" }, { status: 400 });
    }
    patch.valueCents = Math.max(0, v);
  }
  if (Object.prototype.hasOwnProperty.call(body, "currency") && typeof body.currency === "string") {
    patch.currency = body.currency.trim().toUpperCase();
  }
  if (Object.prototype.hasOwnProperty.call(body, "stage")) {
    if (!isDealStage(body.stage)) {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }
    patch.stage = body.stage;
  }
  if (Object.prototype.hasOwnProperty.call(body, "ownerSlug")) {
    if (body.ownerSlug === null || body.ownerSlug === "") {
      patch.ownerSlug = null;
    } else if (!ALLOWED_OWNERS.includes(String(body.ownerSlug))) {
      return NextResponse.json({ error: "Invalid owner" }, { status: 400 });
    } else {
      patch.ownerSlug = String(body.ownerSlug);
    }
  }
  if (Object.prototype.hasOwnProperty.call(body, "source")) {
    patch.source = body.source === null || body.source === "" ? null : String(body.source);
  }
  if (Object.prototype.hasOwnProperty.call(body, "expectedCloseDate")) {
    patch.expectedCloseDate =
      body.expectedCloseDate === null || body.expectedCloseDate === ""
        ? null
        : String(body.expectedCloseDate);
  }
  if (Object.prototype.hasOwnProperty.call(body, "notes")) {
    patch.notes = body.notes === null || body.notes === "" ? null : String(body.notes);
  }
  if (Object.prototype.hasOwnProperty.call(body, "contactId")) {
    if (body.contactId === null || body.contactId === "") {
      patch.contactId = null;
    } else {
      const parsed =
        typeof body.contactId === "number"
          ? body.contactId
          : parseInt(String(body.contactId), 10);
      if (Number.isNaN(parsed)) {
        return NextResponse.json({ error: "Invalid contactId" }, { status: 400 });
      }
      patch.contactId = parsed;
    }
  }

  const updated = await updateDeal(id, patch, {
    authorName: user.name,
    authorSlug: user.slug,
  });
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const ok = await deleteDeal(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

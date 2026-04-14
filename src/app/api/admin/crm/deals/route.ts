import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import {
  createDeal,
  isDealStage,
  listDeals,
  type DealStage,
} from "@/lib/crm/deals";

const ALLOWED_OWNERS = ["sarah", "wes", "matthew", "ted"];

export async function GET(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const stageParam = url.searchParams.get("stage");
  const ownerParam = url.searchParams.get("owner");
  const contactIdParam = url.searchParams.get("contactId");

  const stage: DealStage | undefined = isDealStage(stageParam) ? stageParam : undefined;
  const ownerSlug =
    ownerParam === "unassigned"
      ? null
      : ownerParam && ALLOWED_OWNERS.includes(ownerParam)
      ? ownerParam
      : undefined;
  const contactId = contactIdParam ? parseInt(contactIdParam, 10) : undefined;

  const rows = await listDeals({
    stage,
    ownerSlug: ownerSlug === undefined ? undefined : ownerSlug,
    contactId: contactId && !Number.isNaN(contactId) ? contactId : undefined,
  });

  return NextResponse.json({
    deals: rows.map((d) => ({
      ...d,
      closedAt: d.closedAt ? d.closedAt.toISOString() : null,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const valueCentsRaw =
    typeof body.valueCents === "number"
      ? body.valueCents
      : parseInt(String(body.valueCents ?? "0"), 10);
  const valueCents = Number.isFinite(valueCentsRaw) ? Math.max(0, valueCentsRaw) : 0;

  const currency =
    typeof body.currency === "string" && body.currency.trim()
      ? body.currency.trim().toUpperCase()
      : "EUR";

  let stage: DealStage = "qualified";
  if (body.stage !== undefined) {
    if (!isDealStage(body.stage)) {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }
    stage = body.stage;
  }

  let ownerSlug: string | null = null;
  if (body.ownerSlug) {
    if (!ALLOWED_OWNERS.includes(String(body.ownerSlug))) {
      return NextResponse.json({ error: "Invalid owner" }, { status: 400 });
    }
    ownerSlug = String(body.ownerSlug);
  } else {
    ownerSlug = user.slug;
  }

  let contactId: number | null = null;
  if (body.contactId !== undefined && body.contactId !== null && body.contactId !== "") {
    const parsed =
      typeof body.contactId === "number" ? body.contactId : parseInt(String(body.contactId), 10);
    if (Number.isNaN(parsed)) {
      return NextResponse.json({ error: "Invalid contactId" }, { status: 400 });
    }
    contactId = parsed;
  }

  const deal = await createDeal({
    contactId,
    title,
    valueCents,
    currency,
    stage,
    ownerSlug,
    source: typeof body.source === "string" ? body.source : null,
    expectedCloseDate:
      typeof body.expectedCloseDate === "string" && body.expectedCloseDate
        ? body.expectedCloseDate
        : null,
    notes: typeof body.notes === "string" ? body.notes : null,
  });

  return NextResponse.json({
    deal: {
      ...deal,
      closedAt: deal.closedAt ? deal.closedAt.toISOString() : null,
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString(),
    },
  });
}

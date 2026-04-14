import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { enrichContact } from "@/lib/crm/enrichment";
import { getContactById } from "@/lib/crm/contacts";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await getContactById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const result = await enrichContact(id);
    return NextResponse.json({
      beehiiv: result.beehiiv,
      stripe: result.stripe,
      changed: result.changed,
      enrichedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[api/enrich] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Enrichment failed" },
      { status: 500 }
    );
  }
}

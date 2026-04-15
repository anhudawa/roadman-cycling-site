import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { getContactById } from "@/lib/crm/contacts";
import { getScoreBand, scoreContact, writeScore } from "@/lib/crm/scoring";

export const runtime = "nodejs";

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

  const score = await scoreContact(id);
  await writeScore(id, score);
  const band = getScoreBand(score);

  return NextResponse.json({ ok: true, score, band });
}

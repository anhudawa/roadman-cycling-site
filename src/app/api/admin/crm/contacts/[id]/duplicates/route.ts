import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { getPotentialDuplicatesFor } from "@/lib/crm/dedup";

export async function GET(
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

  const candidates = await getPotentialDuplicatesFor(id);
  return NextResponse.json({ candidates });
}

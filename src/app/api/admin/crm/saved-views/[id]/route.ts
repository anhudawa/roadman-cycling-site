import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { deleteSavedView } from "@/lib/crm/saved-views";

export async function DELETE(
  _request: Request,
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
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const ok = await deleteSavedView(id, user.slug);
  if (!ok) {
    return NextResponse.json(
      { error: "Not found or not owner" },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true });
}

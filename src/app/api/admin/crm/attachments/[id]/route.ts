import { NextResponse } from "next/server";
import { requireAuth, type TeamUser } from "@/lib/admin/auth";
import { deleteAttachment } from "@/lib/crm/attachments";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user: TeamUser;
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

  const result = await deleteAttachment(id, {
    slug: user.slug,
    name: user.name,
    role: user.role,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}

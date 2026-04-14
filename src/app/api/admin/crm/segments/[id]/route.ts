import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import {
  countSegmentMembers,
  deleteSegment,
  getSegment,
  listSegmentMembers,
  sanitizeFilters,
  updateSegment,
  type UpdateSegmentPatch,
} from "@/lib/crm/segments";

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

  const segment = await getSegment(id);
  if (!segment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [count, members] = await Promise.all([
    countSegmentMembers(id),
    listSegmentMembers(id, { limit: 100, offset: 0 }),
  ]);

  return NextResponse.json({
    segment,
    count,
    members: members.map((c) => ({
      id: c.id,
      email: c.email,
      name: c.name,
      lifecycleStage: c.lifecycleStage,
      owner: c.owner,
      tags: c.tags,
      lastActivityAt: c.lastActivityAt ? c.lastActivityAt.toISOString() : null,
    })),
  });
}

export async function PATCH(
  request: Request,
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

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch: UpdateSegmentPatch = {};
  if (typeof body.name === "string") patch.name = body.name;
  if (body.description !== undefined) {
    patch.description = typeof body.description === "string" ? body.description.trim() || null : null;
  }
  if (body.filters !== undefined) patch.filters = sanitizeFilters(body.filters);

  const updated = await updateSegment(id, patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ segment: updated });
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

  const ok = await deleteSegment(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

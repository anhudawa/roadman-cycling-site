import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import {
  deleteFieldDef,
  updateFieldDef,
  type UpdateFieldDefPatch,
} from "@/lib/crm/custom-fields";
import type { CustomFieldOption } from "@/lib/db/schema";

function sanitizeOptions(v: unknown): CustomFieldOption[] {
  if (!Array.isArray(v)) return [];
  const out: CustomFieldOption[] = [];
  for (const item of v) {
    if (item && typeof item === "object") {
      const value = String((item as Record<string, unknown>).value ?? "").trim();
      const label =
        String((item as Record<string, unknown>).label ?? value).trim() || value;
      if (value) out.push({ label, value });
    }
  }
  return out;
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
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
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

  const patch: UpdateFieldDefPatch = {};
  if (typeof body.label === "string") patch.label = body.label;
  if (body.helpText !== undefined) {
    patch.helpText = typeof body.helpText === "string" ? body.helpText : null;
  }
  if (typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)) {
    patch.sortOrder = Math.trunc(body.sortOrder);
  }
  if (body.options !== undefined) {
    patch.options = sanitizeOptions(body.options);
  }

  try {
    const def = await updateFieldDef(id, patch);
    if (!def) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ def });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const ok = await deleteFieldDef(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

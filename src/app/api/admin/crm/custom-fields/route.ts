import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import {
  createFieldDef,
  listFieldDefs,
  isValidType,
} from "@/lib/crm/custom-fields";
import type { CustomFieldOption, CustomFieldType } from "@/lib/db/schema";

export async function GET() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const defs = await listFieldDefs();
  return NextResponse.json({ defs });
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const key = typeof body.key === "string" ? body.key.trim().toLowerCase() : "";
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const type = typeof body.type === "string" ? body.type : "";
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
  if (!label) return NextResponse.json({ error: "label required" }, { status: 400 });
  if (!isValidType(type)) return NextResponse.json({ error: "invalid type" }, { status: 400 });

  const options = sanitizeOptions(body.options);
  const helpText = typeof body.helpText === "string" ? body.helpText : null;
  const sortOrder =
    typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)
      ? Math.trunc(body.sortOrder)
      : 0;

  try {
    const def = await createFieldDef({
      key,
      label,
      type: type as CustomFieldType,
      options,
      helpText,
      sortOrder,
    });
    return NextResponse.json({ def });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

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

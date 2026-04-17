import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { mergeContacts } from "@/lib/crm/merge";

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  let body: { primaryId?: unknown; secondaryId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const primaryId = typeof body.primaryId === "number" ? body.primaryId : NaN;
  const secondaryId = typeof body.secondaryId === "number" ? body.secondaryId : NaN;
  if (!Number.isFinite(primaryId) || !Number.isFinite(secondaryId)) {
    return NextResponse.json({ error: "primaryId and secondaryId required (numbers)" }, { status: 400 });
  }
  if (primaryId === secondaryId) {
    return NextResponse.json({ error: "Cannot merge contact into itself" }, { status: 400 });
  }

  try {
    const summary = await mergeContacts(primaryId, secondaryId, user.slug);
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Merge failed";
    const code = /not found/i.test(msg) ? 404 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}

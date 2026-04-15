import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { mergeTags } from "@/lib/crm/tags";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    sources?: unknown;
    target?: unknown;
  };
  const sources =
    Array.isArray(body.sources) && body.sources.every((s) => typeof s === "string")
      ? (body.sources as string[])
      : null;
  const target = typeof body.target === "string" ? body.target : "";
  if (!sources || sources.length === 0 || !target) {
    return NextResponse.json({ error: "sources[] and target required" }, { status: 400 });
  }
  const touched = await mergeTags(sources, target);
  return NextResponse.json({ ok: true, touched });
}

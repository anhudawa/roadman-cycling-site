import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { syncStripeCustomers } from "@/lib/crm/sync";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { runId, result } = await syncStripeCustomers();
    return NextResponse.json({ ok: true, runId, result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { runAllPrompts } from "@/lib/citation-tests";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Manual run trigger for the citations admin page. Requires an authenticated
 * admin (not the cron secret) — different attack surface than the scheduled
 * job, so different gate.
 */
export async function POST() {
  const user = await requireAuth();
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const summary = await runAllPrompts();
    return NextResponse.json({ ok: true, summary });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

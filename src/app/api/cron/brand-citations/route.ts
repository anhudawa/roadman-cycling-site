import { NextRequest, NextResponse } from "next/server";
import { runAllPrompts } from "@/lib/citation-tests";

export const dynamic = "force-dynamic";
// Worst-case cost: ~12 prompts × 4 providers × ~5s = 4 minutes. Buffer to
// 5 minutes — Vercel's hobby plan caps at 60s but pro/team allow up to 300s.
export const maxDuration = 300;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const summary = await runAllPrompts();
    return NextResponse.json({ ok: true, summary });
  } catch (e) {
    console.error("[cron/brand-citations] failed:", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

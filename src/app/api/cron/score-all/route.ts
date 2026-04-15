import { NextRequest, NextResponse } from "next/server";
import { scoreAllContacts } from "@/lib/crm/scoring";

export const runtime = "nodejs";
export const maxDuration = 300;

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await scoreAllContacts();
  return NextResponse.json({ ok: result.errors.length === 0, ...result });
}

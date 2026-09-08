import { NextResponse } from "next/server";
import { verifyBearer } from "@/lib/security/bearer";
import { ndyApplicationFlowEnabled } from "@/lib/ndy/application-offer";
import { retryNdyOutbox } from "@/lib/ndy/application-workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !verifyBearer(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!ndyApplicationFlowEnabled()) return NextResponse.json({ enabled: false });
  return NextResponse.json(await retryNdyOutbox(), { headers: { "Cache-Control": "no-store" } });
}

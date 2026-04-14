import { NextResponse } from "next/server";
import { requireBloodEngineAccess } from "@/lib/blood-engine/access";
import { getRemainingHeadroom } from "@/lib/blood-engine/rate-limit";

/**
 * Returns the current rate-limit headroom for the signed-in user across both
 * limited actions. Used by the dashboard to show "X interpretations left
 * today" without exposing the underlying call log.
 */
export async function GET() {
  const user = await requireBloodEngineAccess();
  const [interpret, parsePdf] = await Promise.all([
    getRemainingHeadroom(user.id, "interpret"),
    getRemainingHeadroom(user.id, "parse-pdf"),
  ]);
  return NextResponse.json({
    interpret,
    "parse-pdf": parsePdf,
  });
}

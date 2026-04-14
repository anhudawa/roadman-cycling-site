import { NextResponse } from "next/server";
import { requireBloodEngineAccess } from "@/lib/blood-engine/access";
import { deleteUser } from "@/lib/blood-engine/db";
import { clearSessionCookie } from "@/lib/blood-engine/session";

/**
 * Hard-delete the signed-in Blood Engine user and all dependent rows
 * (reports, api-call log) via ON DELETE CASCADE.
 *
 *   POST /api/blood-engine/me/delete
 *   body: { confirm: "delete my account" }
 *
 * Stripe customer is intentionally NOT deleted — that's billing history we
 * may need to keep for tax purposes. The link from email → Blood Engine user
 * is severed so we can no longer correlate.
 */
export async function POST(request: Request) {
  const user = await requireBloodEngineAccess();

  let body: { confirm?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.confirm !== "delete my account") {
    return NextResponse.json(
      {
        error:
          "Confirmation phrase missing. Send {confirm: 'delete my account'} to proceed.",
      },
      { status: 400 }
    );
  }

  await deleteUser(user.id);
  await clearSessionCookie();

  return NextResponse.json({ ok: true, deletedUserId: user.id });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/admin/auth";
import { getMyDayData } from "@/lib/crm/dashboard";
import { renderDailyDigest, sendDigestEmail } from "@/lib/crm/digest";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getMyDayData(user);
  const rendered = renderDailyDigest(user, data);
  const result = await sendDigestEmail(user, rendered);

  if (result.status !== "sent") {
    return NextResponse.json(
      { ok: false, error: result.errorMessage ?? "send failed" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    to: user.email,
    subject: rendered.subject,
    resendId: result.resendId,
  });
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
  buildWeeklyDigestData,
  renderWeeklyDigest,
  sendWeeklyDigestEmail,
} from "@/lib/crm/weekly-digest";

export const dynamic = "force-dynamic";

export async function POST() {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await buildWeeklyDigestData();
  const rendered = renderWeeklyDigest(data);
  const result = await sendWeeklyDigestEmail(user.email, rendered);

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

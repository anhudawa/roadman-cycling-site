import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";

/**
 * Admin-only proxy that POSTs a test payload to /api/skool-webhook with the
 * configured SKOOL_WEBHOOK_SECRET attached. Lets the smoke-test button on
 * /admin/integrations/skool exercise the authenticated path without
 * leaking the secret to the browser.
 */
export async function POST(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.text();
  const secret = process.env.SKOOL_WEBHOOK_SECRET;
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host = request.headers.get("host") ?? "localhost:3000";
  const url = new URL(`/api/skool-webhook`, `${proto}://${host}`);
  if (secret) url.searchParams.set("secret", secret);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const respBody = await res.text();
  return new NextResponse(respBody, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

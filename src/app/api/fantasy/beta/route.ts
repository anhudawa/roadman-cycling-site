import { NextResponse } from "next/server";
import {
  BETA_COOKIE,
  betaCookieValue,
  betaGateEnabled,
  isValidBetaCode,
} from "@/lib/fantasy/beta-gate";

export const runtime = "nodejs";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // the beta window, generously
};

function grant(origin: string, code: string): NextResponse {
  if (!betaGateEnabled()) {
    return NextResponse.redirect(`${origin}/fantasy`, { status: 303 });
  }
  const response = NextResponse.redirect(
    `${origin}/fantasy${isValidBetaCode(code) ? "" : "?beta=invalid"}`,
    { status: 303 },
  );
  if (isValidBetaCode(code)) {
    response.cookies.set(BETA_COOKIE, betaCookieValue(), COOKIE_OPTS);
  }
  return response;
}

/** One-tap share link: /api/fantasy/beta?code=XYZ */
export async function GET(request: Request) {
  const url = new URL(request.url);
  return grant(url.origin, url.searchParams.get("code") ?? "");
}

/** The gate screen's form. */
export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const form = await request.formData().catch(() => null);
  const code = form?.get("code");
  return grant(origin, typeof code === "string" ? code : "");
}

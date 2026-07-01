import { NextResponse } from "next/server";
import { FANTASY_SESSION_COOKIE } from "@/lib/fantasy/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(`${origin}/fantasy`, { status: 303 });
  response.cookies.set(FANTASY_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}

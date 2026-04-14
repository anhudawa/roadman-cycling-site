import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/blood-engine/session";

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  await clearSessionCookie();
  return NextResponse.redirect(
    new URL("/blood-engine", process.env.NEXT_PUBLIC_SITE_URL || "https://roadmancycling.com")
  );
}

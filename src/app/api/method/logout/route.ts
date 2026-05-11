import { NextResponse } from "next/server";
import { clearMethodSessionCookie } from "@/lib/method/auth";

export async function POST() {
  await clearMethodSessionCookie();
  return NextResponse.json({ ok: true });
}

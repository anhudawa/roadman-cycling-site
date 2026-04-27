import { NextResponse } from "next/server";
import {
  verifyAndCreateToken,
  verifyAndCreateTokenForUser,
  COOKIE_NAME,
  SESSION_DURATION,
} from "@/lib/admin/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email: string | undefined = typeof body.email === "string" ? body.email : undefined;
    const password: string | undefined = typeof body.password === "string" ? body.password : undefined;

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    let token: string | null = null;
    let user: { id: number; slug: string; name: string; email: string; role: string } | null = null;

    if (email) {
      const result = await verifyAndCreateTokenForUser(email, password);
      if (result) {
        token = result.token;
        user = result.user;
      }
    } else {
      // Legacy password-only fallback (issues token for ted user).
      token = await verifyAndCreateToken(password);
    }

    if (!token) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, user });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION,
    });

    return response;
  } catch (error) {
    console.error("[Admin Login API] Error:", error);
    if (isDbUnavailableError(error)) {
      return NextResponse.json(
        { error: "Database is temporarily unavailable. Try again in a minute." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

function isDbUnavailableError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const seen = new Set<unknown>();
  let cur: unknown = err;
  while (cur && typeof cur === "object" && !seen.has(cur)) {
    seen.add(cur);
    const e = cur as Record<string, unknown>;
    const msg = typeof e.message === "string" ? e.message : "";
    if (
      e.code === "XX000" ||
      e.code === "missing_connection_string" ||
      msg.includes("compute time quota") ||
      msg.includes("missing_connection_string") ||
      msg.includes("ECONNREFUSED")
    ) {
      return true;
    }
    cur = (e as { cause?: unknown }).cause;
  }
  return false;
}

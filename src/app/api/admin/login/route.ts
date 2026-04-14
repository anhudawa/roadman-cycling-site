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
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

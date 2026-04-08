import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

export const COOKIE_NAME = "roadman_admin_session";
export const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/** Create a signed session token that is self-verifying (no server-side state). */
function createSignedToken(): string {
  const secret = process.env.ADMIN_PASSWORD ?? "fallback";
  const expiresAt = Date.now() + SESSION_DURATION * 1000;
  const payload = `admin:${expiresAt}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

/** Verify a signed token without needing server-side session state. */
function verifySignedToken(token: string): boolean {
  const secret = process.env.ADMIN_PASSWORD ?? "fallback";
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;

  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // Timing-safe comparison
  if (signature.length !== expectedSig.length) return false;
  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSig, "hex")
    )
  ) {
    return false;
  }

  // Check expiration
  const parts = payload.split(":");
  const expiresAt = parseInt(parts[1], 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}

/** Verify password and return a signed token (does NOT set cookie). */
export function verifyAndCreateToken(password: string): string | null {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("[Admin] ADMIN_PASSWORD env var is not set");
    return null;
  }

  if (hashPassword(password) !== hashPassword(adminPassword)) {
    return null;
  }

  return createSignedToken();
}

/** Legacy: verify password and set cookie via next/headers. */
export async function login(password: string): Promise<boolean> {
  const token = verifyAndCreateToken(password);
  if (!token) return false;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });

  return true;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySignedToken(token);
}

export async function requireAuth(): Promise<void> {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect("/admin/login");
  }
}

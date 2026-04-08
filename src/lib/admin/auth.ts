import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

const COOKIE_NAME = "roadman_admin_session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

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

export async function login(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  console.log("[Admin] ADMIN_PASSWORD set:", !!adminPassword, "length:", adminPassword?.length);
  if (!adminPassword) {
    console.error("[Admin] ADMIN_PASSWORD env var is not set");
    return false;
  }

  const inputHash = hashPassword(password);
  const storedHash = hashPassword(adminPassword);
  console.log("[Admin] Input hash:", inputHash.substring(0, 8), "Stored hash:", storedHash.substring(0, 8), "Match:", inputHash === storedHash);
  if (inputHash !== storedHash) {
    return false;
  }

  const token = createSignedToken();

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
  console.log("[Admin Auth] Cookie present:", !!token, token ? `length:${token.length}` : "");
  if (!token) return false;
  const valid = verifySignedToken(token);
  console.log("[Admin Auth] Token valid:", valid);
  return valid;
}

export async function requireAuth(): Promise<void> {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect("/admin/login");
  }
}

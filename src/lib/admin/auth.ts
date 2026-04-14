import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { db } from "@/lib/db";
import { teamUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/admin/password";

export const COOKIE_NAME = "roadman_admin_session";
export const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

export type TeamUserRole = "admin" | "member";

export interface TeamUser {
  id: number;
  slug: string;
  name: string;
  email: string;
  role: TeamUserRole;
}

function authSecret(): string {
  return process.env.AUTH_SECRET ?? process.env.ADMIN_PASSWORD ?? "fallback-dev-secret";
}

/** Create a signed session token bound to a user id. */
function createSignedTokenForUser(userId: number): string {
  const secret = authSecret();
  const expiresAt = Date.now() + SESSION_DURATION * 1000;
  const payload = `user:${userId}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

interface VerifiedPayload {
  userId: number;
  expiresAt: number;
}

/** Verify a signed token and return parsed payload, or null if invalid. */
function verifySignedToken(token: string): VerifiedPayload | null {
  const secret = authSecret();
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;

  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);

  const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  if (signature.length !== expectedSig.length) return null;
  try {
    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(expectedSig, "hex")
      )
    ) {
      return null;
    }
  } catch {
    return null;
  }

  const parts = payload.split(":");
  if (parts.length !== 3 || parts[0] !== "user") return null;
  const userId = parseInt(parts[1], 10);
  const expiresAt = parseInt(parts[2], 10);
  if (Number.isNaN(userId) || Number.isNaN(expiresAt)) return null;
  if (Date.now() > expiresAt) return null;

  return { userId, expiresAt };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toTeamUser(row: typeof teamUsers.$inferSelect): TeamUser {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    email: row.email,
    role: (row.role === "admin" ? "admin" : "member") as TeamUserRole,
  };
}

async function loadUserById(id: number): Promise<TeamUser | null> {
  const rows = await db.select().from(teamUsers).where(eq(teamUsers.id, id)).limit(1);
  const row = rows[0];
  if (!row || !row.active) return null;
  return toTeamUser(row);
}

async function loadUserByEmail(email: string): Promise<typeof teamUsers.$inferSelect | null> {
  const rows = await db
    .select()
    .from(teamUsers)
    .where(eq(teamUsers.email, normalizeEmail(email)))
    .limit(1);
  return rows[0] ?? null;
}

async function loadUserBySlug(slug: string): Promise<typeof teamUsers.$inferSelect | null> {
  const rows = await db.select().from(teamUsers).where(eq(teamUsers.slug, slug)).limit(1);
  return rows[0] ?? null;
}

/** Verify email+password, update lastLoginAt, return token + user. */
export async function verifyAndCreateTokenForUser(
  email: string,
  password: string
): Promise<{ token: string; user: TeamUser } | null> {
  if (!email || !password) return null;
  const row = await loadUserByEmail(email);
  if (!row || !row.active) return null;
  if (!row.passwordHash) return null; // unseeded user
  if (hashPassword(password) !== row.passwordHash) return null;

  await db
    .update(teamUsers)
    .set({ lastLoginAt: new Date() })
    .where(eq(teamUsers.id, row.id));

  return {
    token: createSignedTokenForUser(row.id),
    user: toTeamUser(row),
  };
}

/**
 * Legacy: password-only login. Tries the password against the `ted` user's hash
 * first; falls back to ADMIN_PASSWORD if set (issuing a token for ted). Kept so
 * existing bookmarks / scripts that post `{password}` keep working.
 */
export async function verifyAndCreateToken(password: string): Promise<string | null> {
  if (!password) return null;
  const tedRow = await loadUserBySlug("ted");
  const incomingHash = hashPassword(password);

  if (tedRow && tedRow.active && tedRow.passwordHash && incomingHash === tedRow.passwordHash) {
    await db.update(teamUsers).set({ lastLoginAt: new Date() }).where(eq(teamUsers.id, tedRow.id));
    return createSignedTokenForUser(tedRow.id);
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword && hashPassword(adminPassword) === incomingHash && tedRow && tedRow.active) {
    await db.update(teamUsers).set({ lastLoginAt: new Date() }).where(eq(teamUsers.id, tedRow.id));
    return createSignedTokenForUser(tedRow.id);
  }

  return null;
}

/** Legacy: verify password and set cookie. */
export async function login(password: string): Promise<boolean> {
  const token = await verifyAndCreateToken(password);
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

/** Returns the current user from the cookie, or null. */
export async function getCurrentUser(): Promise<TeamUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifySignedToken(token);
  if (!payload) return null;
  return loadUserById(payload.userId);
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/** Redirects to /admin/login if no user. Returns the current user otherwise. */
export async function requireAuth(): Promise<TeamUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}

/**
 * Admin-only gate. Redirects unauthenticated users to /admin/login, and
 * authenticated non-admins to /admin/my-day.
 */
export async function requireAdmin(): Promise<TeamUser> {
  const user = await requireAuth();
  if (user.role !== "admin") {
    redirect("/admin/my-day");
  }
  return user;
}

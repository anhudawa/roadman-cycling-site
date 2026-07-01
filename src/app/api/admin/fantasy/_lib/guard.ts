import { NextResponse } from "next/server";
import { getCurrentUser, type TeamUser } from "@/lib/admin/auth";

/**
 * Admin-role JSON gate shared by every fantasy admin route — same
 * behaviour as the team-users routes: 401 without a session, 403 for
 * authenticated non-admins.
 */
export async function requireAdminJson(): Promise<
  { user: TeamUser } | { error: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (user.role !== "admin") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { user };
}

export function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  return request
    .json()
    .then((body) => (typeof body === "object" && body !== null ? (body as Record<string, unknown>) : null))
    .catch(() => null);
}

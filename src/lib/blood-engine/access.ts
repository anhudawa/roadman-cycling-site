/**
 * Server-side auth guards for Blood Engine routes.
 *
 * Usage in a Server Component / Server Action:
 *   const user = await requireBloodEngineAccess();
 */

import { redirect } from "next/navigation";
import { getUserById, type BloodEngineUser } from "./db";
import { getSessionUserId } from "./session";

/**
 * Enforces a logged-in Blood Engine user WITH paid access.
 * - No session cookie → redirect to /blood-engine/login
 * - Session cookie but user no longer has access → redirect to /blood-engine (landing)
 */
export async function requireBloodEngineAccess(): Promise<BloodEngineUser> {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/blood-engine/login");
  }
  const user = await getUserById(userId);
  if (!user) {
    redirect("/blood-engine/login");
  }
  if (!user.hasAccess) {
    redirect("/blood-engine");
  }
  return user;
}

/** Returns the user (or null) without any redirect. */
export async function getBloodEngineUser(): Promise<BloodEngineUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return getUserById(userId);
}

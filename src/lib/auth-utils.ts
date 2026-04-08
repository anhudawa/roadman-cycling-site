import type { Session } from "next-auth";

/**
 * Check if the current session user is Anthony (founder).
 * Used for role-gating actions like approving ad reads.
 */
export function isAnthony(session: Session | null): boolean {
  return session?.user?.email?.toLowerCase() === "anthony@roadmancycling.com";
}

/**
 * Get the display name for a session user based on their email.
 */
export function getAdminDisplayName(session: Session | null): string {
  const email = session?.user?.email?.toLowerCase();
  switch (email) {
    case "anthony@roadmancycling.com":
      return "Anthony";
    case "sarah@roadmancycling.com":
      return "Sarah";
    case "wes@roadmancycling.com":
      return "Wes";
    default:
      return session?.user?.email ?? "Unknown";
  }
}

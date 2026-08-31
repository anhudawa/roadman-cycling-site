import { getMethodSession } from "@/lib/method/auth";
import { getRiderSession } from "@/lib/profile-auth/auth";
import { loadByEmail } from "@/lib/rider-profile/store";
import type { RiderProfile } from "@/lib/rider-profile/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function toPrefill(profile: RiderProfile | null) {
  if (!profile) return null;

  const weightKg =
    profile.currentWeight == null
      ? null
      : profile.weightUnit === "lb"
        ? Math.round(profile.currentWeight * 0.45359237 * 10) / 10
        : profile.currentWeight;

  return {
    weightKg,
    currentFtp: profile.currentFtp,
  };
}

/**
 * Return optional calculator defaults for the authenticated rider.
 *
 * This private endpoint keeps cookies and database reads away from the public,
 * statically generated search owner. It never exposes another rider's profile
 * and returns the same null shape to anonymous or invalid sessions.
 */
export async function GET() {
  const riderSession = await getRiderSession().catch(() => null);
  let profile = riderSession?.profile ?? null;

  if (!profile) {
    const methodSession = await getMethodSession().catch(() => null);
    if (methodSession?.enrollment.email) {
      profile = await loadByEmail(methodSession.enrollment.email).catch(
        () => null,
      );
    }
  }

  return Response.json(
    { prefill: toPrefill(profile) },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    },
  );
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getRiderSession } from "@/lib/profile-auth/auth";
import { getMethodSession } from "@/lib/method/auth";
import { upsertByEmail } from "@/lib/rider-profile/store";
import { subscribeToBeehiiv } from "@/lib/integrations/beehiiv";
import { riderProfileBeehiivFields } from "@/lib/rider-profile/beehiiv-fields";
import { KNOWN_RIDER_TOOLS } from "@/lib/rider-profile/types";

/**
 * POST /api/profile/update
 *
 * Authenticated. Patches the signed-in rider's profile, then fires
 * a best-effort Beehiiv custom-field sync so email segmentation
 * picks up the new values (training hours, discipline, limiter,
 * support level, etc.) without an admin job.
 *
 * The patch shape is `undefined` = "leave alone", `null` = "clear".
 * The endpoint hard-binds the email to the session — clients cannot
 * supply a different email here.
 */

const UpdateSchema = z
  .object({
    firstName: z.string().trim().max(80).nullable().optional(),
    ageRange: z.string().trim().max(20).nullable().optional(),
    discipline: z
      .enum(["road", "gravel", "sportive", "track", "general", "tt", "xc-mtb"])
      .nullable()
      .optional(),
    weeklyTrainingHours: z.number().int().min(0).max(50).nullable().optional(),
    currentFtp: z.number().int().min(50).max(600).nullable().optional(),
    currentWeight: z.number().min(30).max(200).nullable().optional(),
    weightUnit: z.enum(["kg", "lb"]).nullable().optional(),
    heightCm: z.number().int().min(120).max(230).nullable().optional(),
    currentTools: z
      .array(z.enum(KNOWN_RIDER_TOOLS))
      .max(KNOWN_RIDER_TOOLS.length)
      .optional(),
    targetEvent: z.string().trim().max(200).nullable().optional(),
    targetEventDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
    mainGoal: z.string().trim().max(500).nullable().optional(),
    biggestLimiter: z
      .enum(["fuelling", "strength", "intensity-distribution", "recovery"])
      .nullable()
      .optional(),
    bodyCompositionGoal: z.enum(["lose", "maintain", "gain"]).nullable().optional(),
    preferredSupportLevel: z
      .enum(["self_guided", "community", "coached"])
      .nullable()
      .optional(),
    injuryHistory: z.string().trim().max(2000).nullable().optional(),
  })
  .strict();

export async function POST(request: Request) {
  // Either a rider_session OR a method_session can authorise an update;
  // Method members are riders too, and the fuel-planner assessment lives
  // behind method_session.
  const rider = await getRiderSession().catch(() => null);
  let email = rider?.profile.email ?? null;
  if (!email) {
    const method = await getMethodSession().catch(() => null);
    email = method?.enrollment.email ?? null;
  }
  if (!email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = UpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  // Method sessions don't guarantee a rider_profiles row exists, so we
  // upsert by email and the store materialises one if needed.
  const profile = await upsertByEmail({
    email,
    ...parsed.data,
  });

  // Best-effort Beehiiv custom-field sync. Non-fatal — the profile
  // is already saved in Postgres before we touch the network.
  void subscribeToBeehiiv({
    email: profile.email,
    name: profile.firstName ?? undefined,
    customFields: riderProfileBeehiivFields(profile),
  }).catch((err) => console.error("[profile/update] Beehiiv sync failed:", err));

  return NextResponse.json({ ok: true, profile });
}

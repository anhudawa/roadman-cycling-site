import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { methodEnrollments } from "@/lib/method/schema";
import { getEnrollmentByEmail } from "@/lib/method/enrollments";

/**
 * Temporary admin seed route for testing the Method course flow.
 *
 * GET /api/method/seed?key=roadman-seed-2026
 *
 * Creates an active premium enrollment for anthony@roadmancycling.com
 * so the full login -> dashboard -> modules flow can be tested end-to-end.
 *
 * TODO: Remove after testing is complete.
 */

export const dynamic = "force-dynamic";

const SEED_KEY = "roadman-seed-2026";
const SEED_EMAIL = "anthony@roadmancycling.com";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (key !== SEED_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await getEnrollmentByEmail(SEED_EMAIL);

  if (existing) {
    return NextResponse.json({
      message: "Enrollment already exists",
      enrollment: {
        id: existing.id,
        email: existing.email,
        status: existing.status,
        createdAt: existing.createdAt,
      },
    });
  }

  const now = new Date();
  const inserted = await db
    .insert(methodEnrollments)
    .values({
      email: SEED_EMAIL,
      name: "Anthony",
      status: "active",
      paidAt: now,
      dripStartAt: now,
      amountCents: 0,
      currency: "gbp",
      notes: "Seeded via /api/method/seed for testing",
    })
    .returning();

  const enrollment = inserted[0];
  if (!enrollment) {
    return NextResponse.json(
      { error: "Failed to create enrollment" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "Enrollment created",
    enrollment: {
      id: enrollment.id,
      email: enrollment.email,
      status: enrollment.status,
      createdAt: enrollment.createdAt,
    },
  });
}

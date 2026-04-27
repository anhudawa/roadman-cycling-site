import { NextResponse } from "next/server";
import { buildWrappedFromInput } from "@/lib/season-wrapped/normalise";
import type { WrappedFormInput } from "@/lib/season-wrapped/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/wrapped
 *
 * Body: WrappedFormInput
 * Returns: { wrapped: WrappedData }
 *
 * Stateless — does not persist. Email captures fire to /api/wrapped/subscribe
 * separately so a rider can re-roll the cards without re-subscribing.
 */
export async function POST(request: Request) {
  let body: WrappedFormInput;
  try {
    body = (await request.json()) as WrappedFormInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (
    typeof body.totalDistanceKm !== "number" ||
    body.totalDistanceKm <= 0 ||
    body.totalDistanceKm > 100_000
  ) {
    return NextResponse.json(
      { error: "Total distance must be between 1 and 100000 km." },
      { status: 400 },
    );
  }
  if (
    typeof body.totalElevationM !== "number" ||
    body.totalElevationM < 0 ||
    body.totalElevationM > 500_000
  ) {
    return NextResponse.json(
      { error: "Total elevation must be between 0 and 500000 m." },
      { status: 400 },
    );
  }
  if (
    typeof body.totalTimeHours !== "number" ||
    body.totalTimeHours <= 0 ||
    body.totalTimeHours > 4_000
  ) {
    return NextResponse.json(
      { error: "Total time must be between 1 and 4000 hours." },
      { status: 400 },
    );
  }
  if (
    typeof body.totalRides !== "number" ||
    body.totalRides <= 0 ||
    body.totalRides > 1_000
  ) {
    return NextResponse.json(
      { error: "Total rides must be between 1 and 1000." },
      { status: 400 },
    );
  }
  if (
    typeof body.longestRideKm !== "number" ||
    body.longestRideKm <= 0 ||
    body.longestRideKm > 1500
  ) {
    return NextResponse.json(
      { error: "Longest ride must be between 1 and 1500 km." },
      { status: 400 },
    );
  }
  const year = Math.round(body.year ?? new Date().getFullYear());
  if (year < 2000 || year > 2100) {
    return NextResponse.json({ error: "Year out of range." }, { status: 400 });
  }

  const wrapped = buildWrappedFromInput({ ...body, year });
  return NextResponse.json({ wrapped });
}

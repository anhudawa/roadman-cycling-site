import { NextResponse } from "next/server";
import { MethodAuthError, requireMethodSession } from "@/lib/method/auth";
import { saveFuelState } from "@/lib/method/fuel-state";

/**
 * POST /api/method/fuel-planner
 *
 * Write-through persistence for the Fuel Planner state. The client saves to
 * localStorage for instant feedback and fires this in the background so the
 * plan survives a device change. Fire-and-forget from the client's side.
 *
 * We validate the envelope shape lightly (must have a profile + pattern +
 * updatedAt) and cap the payload, but otherwise store the blob opaquely —
 * the client owns the schema.
 */
export async function POST(request: Request) {
  try {
    const session = await requireMethodSession();
    const raw = await request.text();
    // Cap payload — the state is small; anything large is abuse.
    if (raw.length > 64_000) {
      return NextResponse.json({ error: "Payload too large." }, { status: 413 });
    }

    let state: unknown;
    try {
      state = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }

    if (
      typeof state !== "object" ||
      state === null ||
      !("profile" in state) ||
      !("pattern" in state)
    ) {
      return NextResponse.json(
        { error: "Missing fuel-planner state." },
        { status: 400 },
      );
    }

    await saveFuelState(session.enrollment.id, state);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof MethodAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[method/fuel-planner] Error:", err);
    return NextResponse.json(
      { error: "Could not save your fuel plan." },
      { status: 500 },
    );
  }
}

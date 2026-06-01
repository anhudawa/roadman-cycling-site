/**
 * Server-side persistence for the Fuel Planner state blob.
 *
 * Stores the whole client `FuelPlannerState` as jsonb, one row per
 * enrollment, upserted on every write-through from the client. The client
 * keeps localStorage as the fast/offline cache and reconciles with this by
 * `updatedAt`. We intentionally treat the blob opaquely here — the client
 * owns the shape; the API does light shape validation before it lands.
 */

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { methodFuelState } from "./schema";

export async function getFuelState(
  enrollmentId: number,
): Promise<unknown | null> {
  const rows = await db
    .select({ state: methodFuelState.state })
    .from(methodFuelState)
    .where(eq(methodFuelState.enrollmentId, enrollmentId))
    .limit(1);
  return rows[0]?.state ?? null;
}

export async function saveFuelState(
  enrollmentId: number,
  state: unknown,
): Promise<void> {
  await db
    .insert(methodFuelState)
    .values({ enrollmentId, state })
    .onConflictDoUpdate({
      target: methodFuelState.enrollmentId,
      set: { state, updatedAt: new Date() },
    });
}

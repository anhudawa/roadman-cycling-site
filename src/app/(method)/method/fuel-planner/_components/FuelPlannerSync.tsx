"use client";

import { useEffect, useState } from "react";
import {
  adoptServerState,
  loadState,
  type FuelPlannerState,
} from "@/lib/fuel-planner/storage";

interface FuelPlannerSyncProps {
  /** The rider's server-persisted state, or null if none saved yet. */
  serverState: FuelPlannerState | null;
  children: React.ReactNode;
}

/**
 * Cross-device reconcile gate for the Fuel Planner.
 *
 * The planner editors read localStorage once on mount, so we reconcile the
 * server copy with localStorage BEFORE they mount and only then render them.
 * Newer-wins by `updatedAt`:
 *   - server newer (or local empty) → adopt server into localStorage
 *   - local newer (or server empty) → push local up to the server
 * The reconcile is a synchronous localStorage read, so the gate flips ready
 * on the first effect tick — no perceptible flash beyond the editors' own
 * hydrate state.
 */
export function FuelPlannerSync({ serverState, children }: FuelPlannerSyncProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const local = loadState();
    const serverTime = serverState ? Date.parse(serverState.updatedAt) : -1;
    const localTime = local ? Date.parse(local.updatedAt) : -1;

    if (serverState && serverTime >= localTime) {
      // Server is the freshest copy (or local has nothing) — adopt it.
      if (!local || serverTime > localTime) adoptServerState(serverState);
    } else if (local && localTime > serverTime) {
      // This device has newer work — push it up so the server catches up.
      void fetch("/api/method/fuel-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(local),
        keepalive: true,
      }).catch(() => {
        // Offline / transient — the next save resyncs.
      });
    }
    // One-time mount reconcile gate (same pattern as the planner editors'
    // hydrate flag) — flips ready exactly once so children mount against
    // reconciled localStorage. Not a render loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, [serverState]);

  if (!ready) {
    return (
      <div className="rounded-xl border border-white/10 bg-charcoal/60 p-6">
        <p className="text-foreground-muted">Loading your plan…</p>
      </div>
    );
  }

  return <>{children}</>;
}

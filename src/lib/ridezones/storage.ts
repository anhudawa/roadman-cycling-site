/**
 * Client-side persistence for the RideZones app. Data never leaves the
 * browser — the analysis runs locally, so a rider's history stays theirs.
 */

import type { Activity, RiderSettings } from "./types";

const STORAGE_KEY = "roadman-ridezones-v1";

export interface StoredState {
  version: 1;
  settings: RiderSettings;
  activities: Activity[];
  savedAt: string;
}

export function loadStoredState(): StoredState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredState;
    if (parsed.version !== 1 || !parsed.settings || !Array.isArray(parsed.activities)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveStoredState(settings: RiderSettings, activities: Activity[]): void {
  if (typeof window === "undefined") return;
  try {
    const state: StoredState = {
      version: 1,
      settings,
      activities,
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota errors just mean the session won't persist — never break the app.
  }
}

export function clearStoredState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Fuel Planner — Client-side storage.
 *
 * localStorage-backed persistence for the rider's profile, weekly
 * session pattern, meal config and start date.
 *
 * v1 lives in the browser per device. A future swap to a server-side
 * `method_fuel_profiles` table happens behind this same API.
 */

'use client';

import { DEFAULT_MEAL_CONFIG, DEFAULT_WEEK_PATTERN, type WeekPattern } from './calendar';
import type { MealConfig, UserProfile } from './types';

const STORAGE_KEY = 'roadman.fuel-planner.v1';

export interface FuelPlannerState {
  profile: UserProfile;
  pattern: WeekPattern;
  meals: MealConfig[];
  startDate: string; // ISO YYYY-MM-DD — Monday of week 1
  updatedAt: string; // ISO timestamp
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Returns null if no profile has been saved yet, or storage is unavailable. */
export function loadState(): FuelPlannerState | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FuelPlannerState;
    if (!parsed.profile || !parsed.pattern) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: Omit<FuelPlannerState, 'updatedAt'>): void {
  if (!isBrowser()) return;
  const next: FuelPlannerState = {
    ...state,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  // Write-through to the server so the plan survives a device change.
  // Fire-and-forget — localStorage already gave instant feedback.
  void fetch('/api/method/fuel-planner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(next),
    keepalive: true,
  }).catch(() => {
    // Offline / transient — the next save resyncs.
  });
}

/**
 * Write a server-sourced state straight into localStorage WITHOUT echoing it
 * back to the server. Used by the cross-device reconcile on page load when
 * the server copy is newer (or local is empty).
 */
export function adoptServerState(state: FuelPlannerState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota / disabled — keep whatever is in memory.
  }
}

export function clearState(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function defaultProfile(): UserProfile {
  return {
    sex: 'male',
    age: 35,
    heightCm: 178,
    weightKg: 75,
    bodyCompGoal: 'maintain',
    deficitPct: 15,
    surplusPct: 10,
    ftp: 250,
    activityLevel: 'moderate',
  };
}

export function defaultState(): Omit<FuelPlannerState, 'updatedAt'> {
  return {
    profile: defaultProfile(),
    pattern: [...DEFAULT_WEEK_PATTERN] as unknown as WeekPattern,
    meals: DEFAULT_MEAL_CONFIG.map((m) => ({ ...m })),
    startDate: todayISO(),
  };
}

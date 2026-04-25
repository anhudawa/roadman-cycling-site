import type { ToolResult } from "./types";

/**
 * Typed narrowings of tool_result.inputs / outputs.
 *
 * The DB stores the payloads as opaque JSON to keep the schema generic,
 * but every server component + email template that reads a result needs
 * a type-safe lens. These helpers return typed views $— missing or
 * malformed values fall back to the least-surprising default so a
 * partially-corrupt row still renders.
 */

export interface FuellingInputs {
  durationMinutes: number;
  sessionType:
    | "recovery"
    | "endurance"
    | "tempo"
    | "sweetspot"
    | "threshold"
    | "vo2"
    | "race"
    | "intervals";
  watts: number;
  weightKg: number;
  gutTraining: "none" | "some" | "trained";
}

export interface FuellingOutputs {
  carbsPerHour: number;
  totalCarbs: number;
  fluidPerHour: number;
  totalFluid: number;
  sodiumPerHour: number;
  glucosePerHour: number;
  fructosePerHour: number;
  feedingInterval: number;
  startFuellingAt: number;
  dualSource: boolean;
  heatCategory: "cool" | "mild" | "warm" | "hot";
  weatherNote: string | null;
  intensityLabel: string;
  strategy: string[];
}

export interface FtpZonesInputs {
  ftp: number;
  weightKg: number | null;
  maxHr: number | null;
}

export interface FtpZonesOutputs {
  wkg: number | null;
  zones: Array<{ zone: string; label: string; lower: number; upper: number }>;
}

function num(x: unknown, fallback: number): number {
  const n = typeof x === "number" ? x : typeof x === "string" ? Number(x) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function str<T extends string>(x: unknown, fallback: T): T {
  return (typeof x === "string" ? x : fallback) as T;
}

function arr<T>(x: unknown, fallback: T[]): T[] {
  return Array.isArray(x) ? (x as T[]) : fallback;
}

export function fuellingInputs(result: ToolResult): FuellingInputs {
  const i = result.inputs ?? {};
  return {
    durationMinutes: num((i as Record<string, unknown>).durationMinutes, 0),
    sessionType: str((i as Record<string, unknown>).sessionType, "endurance") as FuellingInputs["sessionType"],
    watts: num((i as Record<string, unknown>).watts, 0),
    weightKg: num((i as Record<string, unknown>).weightKg, 0),
    gutTraining: str((i as Record<string, unknown>).gutTraining, "some") as FuellingInputs["gutTraining"],
  };
}

export function fuellingOutputs(result: ToolResult): FuellingOutputs {
  const o = (result.outputs ?? {}) as Record<string, unknown>;
  return {
    carbsPerHour: num(o.carbsPerHour, 0),
    totalCarbs: num(o.totalCarbs, 0),
    fluidPerHour: num(o.fluidPerHour, 0),
    totalFluid: num(o.totalFluid, 0),
    sodiumPerHour: num(o.sodiumPerHour, 0),
    glucosePerHour: num(o.glucosePerHour, 0),
    fructosePerHour: num(o.fructosePerHour, 0),
    feedingInterval: num(o.feedingInterval, 0),
    startFuellingAt: num(o.startFuellingAt, 0),
    dualSource: Boolean(o.dualSource),
    heatCategory: str(o.heatCategory, "mild") as FuellingOutputs["heatCategory"],
    weatherNote: typeof o.weatherNote === "string" ? o.weatherNote : null,
    intensityLabel: str(o.intensityLabel, "Endurance"),
    strategy: arr<string>(o.strategy, []),
  };
}

export function ftpZonesInputs(result: ToolResult): FtpZonesInputs {
  const i = (result.inputs ?? {}) as Record<string, unknown>;
  return {
    ftp: num(i.ftp, 0),
    weightKg: typeof i.weightKg === "number" ? i.weightKg : null,
    maxHr: typeof i.maxHr === "number" ? i.maxHr : null,
  };
}

export function ftpZonesOutputs(result: ToolResult): FtpZonesOutputs {
  const o = (result.outputs ?? {}) as Record<string, unknown>;
  return {
    wkg: typeof o.wkg === "number" ? o.wkg : null,
    zones: arr<FtpZonesOutputs["zones"][number]>(o.zones, []),
  };
}

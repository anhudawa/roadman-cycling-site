import type { ToolSlug } from "./types";

/**
 * Deterministic CRM tag set per tool completion. These tags flow into
 * Beehiiv and Roadman contacts so segmentation ("fuelled for >90g/hr",
 * "FTP zones pulled this week") stays trivial.
 *
 * Helper: keep tag values lowercase with hyphens $— matches the rest of
 * the CRM tag convention (plateau-diagnostic, profile-underRecovered).
 */

const BASE_BY_TOOL: Record<ToolSlug, string> = {
  plateau: "plateau-diagnostic",
  fuelling: "tool-fuelling",
  ftp_zones: "tool-ftp-zones",
};

export interface PlateauTagInput {
  primaryProfile: string; // from diagnostic scoring.primary
  secondary: string | null;
  severeMultiSystem: boolean;
  closeToBreakthrough: boolean;
  retakeNumber: number;
}

export function plateauTags(input: PlateauTagInput): string[] {
  const tags = [
    BASE_BY_TOOL.plateau,
    `profile-${input.primaryProfile}`,
  ];
  if (input.secondary) tags.push(`profile-secondary-${input.secondary}`);
  if (input.severeMultiSystem) tags.push("multi-system");
  if (input.closeToBreakthrough) tags.push("close-to-breakthrough");
  if (input.retakeNumber > 1) {
    tags.push("retake", `retake-${input.retakeNumber}`);
  }
  return tags;
}

export interface FuellingTagInput {
  intensity: string; // recovery | endurance | tempo | sweetspot | threshold | vo2 | race | intervals
  carbsPerHour: number;
  gutTraining: "none" | "some" | "trained";
  heatCategory: "cool" | "mild" | "warm" | "hot";
}

export function fuellingTags(input: FuellingTagInput): string[] {
  const tags = [
    BASE_BY_TOOL.fuelling,
    `fuelling-intensity-${input.intensity}`,
    `fuelling-gut-${input.gutTraining}`,
    `fuelling-heat-${input.heatCategory}`,
  ];
  if (input.carbsPerHour >= 90) tags.push("fuelling-high-carb");
  else if (input.carbsPerHour >= 60) tags.push("fuelling-mid-carb");
  else tags.push("fuelling-low-carb");
  return tags;
}

export interface FtpZonesTagInput {
  ftp: number;
  wkg: number | null;
}

export function ftpZonesTags(input: FtpZonesTagInput): string[] {
  const tags = [BASE_BY_TOOL.ftp_zones, `ftp-bucket-${ftpBucket(input.ftp)}`];
  if (input.wkg != null) tags.push(`wkg-bucket-${wkgBucket(input.wkg)}`);
  return tags;
}

function ftpBucket(ftp: number): string {
  if (ftp < 180) return "under-180";
  if (ftp < 220) return "180-219";
  if (ftp < 260) return "220-259";
  if (ftp < 300) return "260-299";
  if (ftp < 340) return "300-339";
  return "340-plus";
}

function wkgBucket(wkg: number): string {
  if (wkg < 2.5) return "under-2-5";
  if (wkg < 3.0) return "2-5-3";
  if (wkg < 3.5) return "3-3-5";
  if (wkg < 4.0) return "3-5-4";
  if (wkg < 4.5) return "4-4-5";
  return "4-5-plus";
}

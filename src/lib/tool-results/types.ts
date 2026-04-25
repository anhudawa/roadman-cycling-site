/**
 * Shared types for Phase 2 saved-diagnostic tool completions.
 *
 * Every calculator on the site (plateau diagnostic, fuelling calc,
 * FTP zone calc) writes its result through the `completeToolResult`
 * pipeline so admin analytics, the /results history view, and the
 * Ask Roadman hand-off all read from one place.
 */

export const TOOL_SLUGS = ["plateau", "fuelling", "ftp_zones"] as const;
export type ToolSlug = (typeof TOOL_SLUGS)[number];

export function isToolSlug(x: unknown): x is ToolSlug {
  return typeof x === "string" && (TOOL_SLUGS as readonly string[]).includes(x);
}

export interface ToolResultUtm {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  content?: string | null;
  term?: string | null;
}

export interface SaveToolResultInput {
  toolSlug: ToolSlug;
  email: string;
  riderProfileId: number | null;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  /** One-line summary shown in history lists. */
  summary: string;
  /** Grouping key for admin analytics (plateau profile, carb bucket$€¦). */
  primaryResult: string | null;
  tags: string[];
  utm?: ToolResultUtm | null;
  sourcePage?: string | null;
}

export interface ToolResult {
  id: number;
  slug: string;
  riderProfileId: number | null;
  email: string;
  toolSlug: ToolSlug;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  summary: string;
  primaryResult: string | null;
  tags: string[];
  utm: ToolResultUtm | null;
  sourcePage: string | null;
  emailSentAt: Date | null;
  askHandoffAt: Date | null;
  createdAt: Date;
}

/**
 * Row shape the /results list renders $€” the full outputs payload is
 * only loaded when the rider drills into an individual result page.
 */
export interface ToolResultSummary {
  slug: string;
  toolSlug: ToolSlug;
  summary: string;
  primaryResult: string | null;
  createdAt: Date;
}

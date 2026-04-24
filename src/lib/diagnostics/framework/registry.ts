import type { ToolSlug } from "@/lib/tool-results/types";
import type { DiagnosticDefinition } from "./types";

import { plateauDefinition } from "../definitions/plateau";
import { fuellingDefinition } from "../definitions/fuelling";
import { ftpZonesDefinition } from "../definitions/ftp-zones";

/**
 * In-memory registry of every tool definition. Each definition is
 * the source of truth; the `diagnostic_definitions` table is a
 * write-through snapshot for admin review + audit.
 */
const DEFS: Record<ToolSlug, DiagnosticDefinition> = {
  plateau: plateauDefinition,
  fuelling: fuellingDefinition,
  ftp_zones: ftpZonesDefinition,
};

export function getDefinition(toolSlug: ToolSlug): DiagnosticDefinition {
  const def = DEFS[toolSlug];
  if (!def) throw new Error(`Unknown diagnostic tool: ${toolSlug}`);
  return def;
}

export function listDefinitions(): DiagnosticDefinition[] {
  return Object.values(DEFS);
}

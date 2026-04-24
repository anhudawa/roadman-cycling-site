import { db } from "@/lib/db";
import { mcpCallLogs } from "@/lib/db/schema";
import { createHash } from "crypto";

export interface LogEntry {
  toolName: string;
  input: unknown;
  durationMs: number;
  success: boolean;
  error?: string;
  ip: string;
}

export async function logMcpCall(entry: LogEntry): Promise<void> {
  try {
    const ipHash = createHash("sha256")
      .update(entry.ip)
      .digest("hex")
      .slice(0, 16);
    const inputTruncated = JSON.stringify(entry.input).slice(0, 500);
    await db.insert(mcpCallLogs).values({
      toolName: entry.toolName,
      inputTruncated,
      durationMs: entry.durationMs,
      success: entry.success,
      error: entry.error ?? null,
      ipHash,
    });
  } catch {
    // Logging must never crash the MCP response
  }
}

import { NextResponse } from "next/server";
import { loadSeedContext } from "@/lib/ask/seed";
import { markAskHandoff } from "@/lib/tool-results/store";

/**
 * Seed-context resolver for Ask Roadman handoffs.
 *
 * When a rider clicks "Ask Roadman what this means" from a tool result
 * or diagnostic page, the /ask link carries ?seed_tool=X&seed_result=Y.
 * The chat client calls this endpoint first to paint the "context from
 * your saved result" banner; the orchestrator separately re-resolves
 * the seed server-side to inject into the system prompt, so the client
 * can't spoof the context.
 */

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const tool = url.searchParams.get("tool") ?? "";
  const slug = url.searchParams.get("slug") ?? "";
  if (!tool || !slug) {
    return NextResponse.json(
      { error: "Missing tool or slug" },
      { status: 400 },
    );
  }

  const seed = await loadSeedContext(tool, slug).catch(() => null);
  if (!seed) return NextResponse.json({ seed: null }, { status: 404 });

  // Stamp the first-handoff timestamp for tool_result-backed seeds.
  // Plateau lives in a different table and tracks its own email/handoff
  // state, so we skip it here.
  if (seed.kind === "fuelling" || seed.kind === "ftp_zones") {
    void markAskHandoff(slug).catch((err) =>
      console.error("[ask/seed] markAskHandoff failed:", err),
    );
  }

  return NextResponse.json({ seed });
}

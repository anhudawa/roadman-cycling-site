"use client";

import Link from "next/link";
import { TOOL_EVENTS, trackTool } from "@/lib/analytics/tool-events";
import type { ToolSlug } from "@/lib/tool-results/types";

/**
 * Small client button — navigates to Ask Roadman with the seed
 * params, and fires the handoff analytics event so we can measure
 * tool→AI conversion in the admin dashboard.
 */

interface Props {
  tool: ToolSlug;
  slug: string;
  summary: string;
  variant?: "primary" | "secondary";
}

export function AskFromResult({ tool, slug, variant = "primary" }: Props) {
  const href = `/ask?seed_tool=${tool}&seed_result=${encodeURIComponent(slug)}`;
  const onClick = () => {
    trackTool({
      name: TOOL_EVENTS.DIAGNOSTIC_TO_AI_HANDOFF,
      tool,
      resultSlug: slug,
      meta: { from: "result-page" },
    });
  };

  if (variant === "secondary") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="inline-flex items-center gap-2 font-heading tracking-wider uppercase text-sm bg-white/5 hover:bg-white/10 text-off-white px-4 py-2 rounded-md border border-white/10 transition-colors"
      >
        Ask Roadman what this means →
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className="inline-flex items-center gap-2 font-heading tracking-wider uppercase text-sm bg-coral hover:bg-coral-hover text-off-white px-5 py-3 rounded-md transition-colors"
    >
      Ask Roadman what this means →
    </Link>
  );
}

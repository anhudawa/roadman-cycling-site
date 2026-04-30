"use client";

import Link from "next/link";
import { TOOL_EVENTS, trackTool } from "@/lib/analytics/tool-events";

/**
 * Results-page handoff into Ask Roadman. The link carries
 * ?seed_tool / ?seed_result so the Ask page can pre-seed the
 * conversation with the rider's diagnostic context.
 *
 * Client component only because we fire an analytics event on click
 * — the href itself is plain and works without JS.
 */

interface Props {
  slug: string;
  profile: string;
  /** Rendering variant — inline card or CTA stripe. */
  variant?: "card" | "stripe";
}

export function AskRoadmanHandoff({ slug, profile, variant = "card" }: Props) {
  const href = `/ask?seed_tool=plateau&seed_result=${encodeURIComponent(slug)}`;
  const onClick = () => {
    trackTool({
      name: TOOL_EVENTS.DIAGNOSTIC_TO_AI_HANDOFF,
      tool: "plateau",
      resultSlug: slug,
      meta: { profile },
    });
  };

  if (variant === "stripe") {
    return (
      <Link
        href={href}
        onClick={onClick}
        data-cta="ask-roadman-handoff"
        className="inline-flex items-center gap-2 font-heading tracking-wider uppercase text-sm bg-white/5 hover:bg-white/10 text-off-white px-4 py-2 rounded-md border border-white/10 transition-colors"
      >
        Ask Roadman what this means →
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-coral/30 bg-coral/5 p-5">
      <p className="text-coral font-heading text-xs tracking-widest mb-2">
        WANT TO GO DEEPER?
      </p>
      <p className="text-off-white/90 leading-relaxed mb-4">
        Open this diagnosis in Ask Roadman — the on-site assistant can
        dig into why you got this profile, what to focus on first, and
        what the podcast roster says about fixing it.
      </p>
      <Link
        href={href}
        onClick={onClick}
        data-cta="ask-roadman-handoff"
        className="inline-flex items-center gap-2 font-heading tracking-wider uppercase text-sm bg-coral hover:bg-coral-hover text-off-white px-5 py-2.5 rounded-md transition-colors"
      >
        Ask Roadman what this means →
      </Link>
    </div>
  );
}

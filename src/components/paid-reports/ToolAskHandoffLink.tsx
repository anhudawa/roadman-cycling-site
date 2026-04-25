"use client";

import Link from "next/link";
import {
  PAID_REPORT_EVENTS,
  trackPaidReport,
} from "@/lib/analytics/paid-report-events";

/**
 * Wraps the /results/[tool]/[slug] → /ask handoff link so the click
 * fires a typed event (surfacing in the Diagnostics dashboard's
 * "Ask handoffs" column via tool-events aggregation on toolResults)
 * and in the paid-report funnel breakdown.
 */

interface Props {
  href: string;
  toolSlug: string;
  resultSlug: string;
  children: React.ReactNode;
  className?: string;
}

export function ToolAskHandoffLink({
  href,
  toolSlug,
  resultSlug,
  children,
  className,
}: Props) {
  function handleClick() {
    trackPaidReport({
      name: PAID_REPORT_EVENTS.TOOL_ASK_HANDOFF,
      toolResultSlug: resultSlug,
      meta: { tool: toolSlug },
    });
  }
  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}

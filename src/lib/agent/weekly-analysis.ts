import Anthropic from "@anthropic-ai/sdk";
import { WEEKLY_ANALYSIS_SYSTEM_PROMPT } from "./prompts";
import type { PageStats, PeriodStats, LeadEntry, ReferrerStats, DeviceStats } from "@/lib/admin/events-store";

const client = new Anthropic();

// ── Types ────────────────────────────────────────────────
export interface WeeklyPageAnalysis {
  page: string;
  views: number;
  signups: number;
  conversionRate: number;
  assessment: string;
  recommendation: string;
}

export interface SuggestedExperiment {
  page: string;
  element: string;
  currentContent: string;
  suggestedVariants: string[];
}

export interface WeeklyReport {
  summary: string;
  pageAnalyses: WeeklyPageAnalysis[];
  suggestedExperiments: SuggestedExperiment[];
  priorityActions: string[];
}

export interface WeeklyReportInput {
  pageStats: PageStats[];
  trafficStats: {
    topPages: { page: string; views: number }[];
    referrers: ReferrerStats[];
    devices: DeviceStats[];
  };
  leadStats: LeadEntry[];
  period: PeriodStats;
}

// ── Generator ────────────────────────────────────────────
export async function generateWeeklyReport(
  data: WeeklyReportInput
): Promise<WeeklyReport> {
  const userMessage = `Here is the past 7 days of data for Roadman Cycling's website:

## Overall Period Stats
- Visitors: ${data.period.visitors}
- Signups: ${data.period.signups}
- Conversion Rate: ${data.period.conversionRate.toFixed(2)}%
- Skool Trials: ${data.period.skoolTrials}

## Per-Page Performance
${data.pageStats
  .map(
    (p) =>
      `- ${p.page}: ${p.views} views, ${p.signups} signups (${p.conversionRate.toFixed(2)}% CVR)`
  )
  .join("\n")}

## Top Traffic Sources
${data.trafficStats.referrers
  .slice(0, 10)
  .map((r) => `- ${r.referrer}: ${r.count} visits`)
  .join("\n")}

## Device Breakdown
${data.trafficStats.devices
  .map((d) => `- ${d.device}: ${d.count} (${d.percentage.toFixed(1)}%)`)
  .join("\n")}

## Recent Leads (last ${data.leadStats.length})
${data.leadStats
  .slice(0, 10)
  .map((l) => `- ${l.source} on ${l.date.split("T")[0]}`)
  .join("\n")}

Analyze this data and provide your weekly CRO report.`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-20250414",
      max_tokens: 2048,
      system: WEEKLY_ANALYSIS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text in Claude response");
    }

    // Parse JSON — strip any accidental markdown fences
    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const report: WeeklyReport = JSON.parse(jsonText);

    return report;
  } catch (err) {
    console.error("[WeeklyAnalysis] Error generating report:", err);

    // Return a fallback report rather than throwing
    return {
      summary:
        "Unable to generate AI analysis at this time. Review the raw data in the dashboard.",
      pageAnalyses: data.pageStats.map((p) => ({
        page: p.page,
        views: p.views,
        signups: p.signups,
        conversionRate: p.conversionRate,
        assessment: "Analysis unavailable",
        recommendation: "Review manually",
      })),
      suggestedExperiments: [],
      priorityActions: [
        "AI analysis failed — check ANTHROPIC_API_KEY configuration",
        "Review dashboard data manually for this week",
      ],
    };
  }
}

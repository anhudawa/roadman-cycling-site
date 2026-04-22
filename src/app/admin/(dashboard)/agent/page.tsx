"use client";

import { useState } from "react";
import Link from "next/link";
import { DownloadReportButton } from "./download-report-button";
import { Card, CardBody } from "@/components/admin/ui";

interface WeeklyPageAnalysis {
  page: string;
  views: number;
  signups: number;
  conversionRate: number;
  assessment: string;
  recommendation: string;
}

interface SuggestedExperiment {
  page: string;
  element: string;
  currentContent: string;
  suggestedVariants: string[];
}

interface WeeklyReport {
  summary: string;
  pageAnalyses: WeeklyPageAnalysis[];
  suggestedExperiments: SuggestedExperiment[];
  priorityActions: string[];
}

interface AnalysisResponse {
  ok: boolean;
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  report: WeeklyReport;
}

export default function AgentPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/agent/weekly-analysis", {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to run analysis");
      }
      const data: AnalysisResponse = await res.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run analysis");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider">
          AI ANALYSIS AGENT
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Automated insights and optimization suggestions
        </p>
      </div>

      {/* Schedule info + Run button */}
      <div className="flex items-center justify-between gap-4">
        <div className="bg-[var(--color-bad-tint)] border border-[var(--color-border-strong)] rounded-xl p-4 flex items-center gap-3 flex-1">
          <svg
            className="w-5 h-5 text-[var(--color-bad)] flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <p className="text-sm text-off-white">
            Weekly analysis runs every Monday at 8am
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {analysis && <DownloadReportButton analysis={analysis} />}
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="px-4 py-2.5 bg-[var(--color-coral)] hover:bg-[var(--color-bad-tint)] disabled:bg-[var(--color-bad-tint)] disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
          {loading ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analysing...
            </>
          ) : (
            "Run Analysis Now"
          )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Report */}
      {analysis ? (
        <>
          {/* Meta */}
          <div className="text-xs text-foreground-subtle">
            Generated {new Date(analysis.generatedAt).toLocaleString("en-GB")}
            {" | "}
            Period: {new Date(analysis.periodStart).toLocaleDateString("en-GB")}{" "}
            &mdash;{" "}
            {new Date(analysis.periodEnd).toLocaleDateString("en-GB")}
          </div>

          {/* Summary */}
          <Card>
            <CardBody compact>
              <h2 className="font-body font-semibold text-[13px] text-[var(--color-fg)] mb-3">
                Summary
              </h2>
              <p className="text-sm text-off-white leading-relaxed">
                {analysis.report.summary}
              </p>
            </CardBody>
          </Card>

          {/* Page Analyses */}
          {analysis.report.pageAnalyses.length > 0 && (
            <Card>
              <CardBody compact>
              <h2 className="font-body font-semibold text-[13px] text-[var(--color-fg)] mb-4">
                Page performance
              </h2>
              <div className="space-y-3">
                {analysis.report.pageAnalyses.map((pa) => (
                  <div
                    key={pa.page}
                    className="p-4 rounded-lg border border-white/5 bg-white/[0.02]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-off-white font-medium">
                        {pa.page}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-foreground-subtle">
                        <span>{pa.views.toLocaleString()} views</span>
                        <span>{pa.signups} signups</span>
                        <span>{pa.conversionRate.toFixed(2)}% CVR</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground-muted mb-1">
                      {pa.assessment}
                    </p>
                    <p className="text-xs text-[var(--color-bad)]">{pa.recommendation}</p>
                  </div>
                ))}
              </div>
              </CardBody>
            </Card>
          )}

          {/* Suggested Experiments */}
          {analysis.report.suggestedExperiments.length > 0 && (
            <Card>
              <CardBody compact>
              <h2 className="font-body font-semibold text-[13px] text-[var(--color-fg)] mb-4">
                Suggested experiments
              </h2>
              <div className="space-y-3">
                {analysis.report.suggestedExperiments.map((exp, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border border-white/5 bg-white/[0.02]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[var(--color-bad)] text-sm font-heading">
                            {i + 1}.
                          </span>
                          <span className="text-sm text-off-white font-medium">
                            {exp.page} &mdash; {exp.element}
                          </span>
                        </div>
                        <p className="text-xs text-foreground-subtle mb-2">
                          Current: &ldquo;{exp.currentContent}&rdquo;
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {exp.suggestedVariants.map((v, vi) => (
                            <span
                              key={vi}
                              className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-foreground-muted"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Link
                        href={`/admin/experiments/new?page=${encodeURIComponent(exp.page)}&element=${encodeURIComponent(exp.element)}&content=${encodeURIComponent(exp.currentContent)}`}
                        className="text-xs text-[var(--color-bad)] hover:text-[var(--color-fg)]/80 transition-colors px-3 py-1.5 border border-[var(--color-border-strong)] rounded-lg flex-shrink-0 hover:bg-[var(--color-bad-tint)]"
                      >
                        Create This Test
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              </CardBody>
            </Card>
          )}

          {/* Priority Actions */}
          {analysis.report.priorityActions.length > 0 && (
            <Card>
              <CardBody compact>
              <h2 className="font-body font-semibold text-[13px] text-[var(--color-fg)] mb-4">
                Priority actions
              </h2>
              <div className="space-y-2">
                {analysis.report.priorityActions.map((action, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                  >
                    <span className="text-[var(--color-bad)] text-sm font-heading mt-0.5">
                      {i + 1}.
                    </span>
                    <p className="text-sm text-off-white leading-relaxed">
                      {action}
                    </p>
                  </div>
                ))}
              </div>
              </CardBody>
            </Card>
          )}
        </>
      ) : (
        /* Placeholder when no report has been run */
        <Card>
          <CardBody compact>
          <h2 className="font-body font-semibold text-[13px] text-[var(--color-fg)] mb-4">
            Latest report
          </h2>
          <div className="h-48 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg gap-3">
            <svg
              className="w-8 h-8 text-foreground-subtle"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z"
              />
            </svg>
            <p className="text-foreground-subtle text-sm">
              No analysis reports yet. Click &ldquo;Run Analysis Now&rdquo; or wait for the Monday
              scheduled run.
            </p>
          </div>
          </CardBody>
        </Card>
      )}

      {/* Config note */}
      <Card>
        <CardBody compact>
          <p className="text-foreground-subtle text-xs">
            The AI agent analyzes traffic patterns, conversion data, and content performance to
            generate weekly reports with actionable recommendations. Configure the agent schedule and
            data sources in your environment variables.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

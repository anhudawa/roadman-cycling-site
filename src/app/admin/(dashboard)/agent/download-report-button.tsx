"use client";

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
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  report: WeeklyReport;
}

export function DownloadReportButton({ analysis }: { analysis: AnalysisResponse }) {
  function handleDownload() {
    const r = analysis.report;
    const periodStart = new Date(analysis.periodStart).toLocaleDateString("en-GB");
    const periodEnd = new Date(analysis.periodEnd).toLocaleDateString("en-GB");
    const generated = new Date(analysis.generatedAt).toLocaleString("en-GB");

    let md = `# Roadman Cycling $— Weekly Analysis Report\n\n`;
    md += `**Period:** ${periodStart} $— ${periodEnd}\n`;
    md += `**Generated:** ${generated}\n\n`;
    md += `---\n\n`;

    md += `## Summary\n\n${r.summary}\n\n`;

    if (r.pageAnalyses.length > 0) {
      md += `## Page Performance\n\n`;
      for (const pa of r.pageAnalyses) {
        md += `### ${pa.page}\n\n`;
        md += `- **Views:** ${pa.views.toLocaleString()}\n`;
        md += `- **Signups:** ${pa.signups}\n`;
        md += `- **Conversion Rate:** ${pa.conversionRate.toFixed(2)}%\n`;
        md += `- **Assessment:** ${pa.assessment}\n`;
        md += `- **Recommendation:** ${pa.recommendation}\n\n`;
      }
    }

    if (r.suggestedExperiments.length > 0) {
      md += `## Suggested Experiments\n\n`;
      r.suggestedExperiments.forEach((exp, i) => {
        md += `### ${i + 1}. ${exp.page} $— ${exp.element}\n\n`;
        md += `**Current:** "${exp.currentContent}"\n\n`;
        md += `**Suggested variants:**\n`;
        for (const v of exp.suggestedVariants) {
          md += `- ${v}\n`;
        }
        md += `\n`;
      });
    }

    if (r.priorityActions.length > 0) {
      md += `## Priority Actions\n\n`;
      r.priorityActions.forEach((action, i) => {
        md += `${i + 1}. ${action}\n`;
      });
      md += `\n`;
    }

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roadman-weekly-analysis-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleDownload}
      className="px-3 py-1.5 bg-white/5 text-foreground-muted hover:text-off-white hover:bg-white/10 text-xs font-medium rounded-lg transition-colors border border-white/10"
    >
      Download Report
    </button>
  );
}

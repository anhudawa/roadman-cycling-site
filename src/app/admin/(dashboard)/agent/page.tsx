const SUGGESTED_EXPERIMENTS = [
  "Test shorter vs longer homepage hero copy to improve scroll depth",
  "A/B test email signup placement: above-fold vs after first content block",
  "Compare social proof (subscriber count) vs benefit-driven CTA on blog posts",
  "Test podcast episode page layout: audio player top vs content-first",
];

export default async function AgentPage() {
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

      {/* Schedule info */}
      <div className="bg-coral/10 border border-coral/20 rounded-xl p-4 flex items-center gap-3">
        <svg className="w-5 h-5 text-coral flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <p className="text-sm text-off-white">
          Weekly analysis runs every Monday at 8am
        </p>
      </div>

      {/* Latest report placeholder */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
          LATEST REPORT
        </h2>
        <div className="h-48 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg gap-3">
          <svg className="w-8 h-8 text-foreground-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
          </svg>
          <p className="text-foreground-subtle text-sm">
            No analysis reports yet. The first report will generate on the next Monday run.
          </p>
        </div>
      </div>

      {/* Suggested experiments */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
          SUGGESTED EXPERIMENTS
        </h2>
        <div className="space-y-2.5">
          {SUGGESTED_EXPERIMENTS.map((suggestion, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-colors"
            >
              <span className="text-coral text-sm font-heading mt-0.5">{i + 1}.</span>
              <p className="text-sm text-off-white leading-relaxed">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Config note */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-4">
        <p className="text-foreground-subtle text-xs">
          The AI agent analyzes traffic patterns, conversion data, and content performance to generate
          weekly reports with actionable recommendations. Configure the agent schedule and data sources
          in your environment variables.
        </p>
      </div>
    </div>
  );
}

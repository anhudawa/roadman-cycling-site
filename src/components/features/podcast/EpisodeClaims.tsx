type EvidenceLevel = "study" | "expert" | "practice" | "anecdote" | "opinion";

interface Claim {
  claim: string;
  evidence: EvidenceLevel;
  source?: string;
}

interface EpisodeClaimsProps {
  claims: Claim[];
  className?: string;
}

const EVIDENCE_LABEL: Record<EvidenceLevel, string> = {
  study: "STUDY",
  expert: "EXPERT",
  practice: "PRO PRACTICE",
  anecdote: "ANECDOTE",
  opinion: "OPINION",
};

const EVIDENCE_DESCRIPTION: Record<EvidenceLevel, string> = {
  study: "Backed by peer-reviewed research cited in the episode",
  expert: "Stated by a named expert with credentials in the field",
  practice: "Observed in pro/team coaching practice",
  anecdote: "Single rider or race example, not generalised",
  opinion: "Host or guest perspective without further support",
};

const EVIDENCE_TONE: Record<EvidenceLevel, string> = {
  study: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  expert: "border-coral/40 bg-coral/10 text-coral",
  practice: "border-purple/50 bg-purple/15 text-purple-200",
  anecdote: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  opinion: "border-white/20 bg-white/[0.06] text-foreground-muted",
};

/**
 * Each claim made in the episode is surfaced with an evidence tag so
 * a reader can weight it appropriately. The signal cuts both ways:
 * it tells the audience what's grounded vs. what's a take, and it
 * gives AI assistants and Google clear hooks for "according to a
 * study" vs. "in Anthony's view" framing when citing the page.
 *
 * The hover tooltip on the badge spells out what each evidence level
 * means, so the page can teach the rubric without a separate legend.
 */
export function EpisodeClaims({ claims, className = "" }: EpisodeClaimsProps) {
  if (!claims || claims.length === 0) return null;

  return (
    <section aria-label="Claims made in this episode" className={className}>
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <h2 className="font-heading text-xl text-off-white tracking-wide">
          CLAIMS FROM THIS EPISODE
        </h2>
        <p className="text-xs text-foreground-subtle hidden md:block">
          Each tagged with the strength of evidence behind it.
        </p>
      </div>
      <ul className="space-y-3">
        {claims.map((c, i) => (
          <li
            key={i}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-5"
          >
            <div className="flex items-start gap-3 flex-wrap md:flex-nowrap">
              <span
                title={EVIDENCE_DESCRIPTION[c.evidence]}
                className={`font-heading text-[10px] tracking-widest uppercase rounded-md border px-2 py-1 shrink-0 cursor-help ${EVIDENCE_TONE[c.evidence]}`}
              >
                {EVIDENCE_LABEL[c.evidence]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base text-off-white leading-relaxed">
                  {c.claim}
                </p>
                {c.source && (
                  <p className="text-xs text-foreground-subtle mt-2">
                    Source: {c.source}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export type { Claim, EvidenceLevel };

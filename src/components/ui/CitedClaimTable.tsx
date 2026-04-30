import type { ReactNode } from "react";
import { EvidenceLevel, type EvidenceLevelType } from "./EvidenceLevel";

export interface CitedClaim {
  claim: string;
  roadmanPosition: string;
  evidenceSource: string;
  practicalImplication: string;
  evidenceLevel?: EvidenceLevelType;
}

interface CitedClaimTableProps {
  claims: CitedClaim[];
  heading?: string;
  caption?: ReactNode;
}

export function CitedClaimTable({
  claims,
  heading = "WHAT WE BELIEVE & WHY",
  caption,
}: CitedClaimTableProps) {
  if (!claims || claims.length === 0) return null;

  return (
    <section
      aria-label="Cited claims and Roadman positions"
      className="cited-claim-table my-10 not-prose"
    >
      <p className="font-heading text-coral text-xs tracking-widest mb-3">
        {heading}
      </p>
      {caption && (
        <p className="text-sm text-foreground-muted mb-6 max-w-2xl leading-relaxed">
          {caption}
        </p>
      )}

      <ol className="space-y-4 list-none p-0 m-0">
        {claims.map((c, i) => (
          <li
            key={i}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
          >
            <header className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 pb-4 border-b border-white/5">
              <h3 className="font-heading text-off-white text-base md:text-lg leading-snug uppercase tracking-wide m-0">
                <span className="text-coral mr-2">{String(i + 1).padStart(2, "0")}</span>
                {c.claim}
              </h3>
              {c.evidenceLevel && (
                <div className="shrink-0">
                  <EvidenceLevel level={c.evidenceLevel} />
                </div>
              )}
            </header>

            <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 m-0">
              <div className="m-0">
                <dt className="font-heading text-coral text-[10px] tracking-widest uppercase mb-1.5">
                  Roadman Position
                </dt>
                <dd className="text-off-white text-sm leading-relaxed m-0">
                  {c.roadmanPosition}
                </dd>
              </div>
              <div className="m-0">
                <dt className="font-heading text-coral text-[10px] tracking-widest uppercase mb-1.5">
                  Evidence Source
                </dt>
                <dd className="text-foreground-muted text-sm leading-relaxed m-0">
                  {c.evidenceSource}
                </dd>
              </div>
              <div className="m-0">
                <dt className="font-heading text-coral text-[10px] tracking-widest uppercase mb-1.5">
                  Practical Implication
                </dt>
                <dd className="text-foreground-muted text-sm leading-relaxed m-0">
                  {c.practicalImplication}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
    </section>
  );
}
